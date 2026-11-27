const { test, expect } = require("@playwright/test");
const { backend, signIn } = require("./support/backend.cjs");
let errors;
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
});
test.afterEach(() => expect(errors).toEqual([]));

test("admin manages category names and activation with real reloads and rejected-save handling", async ({
  page,
}) => {
  const state = await backend(page, "admin");
  await signIn(page, "admin");
  await page.goto("/admin/settings");
  const section = page.getByRole("region", {
    name: "Goal categories",
    exact: true,
  });
  await section
    .getByRole("button", { name: "Add category", exact: true })
    .click();
  const add = page.getByRole("dialog", {
    name: "Add Goal Category",
    exact: true,
  });
  await add.getByLabel("Category name", { exact: true }).fill("Leadership");
  await add
    .getByLabel("Description (optional)", { exact: true })
    .fill("Lead a community project");
  state.failCategories = true;
  await add.getByRole("button", { name: "Add category", exact: true }).click();
  await expect(add.getByRole("alert")).toContainText(
    "Category name was rejected",
  );
  expect(state.categories).toHaveLength(1);
  state.failCategories = false;
  await add.getByRole("button", { name: "Add category", exact: true }).click();
  await expect(add).toBeHidden();
  let row = section.locator('[aria-label="Category Leadership"]');
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Edit", exact: true }).click();
  const edit = page.getByRole("dialog", {
    name: "Edit Goal Category",
    exact: true,
  });
  await edit
    .getByLabel("Category name", { exact: true })
    .fill("Community leadership");
  await edit.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(edit).toBeHidden();
  await page.reload();
  row = section.locator('[aria-label="Category Community leadership"]');
  await expect(row).toContainText("Lead a community project");
  await row.getByRole("button", { name: "Deactivate", exact: true }).click();
  const confirmation = page.getByRole("dialog", {
    name: "Deactivate category",
    exact: true,
  });
  state.failCategories = true;
  await confirmation
    .getByRole("button", { name: "Confirm deactivation", exact: true })
    .click();
  await expect(confirmation.getByRole("alert")).toContainText(
    "could not be saved",
  );
  expect(
    state.categories.find(
      (category) => category.name === "Community leadership",
    ).is_active,
  ).toBe(true);
  state.failCategories = false;
  await confirmation
    .getByRole("button", { name: "Confirm deactivation", exact: true })
    .click();
  await expect(confirmation).toBeHidden();
  await expect(row.getByText("Inactive", { exact: true })).toBeVisible();
  await page.reload();
  await expect(row.getByText("Inactive", { exact: true })).toBeVisible();
  await row.getByRole("button", { name: "Reactivate", exact: true }).click();
  await expect(row.getByText("Active", { exact: true })).toBeVisible();
  expect(
    state.calls.some(
      (call) =>
        call.method === "DELETE" && /goal-categories\/\d+$/.test(call.path),
    ),
  ).toBe(true);
  expect(state.unhandled).toEqual([]);
});

test("mentor publishes availability using local times, preserves rejected entries and cannot fake a booked-slot removal", async ({
  page,
}) => {
  const state = await backend(page, "mentor");
  await signIn(page, "mentor");
  await page.goto("/mentor/sessions");
  await page
    .getByRole("button", { name: "Manage availability", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Manage availability",
    exact: true,
  });
  await dialog
    .getByLabel("Start date and time", { exact: true })
    .fill("2030-10-21T14:00");
  await dialog
    .getByLabel("End date and time", { exact: true })
    .fill("2030-10-21T13:00");
  await dialog
    .getByRole("button", { name: "Publish availability", exact: true })
    .click();
  await expect(dialog.getByRole("alert")).toContainText("end must be after");
  expect(
    state.calls.filter(
      (call) =>
        call.path === "/v1/availability-slots" && call.method === "POST",
    ),
  ).toHaveLength(0);
  await dialog
    .getByLabel("End date and time", { exact: true })
    .fill("2030-10-21T15:00");
  state.failAvailability = true;
  await dialog
    .getByRole("button", { name: "Publish availability", exact: true })
    .click();
  await expect(dialog.getByRole("alert")).toContainText("overlaps");
  await expect(
    dialog.getByLabel("Start date and time", { exact: true }),
  ).toHaveValue("2030-10-21T14:00");
  expect(state.slots).toHaveLength(1);
  state.failAvailability = false;
  await dialog
    .getByRole("button", { name: "Publish availability", exact: true })
    .click();
  await expect(
    dialog.getByText("Availability published.", { exact: true }),
  ).toBeVisible();
  const sent = state.calls
    .filter(
      (call) =>
        call.path === "/v1/availability-slots" && call.method === "POST",
    )
    .at(-1).body;
  const expected = await page.evaluate(() => ({
    starts_at: new Date("2030-10-21T14:00").toISOString(),
    ends_at: new Date("2030-10-21T15:00").toISOString(),
    duration_minutes: 60,
  }));
  expect(sent).toEqual(expected);
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await page.reload();
  await page
    .getByRole("button", { name: "Manage availability", exact: true })
    .click();
  await expect(
    dialog.getByRole("button", { name: "Remove slot", exact: true }),
  ).toHaveCount(2);
  await dialog
    .getByRole("button", { name: "Remove slot", exact: true })
    .last()
    .click();
  state.failSlotDelete = true;
  await dialog
    .getByRole("button", { name: "Confirm removal", exact: true })
    .click();
  await expect(dialog.getByRole("alert")).toContainText("booked slot");
  expect(state.slots).toHaveLength(2);
  state.failSlotDelete = false;
  await dialog
    .getByRole("button", { name: "Confirm removal", exact: true })
    .click();
  await expect(
    dialog.getByText("Availability removed.", { exact: true }),
  ).toBeVisible();
  expect(state.slots.map((slot) => slot.id)).toEqual([12]);
  expect(state.unhandled).toEqual([]);
});

test("mentor saves a session log from list and calendar details without losing rejected notes", async ({
  page,
}) => {
  const state = await backend(page, "mentor");
  state.sessions.push({
    id: 21,
    title: "Career planning",
    starts_at: "2030-10-21T10:00:00Z",
    ends_at: "2030-10-21T11:00:00Z",
    status: "scheduled",
    discussion_summary: "Existing discussion",
    action_points: "Initial action",
    follow_up_notes: "Initial follow-up",
  });
  await signIn(page, "mentor");
  await page.goto("/mentor/sessions");
  await page
    .getByRole("heading", { name: "Career planning", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Session details",
    exact: true,
  });
  await expect(
    dialog.getByLabel("Discussion summary", { exact: true }),
  ).toHaveValue("Existing discussion");
  await dialog
    .getByLabel("Discussion summary", { exact: true })
    .fill("Discussed career options");
  await dialog
    .getByLabel("Action points", { exact: true })
    .fill("Write a career plan");
  await dialog
    .getByLabel("Follow-up notes", { exact: true })
    .fill("Review next week");
  state.failSessionLog = true;
  await dialog
    .getByRole("button", { name: "Save notes & mark completed", exact: true })
    .click();
  await expect(dialog.getByRole("alert")).toContainText("could not be saved");
  await expect(dialog.getByLabel("Action points", { exact: true })).toHaveValue(
    "Write a career plan",
  );
  expect(state.sessions[0].status).toBe("scheduled");
  state.failSessionLog = false;
  await dialog
    .getByRole("button", { name: "Save notes & mark completed", exact: true })
    .click();
  await expect(dialog.getByRole("status")).toHaveText("Session notes saved.");
  await expect(
    dialog.getByRole("button", { name: "Save notes", exact: true }),
  ).toBeVisible();
  expect(
    state.calls.find(
      (call) => call.path === "/v1/sessions/21/log" && call.method === "PATCH",
    ).body,
  ).toEqual({
    discussion_summary: "Discussed career options",
    action_points: "Write a career plan",
    follow_up_notes: "Review next week",
    status: "completed",
  });
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await page.reload();
  await page
    .getByRole("heading", { name: "Career planning", exact: true })
    .click();
  await expect(
    dialog.getByLabel("Follow-up notes", { exact: true }),
  ).toHaveValue("Review next week");
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await page.clock.setFixedTime(new Date("2030-10-21T08:00:00Z"));
  await page.reload();
  await page.getByRole("button", { name: /^View Calendar/ }).click();
  await page.getByText("Career planning", { exact: true }).click();
  await expect(
    dialog.getByLabel("Discussion summary", { exact: true }),
  ).toHaveCount(1);
  await expect(
    dialog.getByLabel("Discussion summary", { exact: true }),
  ).toHaveValue("Discussed career options");
  expect(state.unhandled).toEqual([]);
});

test("mentee edits and completes the selected goal, then removes only that goal", async ({
  page,
}) => {
  const state = await backend(page, "mentee");
  state.categories.push({
    id: 9,
    name: "Old category",
    description: "Historical category",
    is_active: false,
  });
  state.goals.push(
    {
      id: 41,
      title: "First goal",
      description: "Keep my dates",
      goal_category_id: 9,
      goal_category: { id: 9, name: "Old category" },
      start_date: "2026-01-01",
      end_date: "2030-12-31",
      status: "in_progress",
    },
    {
      id: 42,
      title: "Another goal",
      description: "Leave this alone",
      goal_category_id: 7,
      status: "not_started",
    },
  );
  await signIn(page, "mentee");
  await page.goto("/mentee/goals");
  await page
    .getByRole("button", { name: "Edit goal First goal", exact: true })
    .click();
  const editor = page.getByRole("dialog", { name: "Edit Goal", exact: true });
  await expect(editor.getByLabel("Category", { exact: true })).toHaveValue("9");
  await editor.getByLabel("Title", { exact: true }).fill("Revised first goal");
  await editor
    .getByLabel("Description", { exact: false })
    .fill("A changed description");
  state.failGoalChanges = true;
  await editor
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await expect(editor.getByRole("alert")).toContainText("could not be saved");
  expect(state.goals[0].title).toBe("First goal");
  state.failGoalChanges = false;
  await editor
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await expect(editor).toBeHidden();
  const update = state.calls
    .filter((call) => call.path === "/v1/goals/41" && call.method === "PUT")
    .at(-1).body;
  expect(update).toEqual({
    title: "Revised first goal",
    description: "A changed description",
  });
  expect(state.goals[0].end_date).toBe("2030-12-31");
  await page
    .getByLabel("Status for Revised first goal", { exact: true })
    .selectOption("completed");
  await expect(
    page.getByRole("article", { name: "Revised first goal", exact: true }),
  ).toContainText("100%");
  await page.reload();
  await expect(
    page.getByLabel("Status for Revised first goal", { exact: true }),
  ).toHaveValue("completed");
  await page
    .getByRole("button", {
      name: "Remove goal Revised first goal",
      exact: true,
    })
    .click();
  const remove = page.getByRole("dialog", { name: "Remove goal", exact: true });
  state.failGoalChanges = true;
  await remove
    .getByRole("button", { name: "Confirm removal", exact: true })
    .click();
  await expect(remove.getByRole("alert")).toContainText("could not be saved");
  expect(state.goals).toHaveLength(2);
  state.failGoalChanges = false;
  await remove
    .getByRole("button", { name: "Confirm removal", exact: true })
    .click();
  await expect(remove).toBeHidden();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Another goal", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Revised first goal", exact: true }),
  ).toHaveCount(0);
  expect(state.goals.map((goal) => goal.id)).toEqual([42]);
  await page.getByRole("button", { name: "New Goal", exact: true }).click();
  await expect(
    page
      .getByRole("dialog", { name: "New Goal", exact: true })
      .getByRole("option", { name: "Old category", exact: true }),
  ).toHaveCount(0);
  expect(state.unhandled).toEqual([]);
});

test("mentee can read returned session notes without mentor completion controls", async ({
  page,
}) => {
  const state = await backend(page, "mentee");
  state.sessions.push({
    id: 21,
    title: "Completed meeting",
    starts_at: "2026-01-01T10:00:00Z",
    status: "completed",
    discussion_summary: "Agreed the next goal",
    action_points: "Write the plan",
  });
  await signIn(page, "mentee");
  await page.goto("/mentee/sessions");
  await page
    .getByRole("heading", { name: "Completed meeting", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Session details",
    exact: true,
  });
  await expect(
    dialog.getByText("Write the plan", { exact: true }),
  ).toBeVisible();
  await expect(dialog.getByRole("textbox")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Manage availability", exact: true }),
  ).toHaveCount(0);
  expect(state.calls.some((call) => call.method === "PATCH")).toBe(false);
  expect(state.unhandled).toEqual([]);
});

test("mentor availability fits a narrow viewport and retains focus while entering times", async ({
  page,
}) => {
  await backend(page, "mentor");
  await signIn(page, "mentor");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/mentor/sessions");
  await page
    .getByRole("button", { name: "Manage availability", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Manage availability",
    exact: true,
  });
  await dialog
    .getByLabel("Start date and time", { exact: true })
    .fill("2030-10-21T14:00");
  await expect(
    dialog.getByLabel("Start date and time", { exact: true }),
  ).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});
