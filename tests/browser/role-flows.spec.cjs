const { test, expect } = require("@playwright/test");
const { backend, signIn } = require("./support/backend.cjs");
async function fillOnboardingProfile(page) {
  await page
    .getByLabel("Short Bio", { exact: true })
    .fill("Learning and growing through mentorship.");
  await page.getByLabel("Country", { exact: true }).selectOption("GH");
  await page.getByLabel("Occupation", { exact: true }).selectOption("student");
  await page.getByLabel("Phone Number", { exact: true }).fill("503425679");
}
let errors;
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
});
test.afterEach(() => expect(errors).toEqual([]));
for (const mustChange of [false, true]) {
  test(`admin bypasses onboarding with password flag ${mustChange}`, async ({
    page,
  }) => {
    const state = await backend(page, "admin", { mustChange });
    const visited = [];
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame())
        visited.push(new URL(frame.url()).pathname);
    });
    await signIn(page, "admin", { mustChange });
    await expect(
      page.getByRole("heading", { name: "Active cohorts", exact: true }),
    ).toBeVisible();
    expect(visited).not.toContain("/onboarding");
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Active cohorts", exact: true }),
    ).toBeVisible();
    await expect(page).toHaveURL("/admin/dashboard");
    for (const route of ["/onboarding", "/reset-password"]) {
      await page.goto(route);
      await expect(page).toHaveURL("/admin/dashboard");
      await expect(
        page.getByRole("heading", { name: "Welcome to LEAGLESHIP" }),
      ).toHaveCount(0);
    }
    const session = await page.evaluate(
      () => JSON.parse(sessionStorage.getItem("vision2535_auth_session")).state,
    );
    expect(session.user.mustChangePassword).toBe(mustChange);
    expect(
      state.calls.some((call) => call.path === "/settings/account/password"),
    ).toBe(false);
    expect(state.unhandled).toEqual([]);
  });
}

for (const role of ["mentor", "mentee"]) {
  test(`${role} completes first-login onboarding before accessing dashboards`, async ({
    page,
  }) => {
    const state = await backend(page, role, { mustChange: true });
    await signIn(page, role, { mustChange: true });
    await expect(
      page.getByRole("heading", {
        name: "Begin a Journey That Lasts a Lifetime",
      }),
    ).toBeVisible();
    await expect(
      page.getByAltText("Onboarding", { exact: true }),
    ).toBeVisible();
    if (role === "mentor")
      await page.screenshot({
        path: "test-results/onboarding-restored.png",
        fullPage: true,
      });
    await fillOnboardingProfile(page);
    await expect(
      page.getByRole("heading", { name: "Welcome to LEAGLESHIP" }),
    ).toBeVisible();
    await expect(
      page.getByLabel("Current or temporary password", { exact: true }),
    ).toHaveCount(0);
    await page
      .getByLabel("Update Your Password", { exact: true })
      .fill("FuturePassword123!");
    await page
      .getByLabel("Confirm Password", { exact: true })
      .fill("Mismatch123!");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page.locator("main").getByRole("alert")).toHaveText(
      "Your passwords do not match.",
    );
    expect(
      state.calls.filter((c) => c.path === "/settings/account/password"),
    ).toHaveLength(0);
    await page
      .getByLabel("Confirm Password", { exact: true })
      .fill("FuturePassword123!");
    await page
      .getByRole("button", { name: "Show update your password" })
      .click();
    await expect(
      page.getByLabel("Update Your Password", { exact: true }),
    ).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page).toHaveURL(/\/select-program|\/dashboard/);
    if (page.url().includes("/select-program")) {
      const card = page.locator("button").filter({ hasText: /Vision 2535|Fellowship/ }).first();
      await card.click();
      await expect(page).toHaveURL(/\/select-program|\/dashboard/);
    if (page.url().includes("/select-program")) {
      const card = page.locator("button").filter({ hasText: /Vision 2535|Fellowship/ }).first();
      await card.click();
      await expect(page).toHaveURL(`/${role}/dashboard`);
    }
    }
    const call = state.calls.find(
      (c) => c.path === "/settings/account/password",
    );
    expect(call.method).toBe("PUT");
    expect(call.body).toEqual({
      current_password: "offline-test-password",
      password: "FuturePassword123!",
      password_confirmation: "FuturePassword123!",
    });
    const stored = await page.evaluate(
      () => JSON.stringify(sessionStorage) + JSON.stringify(localStorage),
    );
    expect(stored).not.toContain("FuturePassword123!");
    expect(stored).not.toContain("offline-test-password");
    await page.goto(`/${role}/settings`);
    await expect(
      page.getByRole("heading", { name: "Change password", exact: true }),
    ).toHaveCount(0);
    expect(state.unhandled).toEqual([]);
  });
}

test("failed password saves block dashboard access and preserve entries", async ({
  page,
}) => {
  const state = await backend(page, "mentee", { mustChange: true });
  state.failPassword = true;
  await signIn(page, "mentee", { mustChange: true });
  await fillOnboardingProfile(page);
  await page
    .getByLabel("Update Your Password", { exact: true })
    .fill("FuturePassword123!");
  await page
    .getByLabel("Confirm Password", { exact: true })
    .fill("FuturePassword123!");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toHaveText(
    "Password update rejected.",
  );
  await expect(
    page.getByLabel("Update Your Password", { exact: true }),
  ).toHaveValue("FuturePassword123!");
  await page.goto("/mentee/goals");
  await expect(page).toHaveURL("/onboarding");
  expect(state.mustChange).toBe(true);
});

test("refresh asks for the temporary password and onboarding fits mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await backend(page, "mentee", { mustChange: true });
  await signIn(page, "mentee", { mustChange: true });
  await fillOnboardingProfile(page);
  await page.reload();
  await fillOnboardingProfile(page);
  await page
    .getByLabel("Current or temporary password", { exact: true })
    .fill("offline-test-password");
  await page
    .getByLabel("Update Your Password", { exact: true })
    .fill("FuturePassword123!");
  await page
    .getByLabel("Confirm Password", { exact: true })
    .fill("FuturePassword123!");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page).toHaveURL(/\/select-program|\/dashboard/);
  if (page.url().includes("/select-program")) {
    const card = page.locator("button").filter({ hasText: /Vision 2535|Fellowship/ }).first();
    await card.click();
    await expect(page).toHaveURL("/mentee/dashboard");
  }
});

test("password success does not bypass an unchanged server onboarding flag", async ({
  page,
}) => {
  const state = await backend(page, "mentee", { mustChange: true });
  state.keepPasswordFlag = true;
  await signIn(page, "mentee", { mustChange: true });
  await fillOnboardingProfile(page);
  await page
    .getByLabel("Update Your Password", { exact: true })
    .fill("FuturePassword123!");
  await page
    .getByLabel("Confirm Password", { exact: true })
    .fill("FuturePassword123!");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "account setup is still required",
  );
  await expect(page).toHaveURL("/onboarding");
});

test("forged route cookies cannot override the verified masterclass role", async ({
  page,
  context,
}) => {
  const state = await backend(page, "mentee");
  await signIn(page, "mentee");
  await context.addCookies([
    { name: "user_role", value: "ADMIN", url: new URL(page.url()).origin },
  ]);
  await page.goto("/admin/users");
  await expect(page).toHaveURL("/mentee/dashboard");
  expect(state.calls.some((call) => call.path === "/v1/admin/users")).toBe(
    false,
  );
});

test("backend profile failure is shown at login without granting dashboard access", async ({
  page,
}) => {
  const state = await backend(page, "mentee");
  state.profileFailure = true;
  await page.goto("/login");
  await page.getByPlaceholder("Enter your email").fill("mentee@example.test");
  await page
    .getByPlaceholder("Enter your password")
    .fill("offline-test-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByText("MasterclassProfile", { exact: false }),
  ).toBeVisible();
  await expect(page).toHaveURL("/login");
  expect(state.calls.some((call) => call.path === "/v1/dashboard")).toBe(false);
});

test("onboarding uploads a chosen photo before completing the password step", async ({
  page,
}) => {
  const state = await backend(page, "mentee", { mustChange: true });
  await signIn(page, "mentee", { mustChange: true });
  await fillOnboardingProfile(page);
  await page.getByLabel("Upload Photo", { exact: true }).setInputFiles({
    name: "photo.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aTacAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await expect(page.getByAltText("Selected profile photo")).toBeVisible();
  await page
    .getByLabel("Update Your Password", { exact: true })
    .fill("FuturePassword123!");
  await page
    .getByLabel("Confirm Password", { exact: true })
    .fill("FuturePassword123!");
  await page.screenshot({
    path: "test-results/onboarding-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page).toHaveURL(/\/select-program|\/dashboard/);
  if (page.url().includes("/select-program")) {
    const card = page.locator("button").filter({ hasText: /Vision 2535|Fellowship/ }).first();
    await card.click();
    await expect(page).toHaveURL("/mentee/dashboard");
  }
  expect(state.calls.find((call) => call.path === "/files").method).toBe(
    "POST",
  );
  expect(state.profileFields.bio).toBe(
    "Learning and growing through mentorship.",
  );
  expect(state.profileFields.country).toBe("GH");
  expect(state.profileFields.avatar_url).toBe(
    "https://example.test/avatar.png",
  );
  expect(state.unhandled).toEqual([]);
});

for (const role of ["mentor", "mentee"]) {
  test(`${role} can temporarily skip password setup, refresh and test dashboard pages`, async ({
    page,
  }) => {
    const state = await backend(page, role, { mustChange: true });
    state.failPassword = true;
    await signIn(page, role, { mustChange: true });
    // No profile fields or password fields need to be filled to skip.
    await page
      .getByRole("button", { name: "Skip for now", exact: true })
      .click();
    await expect(page).toHaveURL(/\/select-program|\/dashboard/);
    if (page.url().includes("/select-program")) {
      const card = page.locator("button").filter({ hasText: /Vision 2535|Fellowship/ }).first();
      await card.click();
      await expect(page).toHaveURL(`/${role}/dashboard`);
    }
    await page.reload();
    await expect(page).toHaveURL(/\/select-program|\/dashboard/);
    if (page.url().includes("/select-program")) {
      const card = page.locator("button").filter({ hasText: /Vision 2535|Fellowship/ }).first();
      await card.click();
      await expect(page).toHaveURL(`/${role}/dashboard`);
    }
    const nextLink = role === "mentor" ? "Sessions" : "Goals";
    await page.getByRole("link", { name: nextLink, exact: true }).click();
    await expect(page).toHaveURL(`/${role}/${nextLink.toLowerCase()}`);
    await expect(page.locator("main")).toBeVisible();
    const session = await page.evaluate(
      () => JSON.parse(sessionStorage.getItem("vision2535_auth_session")).state,
    );
    expect(session.passwordSetupDeferred).toBe(true);
    expect(session.user.mustChangePassword).toBe(true);
    expect(
      state.calls.some((call) => call.path === "/settings/account/password"),
    ).toBe(false);
    expect(
      state.calls.every(
        (call) => call.method === "GET" || call.path === "/auth/login",
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(page).toHaveURL("/login");
    const signedOut = await page.evaluate(
      () => JSON.parse(sessionStorage.getItem("vision2535_auth_session")).state,
    );
    expect(signedOut.passwordSetupDeferred).toBe(false);
    await signIn(page, role, { mustChange: true });
    await expect(
      page.getByRole("button", { name: "Skip for now", exact: true }),
    ).toBeVisible();
    expect(state.unhandled).toEqual([]);
  });
}
