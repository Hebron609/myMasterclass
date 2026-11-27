const { expect } = require("@playwright/test");
// These are browser tests with a controlled backend fixture, not live-server verification.
// Every request to the configured API is intercepted; unhandled paths fail explicitly.
async function backend(page, role = "mentee", { mustChange = false } = {}) {
  const state = {
    role,
    mustChange,
    expired: false,
    failGoals: false,
    notifications: [],
    certificates: [],
    certificateSummary: { earned: 0, available_to_unlock: 0 },
    issuedCertificates: [],
    calls: [],
    goals: [],
    reflections: [],
    sessions: [],
    slots: [
      {
        id: 12,
        mentor_id: "123a-mentor-uuid",
        starts_at: "2030-10-20T10:00:00Z",
        ends_at: "2030-10-20T11:00:00Z",
        duration_minutes: 60,
      },
    ],
    programs: [
      {
        id: 1,
        name: "Vision 2535",
        description: "A guided mentorship journey for leadership and personal growth.",
        start_date: "2026-01-01",
        end_date: "2035-12-31",
        status: "active",
        is_upcoming: true,
      },
      {
        id: 2,
        name: "Fellowship Program",
        description: "Connect, learn, and grow through faith and fellowship.",
        start_date: "2026-10-01",
        end_date: "2027-10-01",
        status: "active",
        is_upcoming: false,
      },
    ],
    cohorts: [
      {
        id: 1,
        name: "Test Cohort",
        description: "Test description",
        program_id: 1,
        starts_at: "2026-01-01T00:00:00Z",
        ends_at: "2035-12-31T23:59:59Z",
        status: "active",
      },
    ],
    users: [
      {
        id: "456b-mentee-uuid",
        name: "Test Participant",
        first_name: "Test",
        last_name: "Participant",
        email: "mentee@example.test",
        role: "mentee",
        cohort_id: 1,
      },
      {
        id: "123a-mentor-uuid",
        name: "Test Mentor",
        email: "mentor@example.test",
        role: "mentor",
        cohort_id: 1,
      },
    ],
    categories: [
      { id: 7, name: "Career", description: "Career goals", is_active: true },
    ],
    programSessions: [],
    unhandled: [],
  };
  const toApiUser = (user) => {
    const { role, cohort_id, mentor_id, ...rest } = user;
    return {
      ...rest,
      roles: [role],
      profile: {
        journey_year: user.journey_year || 2,
        bio: user.bio || "",
        avatar_url: null,
      },
      cohorts: state.cohorts
        .filter((cohort) => cohort.id === cohort_id)
        .map((cohort) => ({ id: cohort.id, name: cohort.name })),
    };
  };
  const currentUser = () => ({
    id: `${role}-user-uuid`,
    name: `Test ${role}`,
    email: `${role}@example.test`,
    role,
  });
  const me = () => ({
    user: currentUser(),
    role,
    profile: {
      bio: state.bio || "",
      avatar_url: "",
      journey_year: 2,
      ...state.profileFields,
      must_change_password: state.mustChange,
    },
    cohorts: state.cohorts,
    mentor: state.users[1],
  });
  await page.route("**/backend-api/**", async (route) => {
    const request = route.request(),
      url = new URL(request.url()),
      path = url.pathname.replace(/^\/backend-api/, ""),
      method = request.method();
    const headers = {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    };
    const reply = (data, status = 200, envelope = true) => {
      // Reflect the collection and named-resource envelopes observed live.
      if (envelope && Array.isArray(data)) {
        data = {
          items: data,
          ...(["/v1/admin/users", "/v1/mentees"].includes(path)
            ? { meta: { current_page: 1, last_page: 1, total: data.length } }
            : {}),
        };
      } else if (envelope && data?.id !== undefined) {
        const kind = path.match(
          /^\/v1\/(programs|cohorts|goal-categories|goals|reflections)(?:\/\d+)?$/,
        )?.[1];
        const key = {
          programs: "program",
          cohorts: "cohort",
          "goal-categories": "category",
          goals: "goal",
          reflections: "reflection",
        }[kind];
        if (key) data = { [key]: data };
      }
      return route.fulfill({
        status,
        headers,
        body: JSON.stringify(envelope ? { data } : data),
      });
    };
    if (method === "OPTIONS")
      return route.fulfill({
        status: 204,
        headers: {
          ...headers,
          "access-control-allow-headers": "*",
          "access-control-allow-methods": "*",
        },
      });
    const body =
      !request.headers()["content-type"]?.includes("multipart/form-data") &&
      request.postData()
        ? JSON.parse(request.postData())
        : undefined;
    state.calls.push({
      path,
      method,
      body,
      params: Object.fromEntries(url.searchParams),
    });
    if (state.expired && path !== "/auth/login")
      return reply({ message: "Unauthenticated." }, 401, false);
    if (path === "/auth/login")
      return reply({
        token: "offline-test-token",
        token_type: "Bearer",
        user: currentUser(),
      });
    if (path === "/v1/notifications")
      return state.failNotifications
        ? reply({ message: "Notifications could not be loaded." }, 500, false)
        : reply({
            items: state.notifications,
            unread_count: state.notifications.filter((n) => !n.read_at).length,
          });
    if (path === "/v1/search")
      return state.failSearch
        ? reply({ message: "Search unavailable." }, 500, false)
        : reply(state.searchResults || []);
    if (path === "/v1/follow-ups") return reply([]);
    if (path === "/v1/certificates")
      return state.failCertificates
        ? reply({ message: "Certificates could not be loaded." }, 500, false)
        : reply({
            summary: state.certificateSummary,
            items: state.certificates,
          });
    if (path === "/v1/admin/certificates") {
      if (method === "POST") {
        if (state.failCertificateUser === body.user_id)
          return reply({ message: "Certificate issue rejected." }, 422, false);
        const certificate = {
          id: 100 + state.issuedCertificates.length,
          title: body.title,
          user: state.users.find((u) => u.id === body.user_id),
          status: "issued",
          issued_at: "2026-11-08",
        };
        state.issuedCertificates.push(certificate);
        state.certificates.push(certificate);
        return reply({ certificate }, 201);
      }
      return reply({ items: state.certificates });
    }
    if (
      /^\/v1\/certificates\/[^/]+(?:\/(download|share|request))?$/.test(path)
    ) {
      const id = decodeURIComponent(path.split("/")[3]);
      const certificate = state.certificates.find((c) => String(c.id) === id);
      if (!certificate)
        return reply({ message: "Certificate not found." }, 404, false);
      if (path.endsWith("/download"))
        return route.fulfill({
          status: 200,
          contentType: "application/pdf",
          body: "%PDF-1.4\nFixture PDF\n%%EOF",
        });
      if (path.endsWith("/share"))
        return reply({ url: "https://example.test/shared-certificate" });
      if (path.endsWith("/request")) {
        if (state.failCertificateRequest)
          return reply(
            { message: "Certificate request rejected." },
            422,
            false,
          );
        certificate.status = "requested";
        return reply({ certificate });
      }
      return reply({ certificate });
    }
    if (path === "/settings/account/password") {
      if (state.failPassword)
        return reply({ message: "Password update rejected." }, 422, false);
      if (!state.keepPasswordFlag) state.mustChange = false;
      return reply({});
    }
    if (path === "/settings/account") {
      return reply({
        account: {
          id: `${role}-user-uuid`,
          ...body,
        },
      });
    }
    if (path === "/files")
      return reply({ url: "https://example.test/avatar.png" });
    if (path === "/v1/mentors") return reply([state.users[1]]);
    if (path === "/v1/me")
      return state.profileFailure
        ? reply(
            {
              message:
                'Class "App\\Models\\MyMasterClass\\MasterclassProfile" not found',
            },
            500,
            false,
          )
        : reply(me());
    if (path === "/v1/me/profile") {
      state.bio = body.bio;
      state.profileFields = { ...state.profileFields, ...body };
      return reply(me());
    }
    if (path === "/v1/dashboard")
      return reply({
        journey: { current_year: 2 },
        mentees: state.users.filter((user) => user.role === "mentee"),
      });
    if (path === "/v1/admin/overview")
      return reply({
        total_participants: 1,
        total_mentors: 1,
        active_cohorts: 1,
        sessions_logged_monthly: state.sessions.filter(
          (session) => session.status === "completed",
        ).length,
      });
    if (path === "/v1/admin/activity")
      return reply({
        active: [],
        inactive: [],
        totals: { active: 0, inactive: 0 },
      });
    if (path === "/v1/leaderboard")
      return reply({
        items: [
          {
            position: 1,
            user_id: currentUser().id,
            name: "Test Participant",
            sessions_attended: 0,
            reflections: 0,
            goals_completed: 0,
            streak: 0,
            score: 0,
            journey_year: 2,
          },
        ],
        current_user: { position: 1, score: 0 },
      });
    if (path === "/v1/mentorships/me")
      return reply({
        mentor: state.users[1],
        next_session: null,
        open_slots: state.slots,
      });
    if (
      path === "/v1/availability-slots/open" ||
      path === "/v1/availability-slots"
    ) {
      if (method === "POST") {
        if (state.failAvailability)
          return reply(
            { message: "This time overlaps an existing slot." },
            409,
            false,
          );
        const slot = {
          id: Math.max(12, ...state.slots.map((slot) => slot.id)) + 1,
          ...body,
        };
        state.slots.push(slot);
        return reply(slot, 201);
      }
      return reply(state.slots);
    }
    if (/^\/v1\/availability-slots\/\d+$/.test(path) && method === "DELETE") {
      const id = Number(path.split("/").pop());
      if (
        state.failSlotDelete ||
        state.slots.find((slot) => slot.id === id)?.status === "booked"
      )
        return reply(
          { message: "A booked slot cannot be removed." },
          409,
          false,
        );
      state.slots = state.slots.filter((slot) => slot.id !== id);
      return reply({ message: "Slot removed." });
    }
    if (path === "/v1/sessions/book") {
      if (!body.availability_slot_id) {
        if (state.failDateBooking)
          return reply({ message: "Booking rejected." }, 422, false);
        const session = {
          id: "mentorship:" + (state.sessions.length + 1),
          title: body.topic,
          starts_at: body.date + "T" + body.time + ":00Z",
          status: "scheduled",
          ...body,
        };
        state.sessions.push(session);
        return reply(session, 201);
      }
      const slot = state.slots.find(
        (slot) => slot.id === body.availability_slot_id,
      );
      if (!slot)
        return reply({ message: "Slot is no longer available." }, 409, false);
      const session = {
        id: 1,
        ...body,
        session_date: slot.starts_at,
        status: "scheduled",
      };
      state.sessions.push(session);
      state.slots = state.slots.filter((candidate) => candidate.id !== slot.id);
      return reply(session, 201);
    }
    if (path === "/v1/sessions") {
      if (method === "POST") {
        if (state.failProgramSessions)
          return reply(
            { message: "Program sessions could not be saved." },
            500,
            false,
          );
        const session = { id: "in_house:1", ...body };
        state.programSessions.push(session);
        return reply(session, 201);
      }
      if (url.searchParams.get("tab") === "in_house")
        return state.failProgramSessions
          ? reply(
              { message: "Program sessions could not be loaded." },
              500,
              false,
            )
          : reply(state.programSessions);
      return reply(state.sessions);
    }
    if (/\/sessions\/[^/]+\/log$/.test(path)) {
      const session = state.sessions.find((session) =>
        decodeURIComponent(path).includes(`/${session.id}/`),
      );
      if (state.failSessionLog)
        return reply(
          { message: "Session notes could not be saved." },
          422,
          false,
        );
      Object.assign(session, body);
      return reply(session);
    }
    if (path === "/v1/goal-categories") {
      if (method === "POST") {
        if (state.failCategories)
          return reply({ message: "Category name was rejected." }, 422, false);
        const category = {
          id:
            Math.max(7, ...state.categories.map((category) => category.id)) + 1,
          ...body,
        };
        state.categories.push(category);
        return reply(category, 201);
      }
      return reply(
        state.categories.filter(
          (category) =>
            url.searchParams.get("include_inactive") === "1" ||
            category.is_active !== false,
        ),
      );
    }
    if (/\/goal-categories\/\d+$/.test(path)) {
      if (state.failCategories)
        return reply(
          { message: "Category changes could not be saved." },
          422,
          false,
        );
      const category = state.categories.find((category) =>
        path.endsWith(`/${category.id}`),
      );
      if (method === "DELETE") category.is_active = false;
      else Object.assign(category, body);
      return reply(category);
    }
    if (path === "/v1/goals") {
      if (method === "POST") {
        if (state.failGoals)
          return reply(
            {
              message: "Validation failed",
              errors: { title: ["This title was rejected."] },
            },
            422,
            false,
          );
        const goal = {
          id: Math.max(0, ...state.goals.map((goal) => goal.id)) + 1,
          user_id: currentUser().id,
          ...body,
        };
        state.goals.push(goal);
        return reply(goal, 201);
      }
      return reply(state.goals);
    }
    if (/\/goals\/\d+$/.test(path)) {
      const id = Number(path.split("/").pop());
      const goal = state.goals.find((goal) => goal.id === id);
      if (!goal) return reply({ message: "Goal not found." }, 404, false);
      if (state.failGoalChanges)
        return reply(
          { message: "Goal changes could not be saved." },
          422,
          false,
        );
      if (method === "DELETE") {
        state.goals = state.goals.filter((goal) => goal.id !== id);
        return reply({});
      }
      if (method === "PUT") Object.assign(goal, body);
      return reply(goal);
    }
    if (path === "/v1/reflections") {
      if (method === "POST") {
        const reflection = {
          id: 1,
          user_id: currentUser().id,
          created_at: body.reflected_at,
          ...body,
        };
        state.reflections.push(reflection);
        return reply(reflection, 201);
      }
      return reply(state.reflections);
    }
    if (path === "/v1/mentees")
      return reply(
        state.users.filter((user) => user.role === "mentee").map(toApiUser),
      );
    if (path.startsWith("/v1/mentees/"))
      return reply({
        mentee: toApiUser(state.users[0]),
        profile: { bio: "Participant bio" },
        goals: state.goals,
        sessions: state.sessions,
      });
    if (path === "/myMasterclass/mentorships")
      return reply(
        state.users
          .filter((user) => user.role === "mentee" && user.mentor_id)
          .map((user, index) => ({
            id: index + 1,
            mentee_id: user.id,
            mentor_id: user.mentor_id,
            status: "active",
            is_active: true,
          })),
      );
    if (path === "/v1/admin/users") {
      if (method === "POST") {
        if (state.createUserFailure)
          return reply(
            {
              message:
                "Tenant does not have an active subscription for this app.",
            },
            409,
            false,
          );
        const user = {
          id: "created-user-uuid",
          name: `${body.first_name} ${body.last_name}`,
          ...body,
        };
        state.users.push(user);
        return reply(user, 201);
      }
      const users = state.users.filter(
        (user) =>
          (!url.searchParams.get("role") ||
            user.role === url.searchParams.get("role")) &&
          (!url.searchParams.get("cohort_id") ||
            String(user.cohort_id) === url.searchParams.get("cohort_id")),
      );
      return reply(users.map(toApiUser));
    }
    if (
      path === "/v1/admin/assign-mentor" ||
      path === "/v1/admin/reassign-mentor"
    ) {
      if (state.failAssignmentFor === body.mentee_id)
        return reply(
          { message: "This mentor assignment could not be saved." },
          409,
          false,
        );
      const mentee = state.users.find((user) => user.id === body.mentee_id);
      if (mentee) mentee.mentor_id = body.mentor_id;
      return reply(body);
    }
    if (path === "/v1/cohorts") {
      if (method === "POST") {
        const cohort = { id: 2, ...body };
        state.cohorts.push(cohort);
        return reply(cohort, 201);
      }
      return reply(state.cohorts);
    }
    if (/\/cohorts\/\d+$/.test(path)) {
      const cohort = state.cohorts.find((cohort) =>
        path.endsWith(`/${cohort.id}`),
      );
      if (method === "PUT") Object.assign(cohort, body);
      return reply(cohort);
    }
    if (/\/cohorts\/\d+\/members$/.test(path)) {
      state.users.find((user) => user.id === body.user_id).cohort_id = Number(
        path.split("/")[3],
      );
      return reply({});
    }
    if (path === "/v1/programs") {
      if (
        method === "POST" &&
        !["active", "inactive", "completed"].includes(body.status || "active")
      )
        return reply(
          {
            message: "Validation failed.",
            errors: { status: ["The selected status is invalid."] },
          },
          422,
          false,
        );
      if (method === "POST") {
        const program = { id: 2, ...body };
        state.programs.push(program);
        return reply(program, 201);
      }
      return reply(state.programs);
    }
    if (/\/programs\/\d+$/.test(path)) {
      const program = state.programs.find((program) =>
        path.endsWith(`/${program.id}`),
      );
      Object.assign(program, body);
      return reply(program);
    }
    if (path === "/v1/program-sessions")
      return state.failProgramSessions
        ? reply(
            { message: "Program sessions could not be loaded." },
            500,
            false,
          )
        : reply(state.programSessions);
    if (path === "/v1/admin/program-sessions") {
      if (state.failProgramSessions)
        return reply(
          { message: "Program sessions could not be saved." },
          500,
          false,
        );
      const session = { id: 1, ...body };
      state.programSessions.push(session);
      return reply(session, 201);
    }
    if (path === "/v1/admin/reports/engagement")
      return reply({
        summary: { participants: 1, sessions: state.sessions.length },
        participants: [{ name: "Test Participant", sessions: 0, goals: 0 }],
        cohorts: [{ name: "Test Cohort", participants: 1 }],
      });
    if (path === "/v1/admin/reports/engagement.csv")
      return route.fulfill({
        status: 200,
        headers: { ...headers, "content-type": "text/csv" },
        body: "name,sessions\nTest Participant,0\n",
      });
    state.unhandled.push(`${method} ${path}`);
    return reply(
      { message: `Unhandled fixture path: ${method} ${path}` },
      501,
      false,
    );
  });
  return state;
}
async function signIn(page, role, { mustChange = false } = {}) {
  await page.goto("/login");
  await page.getByPlaceholder("Enter your email").fill(`${role}@example.test`);
  await page
    .getByPlaceholder("Enter your password")
    .fill("offline-test-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  if (mustChange && role !== "admin") {
    await expect(page).toHaveURL("/onboarding");
  } else {
    await expect(page).toHaveURL(/\/select-program|\/dashboard/);
    if (page.url().includes("/select-program")) {
      const card = page.locator("button").filter({ hasText: /Vision 2535|Fellowship/ }).first();
      await card.click();
      await expect(page).toHaveURL(`/${role}/dashboard`);
    }
  }
}

module.exports = { backend, signIn };
