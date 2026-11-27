const { test, expect } = require("@playwright/test");
const { backend, signIn } = require("./support/backend.cjs");
let errors;
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
});
test.afterEach(() => expect(errors).toEqual([]));

for (const role of ["admin", "mentor", "mentee"]) {
  test(`${role} keeps the recovered dashboard sections and its subsequent page layouts`, async ({
    page,
  }) => {
    test.setTimeout(300000);
    const state = await backend(page, role);
    await signIn(page, role);
    const headings =
      role === "admin"
        ? ["Active cohorts", "Engagement this month", "Quiet participants"]
        : role === "mentor"
          ? [
              "Your circle",
              "Upcoming sessions",
              "Past sessions",
              "Meeting requests",
            ]
          : ["What you're working on", "Your Mentor", "Your journal"];
    for (const name of headings)
      await expect(
        page.getByRole("heading", { name, exact: true }),
      ).toBeVisible();
    await page.screenshot({
      path: `test-results/restored-${role}-dashboard.png`,
      fullPage: true,
    });
    const paths =
      role === "admin"
        ? [
            "users",
            "cohorts",
            "reports",
            "settings",
            "certificates",
            "notifications",
          ]
        : role === "mentor"
          ? [
              "mentees",
              "goals",
              "sessions",
              "reflections",
              "profile",
              "feedback",
              "certificates",
              "settings",
              "notifications",
            ]
          : [
              "goals",
              "sessions",
              "reflections",
              "mentors",
              "profile",
              "leaderboard",
              "certificates",
              "settings",
              "notifications",
            ];
    for (const path of paths) {
      await page.goto(`/${role}/${path}`);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("body")).not.toContainText("Application error");
      await expect(page.locator("body")).not.toContainText("Amara Okoye");
      await expect(page.locator("body")).not.toContainText("Daphne Smith");
      if (path === "settings")
        await expect(
          page.getByRole("heading", { name: "Change password", exact: true }),
        ).toHaveCount(0);
    }
    expect(state.unhandled).toEqual([]);
  });
}

test("original goal form saves the visible fields and keeps rejected entries open", async ({
  page,
}) => {
  const state = await backend(page, "mentee");
  await signIn(page, "mentee");
  await page.goto("/mentee/goals");
  await page.getByRole("button", { name: "New Goal", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "New Goal" });
  await dialog.getByLabel("Title", { exact: true }).fill("Publish a portfolio");
  await dialog.getByLabel("Category", { exact: true }).selectOption("7");
  await dialog
    .getByLabel("Description", { exact: false })
    .fill("Finish three case studies");
  await dialog.getByRole("button", { name: "Add Goal", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "Publish a portfolio" }),
  ).toBeVisible();
  const body = state.calls.find(
    (call) => call.path === "/v1/goals" && call.method === "POST",
  ).body;
  expect(body).toEqual({
    title: "Publish a portfolio",
    description: "Finish three case studies",
    goal_category_id: 7,
    status: "not_started",
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Publish a portfolio" }),
  ).toBeVisible();
  state.failGoals = true;
  await page.getByRole("button", { name: "New Goal", exact: true }).click();
  await dialog.getByLabel("Title", { exact: true }).fill("Rejected goal");
  await dialog.getByLabel("Category", { exact: true }).selectOption("7");
  await dialog.getByRole("button", { name: "Add Goal", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "This title was rejected.",
  );
  expect(state.goals).toHaveLength(1);
  expect(state.unhandled).toEqual([]);
});

test("reflection composer saves real text while unsupported moods and mentor messages remain unavailable", async ({
  page,
}) => {
  const state = await backend(page, "mentee");
  await signIn(page, "mentee");
  await page.goto("/mentee/reflections");
  await page
    .getByPlaceholder("What is settling in this week?...")
    .fill("A reflection saved to the service.");
  await expect(
    page.getByRole("button", { name: "Clear", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Send Reflection", exact: true })
    .click();
  await expect(
    page.getByText("A reflection saved to the service.", { exact: true }),
  ).toBeVisible();
  expect(state.reflections[0].body).toBe("A reflection saved to the service.");
  expect(state.reflections[0]).not.toHaveProperty("mood");
  await page.reload();
  await expect(
    page.getByText("A reflection saved to the service.", { exact: true }),
  ).toBeVisible();
  expect(state.unhandled).toEqual([]);
});

test("booking uses real date and time buttons from availability without changing the modal layout", async ({
  page,
}) => {
  const state = await backend(page, "mentee");
  await signIn(page, "mentee");
  await page.goto("/mentee/sessions");
  await page.getByRole("button", { name: "Book Session", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Book Session" });
  await dialog.getByLabel("Topic", { exact: true }).fill("Career check-in");
  const starts = state.slots[0].starts_at;
  const selection = await page.evaluate((value) => {
    const d = new Date(value);
    return {
      date: [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0"),
      ].join("-"),
      time: d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }, starts);
  await dialog.getByLabel("Date", { exact: true }).fill(selection.date);
  await dialog
    .getByRole("button", { name: selection.time, exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Book Session", exact: true })
    .click();
  await expect(dialog).toBeHidden();
  await expect(
    page.getByText("Career check-in", { exact: true }),
  ).toBeVisible();
  expect(state.sessions[0].availability_slot_id).toBe(12);
  expect(state.unhandled).toEqual([]);
});

test("restored calendar uses real dates and session counts in day, month and year views", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2030-10-20T08:00:00Z"));
  const state = await backend(page, "mentee");
  state.sessions.push({
    id: 31,
    title: "Sunday mentoring",
    starts_at: "2030-10-20T10:00:00Z",
    ends_at: "2030-10-20T11:00:00Z",
    status: "scheduled",
  });
  await signIn(page, "mentee");
  await page.goto("/mentee/sessions");
  await expect(
    page.getByRole("heading", { name: "Sunday mentoring", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^View Calendar/ }).click();
  await page.getByRole("button", { name: "Day", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Sunday, October 20, 2030",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Sunday mentoring", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Next date range", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Monday, October 21, 2030",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText("Sunday mentoring", { exact: true })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Month", exact: true }).click();
  await expect(page.getByText("October 2030", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Next date range", exact: true })
    .click();
  await expect(page.getByText("November 2030", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Year", exact: true }).click();
  const october = page
    .getByRole("heading", { name: "Oct 2030", exact: true })
    .locator("..");
  await expect(october).toContainText("1 sessions");
  await expect(
    page.getByRole("heading", { name: "Sep 2030", exact: true }).locator(".."),
  ).toContainText("0 sessions");
  expect(state.unhandled).toEqual([]);
});

test("admin adds a mentee with a password, refreshes the real list, and keeps passwords out of storage", async ({
  page,
}) => {
  const state = await backend(page, "admin");
  await signIn(page, "admin");
  await page.goto("/admin/users");
  await page.getByRole("button", { name: "Add User", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add a user", exact: true });
  await expect(dialog).not.toContainText("Send Invite");
  await dialog.getByLabel("First name", { exact: true }).fill("New");
  await dialog.getByLabel("Last name", { exact: true }).fill("Participant");
  await dialog.getByLabel("Email", { exact: true }).fill("new@example.test");
  await dialog
    .getByLabel("Password", { exact: true })
    .fill("OfflineMentee123!");
  await dialog
    .getByLabel("Confirm password", { exact: true })
    .fill("DoesNotMatch123!");
  await dialog.getByRole("button", { name: "Add user", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "passwords do not match",
  );
  expect(
    state.calls.filter(
      (call) => call.path === "/v1/admin/users" && call.method === "POST",
    ),
  ).toHaveLength(0);
  await dialog
    .getByLabel("Confirm password", { exact: true })
    .fill("OfflineMentee123!");
  await dialog.getByRole("button", { name: "Add user", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("status")).toContainText(
    "New Participant was added",
  );
  await expect(
    page.getByText("New Participant", { exact: true }),
  ).toBeVisible();
  expect(
    state.calls.find(
      (call) => call.path === "/v1/admin/users" && call.method === "POST",
    ).body,
  ).toEqual({
    first_name: "New",
    last_name: "Participant",
    name: "New Participant",
    email: "new@example.test",
    role: "mentee",
    password: "OfflineMentee123!",
    password_confirmation: "OfflineMentee123!",
    journey_year: 1,
  });
  expect(
    await page.evaluate(
      () => JSON.stringify(localStorage) + JSON.stringify(sessionStorage),
    ),
  ).not.toContain("OfflineMentee123!");
  await page.reload();
  await expect(
    page.getByText("New Participant", { exact: true }),
  ).toBeVisible();
  expect(state.unhandled).toEqual([]);
});

test("admin can create a mentor in a cohort and sees failures inside the add-user modal", async ({
  page,
}) => {
  const state = await backend(page, "admin");
  await signIn(page, "admin");
  await page.goto("/admin/users");
  await page.getByRole("button", { name: "Add User", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add a user", exact: true });
  await dialog.getByLabel("First name", { exact: true }).fill("New");
  await dialog.getByLabel("Last name", { exact: true }).fill("Mentor");
  await dialog
    .getByLabel("Email", { exact: true })
    .fill("newmentor@example.test");
  await dialog.getByLabel("Role", { exact: true }).selectOption("mentor");
  await dialog
    .getByLabel("Cohort (optional)", { exact: true })
    .selectOption("1");
  await expect(
    dialog.getByLabel("Program (optional)", { exact: true }),
  ).toHaveValue("1");
  await dialog
    .getByLabel("Password", { exact: true })
    .fill("OfflineMentor123!");
  await dialog
    .getByLabel("Confirm password", { exact: true })
    .fill("OfflineMentor123!");
  state.createUserFailure = true;
  await dialog.getByRole("button", { name: "Add user", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("active subscription");
  await expect(dialog.getByLabel("Email", { exact: true })).toHaveValue(
    "newmentor@example.test",
  );
  expect(state.users).toHaveLength(2);
  state.createUserFailure = false;
  await dialog.getByRole("button", { name: "Add user", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText("New Mentor", { exact: true })).toBeVisible();
  const body = state.calls
    .filter((call) => call.path === "/v1/admin/users" && call.method === "POST")
    .at(-1).body;
  expect(body.role).toBe("mentor");
  expect(body.cohort_id).toBe(1);
  expect(body).not.toHaveProperty("program_id");
  expect(body).not.toHaveProperty("note");
  expect(state.unhandled).toEqual([]);
});

test("add-user modal fits mobile, traps focus, and clears password entries when closed", async ({
  page,
}) => {
  await backend(page, "admin");
  await signIn(page, "admin");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin/users");
  await page.getByRole("button", { name: "Add User", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add a user", exact: true });
  await dialog.getByLabel("Password", { exact: true }).fill("OfflineOnly123!");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await dialog.getByRole("button", { name: "Add user", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(
    dialog.getByRole("button", { name: "Close Add user", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await page.getByRole("button", { name: "Add User", exact: true }).click();
  await expect(dialog.getByLabel("Password", { exact: true })).toHaveValue("");
});

test("admin program fields preserve rejected statuses and save a supported status; report exports real CSV", async ({
  page,
}) => {
  const state = await backend(page, "admin");
  await signIn(page, "admin");
  await page.goto("/admin/settings");
  await page
    .getByLabel("Program Name", { exact: true })
    .fill("Restored Program");
  await page
    .getByLabel("Application form link", { exact: true })
    .fill("https://example.test/apply");
  await page.getByRole("button", { name: "Save Program", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "The selected status is invalid.",
  );
  await expect(page.getByLabel("Program Name", { exact: true })).toHaveValue(
    "Restored Program",
  );
  await page.getByLabel("Status", { exact: true }).selectOption("Active");
  await page.getByRole("button", { name: "Save Program", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Restored Program", exact: true }),
  ).toBeVisible();
  expect(state.programs).toHaveLength(2);
  await page.goto("/admin/reports");
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download engagement CSV", exact: true })
    .click();
  expect((await downloaded).suggestedFilename()).toBe(
    "masterclass-engagement.csv",
  );
  expect(state.unhandled).toEqual([]);
});

test("in-house session failure stays in the original modal without a success claim", async ({
  page,
}) => {
  const state = await backend(page, "admin");
  state.failProgramSessions = true;
  await signIn(page, "admin");
  await page
    .getByRole("button", { name: "In-house Session", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "In-house Session" });
  await dialog
    .getByLabel("Session Title", { exact: true })
    .fill("Cohort gathering");
  const date = dialog.getByLabel("Date", { exact: true });
  await date.click();
  await date.fill("2030-10-20");
  await dialog.getByRole("button", { name: /Schedule|Create|Save/ }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "Program sessions could not be saved.",
  );
  await expect(dialog).toBeVisible();
  expect(state.programSessions).toHaveLength(0);
  expect(state.unhandled).toEqual([]);
});

test("restored profile fields persist supported edits and keep identity fields read-only", async ({
  page,
}) => {
  const state = await backend(page, "mentee");
  await signIn(page, "mentee");
  await page.goto("/mentee/profile");
  await expect(page.getByLabel("Full Name", { exact: true })).toHaveAttribute(
    "readonly",
    "",
  );
  await page.getByLabel("Preferred Name", { exact: true }).fill("Taylor");
  await page.getByLabel("City", { exact: true }).fill("Accra");
  await page.getByLabel("Country", { exact: true }).fill("Ghana");
  await page
    .getByLabel("Short Bio", { exact: true })
    .fill("A real profile update.");
  await page.getByRole("button", { name: "Save Changes", exact: true }).click();
  await expect(page.getByText("Profile saved.", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Preferred Name", { exact: true })).toHaveValue(
    "Taylor",
  );
  expect(state.profileFields).toEqual({
    preferred_name: "Taylor",
    city: "Accra",
    country: "Ghana",
    bio: "A real profile update.",
  });
  expect(state.unhandled).toEqual([]);
});

test("restored cohort detail assigns full user IDs and reads the refreshed roster", async ({
  page,
}) => {
  const state = await backend(page, "admin");
  await signIn(page, "admin");
  await page.goto("/admin/cohorts");
  await page.getByRole("button", { name: /^Manage/ }).click();
  await expect(
    page.getByRole("heading", { name: "Test Cohort", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mentors", exact: true }).click();
  await page
    .getByRole("button", { name: "Assign Mentees", exact: true })
    .click();
  await page.getByRole("button", { name: "Assign All", exact: true }).click();
  await expect
    .poll(
      () =>
        state.calls.filter((call) => call.path === "/v1/admin/assign-mentor")
          .length,
    )
    .toBe(1);
  expect(
    state.calls.find((call) => call.path === "/v1/admin/assign-mentor").body,
  ).toEqual({ mentee_id: "456b-mentee-uuid", mentor_id: "123a-mentor-uuid" });
  expect(state.unhandled).toEqual([]);
});

test("mobile restored goal form stays within the viewport and retains typing focus", async ({
  page,
}) => {
  await backend(page, "mentee");
  await signIn(page, "mentee");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/mentee/goals");
  await page.getByRole("button", { name: "New Goal", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "New Goal" });
  const title = dialog.getByLabel("Title", { exact: true });
  await title.pressSequentially("A meaningful goal", { delay: 10 });
  await expect(title).toBeFocused();
  await expect(title).toHaveValue("A meaningful goal");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/restored-goal-mobile.png",
    fullPage: true,
  });
});
