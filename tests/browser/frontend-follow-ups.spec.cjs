const { test, expect } = require("@playwright/test");
const { backend, signIn } = require("./support/backend.cjs");
test.use({ timezoneId: "Africa/Accra" });

async function openAssignments(page) {
  await page.goto("/admin/cohorts");
  await page.getByRole("button", { name: /^Manage/ }).click();
  await page.getByRole("button", { name: "Mentors", exact: true }).click();
  await page
    .getByRole("button", { name: "Assign Mentees", exact: true })
    .click();
  return page.getByRole("dialog", { name: "Assign Mentees", exact: true });
}

test("individual assignment saves only that mentee and persists on refresh; rejected saves stay unassigned", async ({
  page,
}) => {
  const state = await backend(page, "admin");
  state.users.push({
    id: "other-mentee",
    name: "Other Participant",
    role: "mentee",
    cohort_id: 1,
    email: "other@example.test",
  });
  await signIn(page, "admin");
  let dialog = await openAssignments(page);
  state.failAssignmentFor = "456b-mentee-uuid";
  await dialog
    .getByRole("button", { name: "Assign: Test Participant", exact: true })
    .click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "assignment could not be saved",
  );
  await expect(
    dialog.getByRole("button", {
      name: "Assign: Test Participant",
      exact: true,
    }),
  ).toBeEnabled();
  expect(state.users[0].mentor_id).toBeUndefined();
  expect(state.users[2].mentor_id).toBeUndefined();
  state.failAssignmentFor = null;
  await dialog
    .getByRole("button", { name: "Assign: Test Participant", exact: true })
    .dblclick();
  await expect(
    dialog.getByRole("button", {
      name: "Assigned: Test Participant",
      exact: true,
    }),
  ).toBeDisabled();
  expect(
    state.calls.filter((call) => call.path === "/v1/admin/assign-mentor"),
  ).toHaveLength(2);
  expect(state.users[0].mentor_id).toBe("123a-mentor-uuid");
  expect(state.users[2].mentor_id).toBeUndefined();
  await page.reload();
  await page.getByRole("button", { name: /^Manage/ }).click();
  await page.getByRole("button", { name: "Mentors", exact: true }).click();
  await page
    .getByRole("button", { name: "Assign Mentees", exact: true })
    .click();
  dialog = page.getByRole("dialog", { name: "Assign Mentees", exact: true });
  await expect(
    dialog.getByRole("button", {
      name: "Assigned: Test Participant",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(
    dialog.getByRole("button", {
      name: "Assign: Other Participant",
      exact: true,
    }),
  ).toBeEnabled();
  expect(state.unhandled).toEqual([]);
});

test("Assign All reassigns an existing mentee and retries only unfinished assignments after a partial failure", async ({
  page,
}) => {
  const state = await backend(page, "admin");
  state.users[0].mentor_id = "previous-mentor";
  state.users.push({
    id: "other-mentee",
    name: "Other Participant",
    role: "mentee",
    cohort_id: 1,
    email: "other@example.test",
  });
  state.failAssignmentFor = "other-mentee";
  await signIn(page, "admin");
  const dialog = await openAssignments(page);
  await dialog.getByRole("button", { name: "Assign All", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "assignment could not be saved",
  );
  await expect(
    dialog.getByRole("button", {
      name: "Assigned: Test Participant",
      exact: true,
    }),
  ).toBeDisabled();
  expect(
    state.calls.filter((call) => call.path === "/v1/admin/reassign-mentor"),
  ).toHaveLength(1);
  expect(state.users[2].mentor_id).toBeUndefined();
  state.failAssignmentFor = null;
  await dialog.getByRole("button", { name: "Assign All", exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(state.users[2].mentor_id).toBe("123a-mentor-uuid");
  expect(
    state.calls.filter((call) => call.path === "/v1/admin/reassign-mentor"),
  ).toHaveLength(1);
  expect(state.unhandled).toEqual([]);
});

test("mentor dashboard limits and sorts sessions by the displayed periods and uses mentee IDs for last-session text", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2030-10-16T12:00:00Z"));
  const state = await backend(page, "mentor");
  const session = (
    id,
    title,
    date,
    status = "scheduled",
    mentee = state.users[0],
  ) => ({ id, title, starts_at: date, status, mentorship_id: 1, mentee });
  state.sessions = [
    session(1, "Next Monday", "2030-10-21T00:00:00Z"),
    session(2, "Sunday night", "2030-10-20T23:59:59Z"),
    session(3, "Soon", "2030-10-16T12:00:00Z"),
    session(4, "Cancelled future", "2030-10-17T09:00:00Z", "cancelled"),
    session(5, "Too old", "2030-09-16T11:59:59Z", "completed"),
    session(6, "Thirty days", "2030-09-16T12:00:00Z", "completed"),
    session(7, "Recent completed", "2030-10-15T10:00:00Z", "completed"),
    session(8, "Cancelled past", "2030-10-15T11:00:00Z", "cancelled"),
    session(9, "Future completed", "2030-10-18T10:00:00Z", "completed"),
    session(10, "Someone else", "2030-10-16T10:00:00Z", "completed", {
      id: "different-user",
      name: "Test Participant",
    }),
  ];
  await signIn(page, "mentor");
  const upcoming = page
    .locator("div.bg-white")
    .filter({
      has: page.getByRole("heading", {
        name: "Upcoming sessions",
        exact: true,
      }),
    })
    .last();
  await expect(upcoming.locator("a")).toHaveCount(2);
  await expect(upcoming.locator("a").first()).toContainText("Soon");
  await expect(upcoming).not.toContainText("Next Monday");
  const past = page
    .locator("div.bg-white")
    .filter({
      has: page.getByRole("heading", { name: "Past sessions", exact: true }),
    })
    .last();
  await expect(
    past.locator("a").filter({ hasText: "Thirty days" }),
  ).toBeVisible();
  await expect(past).not.toContainText("Too old");
  await expect(past).not.toContainText("Cancelled past");
  const mentee = page.locator('a[href="/mentor/mentees/456b-mentee-uuid"]');
  await expect(mentee).toContainText("Last session 15 Oct 2030");
  await page.reload();
  await expect(upcoming.locator("a")).toHaveCount(2);
  expect(state.unhandled).toEqual([]);
});

test("an unavailable session history is not shown as an empty completed history", async ({
  page,
}) => {
  const state = await backend(page, "mentor");
  await page.route("**/backend-api/v1/sessions?*", (route) =>
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ message: "Session history is unavailable." }),
    }),
  );
  await signIn(page, "mentor");
  const mentee = page.locator('a[href="/mentor/mentees/456b-mentee-uuid"]');
  await expect(mentee).toContainText("Last session unavailable");
  await expect(mentee).not.toContainText("No completed session");
  expect(state.unhandled).toEqual([]);
});

test("the existing in-house meeting/location field is retained on error and included when saving", async ({
  page,
}) => {
  const state = await backend(page, "admin");
  await signIn(page, "admin");
  await page
    .getByRole("button", { name: "In-house Session", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "In-house Session",
    exact: true,
  });
  await dialog
    .getByLabel("Session Title", { exact: true })
    .fill("Workshop with a location");
  await dialog
    .getByLabel("Description", { exact: true })
    .fill("Existing form fields");
  await dialog.getByLabel("Date", { exact: true }).click();
  await dialog.getByLabel("Date", { exact: true }).fill("2030-10-20");
  await dialog.getByRole("button", { name: "10 : 00", exact: true }).click();
  await dialog
    .getByLabel("Cohort (optional)", { exact: true })
    .selectOption("1");
  await dialog
    .getByLabel("Meeting/location details", { exact: true })
    .fill("Room 5 / video room");
  state.failProgramSessions = true;
  await dialog
    .getByRole("button", { name: "Schedule Gathering", exact: true })
    .click();
  await expect(dialog.getByRole("alert")).toContainText("could not be saved");
  await expect(
    dialog.getByLabel("Meeting/location details", { exact: true }),
  ).toHaveValue("Room 5 / video room");
  state.failProgramSessions = false;
  await dialog
    .getByRole("button", { name: "Schedule Gathering", exact: true })
    .click();
  await expect(dialog).toBeHidden();
  expect(state.programSessions).toHaveLength(1);
  expect(state.programSessions[0]).toMatchObject({
    location: "Room 5 / video room",
    cohort_id: 1,
    starts_at: "2030-10-20T10:00:00.000Z",
    session_type: "workshop",
  });
  await page.reload();
  expect(state.unhandled).toEqual([]);
});
