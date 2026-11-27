const { test, expect } = require("@playwright/test");
const { backend, signIn } = require("./support/backend.cjs");
let errors;
test.beforeEach(({ page }) => {
  errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
});
test.afterEach(() => expect(errors).toEqual([]));

for (const role of ["admin", "mentor", "mentee"]) {
  test(`${role} reads server notifications without faking read-status writes`, async ({
    page,
  }) => {
    const state = await backend(page, role);
    state.notifications = [
      {
        id: "n1",
        data: {
          title: "Session reminder",
          message: "Your booked session is tomorrow.",
          type: "session",
        },
        read_at: null,
        created_at: "2026-11-08T10:00:00Z",
      },
      {
        id: "n2",
        data: { title: "Goal completed", body: "Well done.", type: "goal" },
        read_at: "2026-11-08T09:00:00Z",
        created_at: "2026-11-08T08:00:00Z",
      },
    ];
    await signIn(page, role);
    await page.goto(`/${role}/notifications`);
    await expect(
      page.getByRole("heading", { name: "Session reminder", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Goal completed", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Mark all/ })).toBeDisabled();
    if (role !== "mentor") {
      await page
        .getByRole("button", { name: "Unread (1)", exact: true })
        .click();
      await expect(
        page.getByRole("heading", { name: "Goal completed", exact: true }),
      ).toHaveCount(0);
      await page.getByPlaceholder("Search notifications...").fill("missing");
      await expect(page.getByText(/^No notifications found\.?$/)).toBeVisible();
    }
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Session reminder", exact: true }),
    ).toBeVisible();
    expect(
      state.calls
        .filter((c) => c.path.includes("notifications"))
        .every((c) => c.method === "GET"),
    ).toBe(true);
    expect(state.unhandled).toEqual([]);
  });
}

test("notifications expose a failed load and retry instead of claiming an empty history", async ({
  page,
}) => {
  const state = await backend(page, "mentee");
  state.failNotifications = true;
  await signIn(page, "mentee");
  await page.goto("/mentee/notifications");
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Notifications could not be loaded.",
  );
  await expect(
    page.getByText("No notifications found.", { exact: true }),
  ).toHaveCount(0);
  state.failNotifications = false;
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(
    page.getByText("No notifications found.", { exact: true }),
  ).toBeVisible();
});

test("global search queries the API and routes a returned mentee safely", async ({
  page,
}) => {
  const state = await backend(page, "mentor");
  state.searchResults = [
    {
      id: "456b-mentee-uuid",
      type: "mentee",
      title: "Found Participant",
      subtitle: "Assigned mentee",
    },
  ];
  await signIn(page, "mentor");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Search", exact: true });
  await dialog.getByLabel("Search the platform").fill("Participant & career");
  await expect(
    dialog.getByRole("link", { name: /Found Participant/ }),
  ).toBeVisible();
  expect(state.calls.find((c) => c.path === "/v1/search").params.q).toBe(
    "Participant & career",
  );
  await dialog.getByRole("link", { name: /Found Participant/ }).click();
  await expect(page).toHaveURL("/mentor/mentees/456b-mentee-uuid");
  expect(state.unhandled).toEqual([]);
});

test("mentee certificate preview, sharing, download and request use returned records", async ({
  page,
}) => {
  const state = await backend(page, "mentee");
  state.certificates = [
    {
      id: 11,
      title: "Actual Certificate",
      status: "issued",
      issued_at: "2026-11-08",
      reference: "ACT-11",
      user: { id: "mentee-user-uuid", name: "Real Recipient" },
      description: "Actual achievement",
      criteria: [{ label: "Actual criterion", completed: true }],
    },
    {
      id: 12,
      title: "Available Certificate",
      status: "eligible",
      description: "An eligible award",
    },
  ];
  state.certificateSummary = { earned: 1, available_to_unlock: 1 };
  await signIn(page, "mentee");
  await page.goto("/mentee/certificates");
  await expect(
    page.getByRole("heading", { name: "Actual Certificate", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Certificate preview" });
  await expect(
    dialog.getByText("Real Recipient", { exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByText("Actual achievement", { exact: true }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await dialog
    .getByRole("button", { name: "Download PDF", exact: true })
    .click();
  expect((await download).suggestedFilename()).toBe("certificate-11.pdf");
  await dialog.getByRole("button", { name: "Share", exact: true }).click();
  await expect(
    dialog.getByRole("link", {
      name: "https://example.test/shared-certificate",
    }),
  ).toBeVisible();
  // Close via the existing preview header button.
  await dialog.locator("button").first().click();
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "https://example.test/shared-certificate" }),
  ).toBeVisible();
  state.failCertificateRequest = true;
  await page
    .getByRole("button", { name: "Request Certificate", exact: true })
    .click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Certificate request rejected.",
  );
  expect(state.certificates[1].status).toBe("eligible");
  state.failCertificateRequest = false;
  await page
    .getByRole("button", { name: "Request Certificate", exact: true })
    .click();
  await expect(
    page.getByText("Certificate request submitted.", { exact: true }),
  ).toBeVisible();
  expect(state.certificates[1].status).toBe("requested");
  expect(state.unhandled).toEqual([]);
});

test("admin issuing retries only unfinished recipients after a partial failure", async ({
  page,
}) => {
  const state = await backend(page, "admin");
  state.users.push({
    id: "second-mentee",
    name: "Second Participant",
    email: "second@example.test",
    role: "mentee",
  });
  state.failCertificateUser = "second-mentee";
  await signIn(page, "admin");
  await page.goto("/admin/certificates");
  await page
    .getByRole("button", { name: "Issue Certificate", exact: true })
    .click();
  await page.getByRole("button", { name: "Select All", exact: true }).click();
  await page
    .getByLabel("Certificate Title", { exact: true })
    .fill("API-issued award");
  await page
    .getByRole("button", { name: "Issue Certificate", exact: true })
    .click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Certificate issue rejected.",
  );
  expect(state.issuedCertificates).toHaveLength(1);
  state.failCertificateUser = null;
  await page
    .getByRole("button", { name: "Issue Certificate", exact: true })
    .click();
  await expect(
    page.getByText("1 certificate issued.", { exact: true }),
  ).toBeVisible();
  expect(state.issuedCertificates).toHaveLength(2);
  expect(
    state.calls.filter(
      (c) =>
        c.path === "/v1/admin/certificates" &&
        c.method === "POST" &&
        c.body.user_id === "456b-mentee-uuid",
    ),
  ).toHaveLength(1);
  await page.reload();
  await expect(
    page.getByRole("cell", { name: "API-issued award", exact: true }),
  ).toHaveCount(2);
  expect(state.unhandled).toEqual([]);
});

test("mentor date booking sends the selected mentee and preserves rejected entries", async ({
  page,
}) => {
  const state = await backend(page, "mentor");
  state.failDateBooking = true;
  await signIn(page, "mentor");
  await page.goto("/mentor/mentees/456b-mentee-uuid");
  await page.getByRole("button", { name: "Book Session", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Book Session" });
  await dialog.getByLabel("Topic", { exact: true }).fill("Career review");
  await dialog.getByLabel("Date", { exact: true }).focus();
  await dialog.getByLabel("Date", { exact: true }).fill("2030-11-12");
  await dialog.getByLabel("Time", { exact: true }).fill("10:00");
  await dialog
    .getByRole("button", { name: "Book Session", exact: true })
    .click();
  await expect(dialog.getByRole("alert")).toContainText("Booking rejected.");
  await expect(dialog.getByLabel("Topic", { exact: true })).toHaveValue(
    "Career review",
  );
  state.failDateBooking = false;
  await dialog
    .getByRole("button", { name: "Book Session", exact: true })
    .click();
  await expect(dialog).toBeHidden();
  expect(state.sessions).toHaveLength(1);
  expect(state.sessions[0]).toMatchObject({
    mentee_id: "456b-mentee-uuid",
    mentor_id: "mentor-user-uuid",
    topic: "Career review",
    session_type: "mentorship",
    date: "2030-11-12",
    time: "10:00",
  });
  expect(state.unhandled).toEqual([]);
});

test("prefixed session IDs keep the mentor notes controls connected", async ({
  page,
}) => {
  const state = await backend(page, "mentor");
  state.sessions.push({
    id: "mentorship:21",
    title: "Prefixed session",
    starts_at: "2030-11-12T10:00:00Z",
    status: "scheduled",
  });
  await signIn(page, "mentor");
  await page.goto("/mentor/sessions");
  await page.getByText("Prefixed session", { exact: true }).first().click();
  await page
    .getByLabel("Discussion summary", { exact: true })
    .fill("Real notes for a prefixed ID");
  await page.getByRole("button", { name: /Save.*complete/i }).click();
  await expect(
    page.getByText("Session notes saved.", { exact: true }),
  ).toBeVisible();
  expect(
    state.calls.some(
      (c) =>
        c.path === "/v1/sessions/mentorship%3A21/log" && c.method === "PATCH",
    ),
  ).toBe(true);
  expect(state.unhandled).toEqual([]);
});
