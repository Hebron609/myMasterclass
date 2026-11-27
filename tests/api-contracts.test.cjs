/* Offline contract checks against the supplied Phase 1 document. No real server or credentials. */
const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return originalResolve.call(
    this,
    request.startsWith("@/")
      ? path.join(root, "src", request.slice(2))
      : request,
    ...args,
  );
};
require.extensions[".ts"] = (module, filename) => {
  const result = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });
  module._compile(result.outputText, filename);
};
const {
  apiCall,
  apiCollection,
  ApiError,
  errorMessage,
} = require("../src/lib/api.ts");
const auth = require("../src/lib/services/auth.ts");
const goals = require("../src/lib/services/goals.ts");
const reflections = require("../src/lib/services/reflections.ts");
const cohorts = require("../src/lib/services/cohorts.ts");
const admin = require("../src/lib/services/admin.ts");
const users = require("../src/lib/services/users.ts");
const availability = require("../src/lib/services/availability.ts");
const sessions = require("../src/lib/services/sessions.ts");
const programs = require("../src/lib/services/programs.ts");
const programSessions = require("../src/lib/services/program-sessions.ts");
const reports = require("../src/lib/services/reports.ts");
const dashboard = require("../src/lib/services/dashboard.ts");
const transforms = require("../src/lib/transforms.ts");
const originalFetch = global.fetch;
let queue, requests;
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
beforeEach(() => {
  queue = [];
  requests = [];
  global.fetch = async (url, options) => {
    let parsedBody;
    if (typeof options?.body === "string") {
      try {
        parsedBody = JSON.parse(options.body);
      } catch {
        parsedBody = options.body;
      }
    } else {
      parsedBody = options?.body;
    }
    requests.push({
      url,
      options,
      body: parsedBody,
    });
    if (!queue.length) throw new Error("Unexpected request");
    const response = queue.shift();
    if (response instanceof Error) throw response;
    return response;
  };
});
afterEach(() => {
  global.fetch = originalFetch;
  delete global.window;
  assert.equal(
    queue.length,
    0,
    "Every queued API response should have been consumed",
  );
});
const last = () => requests.at(-1);
const at = (endpoint, method = "GET") => {
  assert.equal(last().url, `/backend-api${endpoint}`);
  assert.equal(last().options.method || "GET", method);
};

test("login sends suite credentials without a bearer token", async () => {
  queue.push(json({ data: { token: "test-token", user: { id: "uuid" } } }));
  await auth.login("test@example.test", "temporary");
  at("/auth/login", "POST");
  assert.deepEqual(last().body, {
    email: "test@example.test",
    password: "temporary",
  });
  assert.equal(last().options.headers.has("Authorization"), false);
});
test("current-user request sends required headers; role mapping never defaults to mentee", async () => {
  queue.push(
    json({
      data: {
        user: {
          id: "uuid",
          name: "Test User",
          email: "test@example.test",
          roles: [{ name: "owner" }],
        },
        profile: { must_change_password: true, journey_year: 2 },
      },
    }),
  );
  const me = await auth.fetchCurrentUser("test-token");
  at("/v1/me");
  assert.equal(
    last().options.headers.get("Authorization"),
    "Bearer test-token",
  );
  assert.equal(last().options.headers.get("Accept"), "application/json");
  const user = auth.sessionUser(me.data);
  assert.equal(user.role, "ADMIN");
  assert.equal(user.mustChangePassword, true);
  assert.equal(user.journeyYear, 2);
  assert.equal(user.lastName, "User");
  for (const role of ["owner", "admin", "administrator", "ADMIN"])
    assert.equal(auth.normalizeRole(role), "ADMIN");
  assert.equal(auth.normalizeRole("mentor"), "MENTOR");
  assert.equal(auth.normalizeRole("mentee"), "MENTEE");
  assert.throws(() => auth.normalizeRole("member"));
  assert.throws(() => auth.sessionUser({ user: { id: "u", email: "x" } }));
});
test("masterclass profile role takes priority over a suite role", () => {
  assert.equal(
    auth.sessionUser({
      user: { id: "uuid", email: "x", role: "member" },
      role: "mentor",
    }).role,
    "MENTOR",
  );
});
test("goal creation sends category ID and dates, without inventing an owner", async () => {
  const payload = {
    title: "Portfolio",
    description: "Build it",
    goal_category_id: 7,
    start_date: "2026-10-15",
    end_date: "2026-11-15",
    status: "not_started",
  };
  queue.push(json({ data: { ...payload, id: 4, user_id: "uuid" } }));
  const goal = await goals.createGoal("test-token", payload);
  at("/v1/goals", "POST");
  assert.deepEqual(last().body, payload);
  assert.equal(goal.categoryId, 7);
  assert.equal(goal.status, "not_started");
});
test("goals and reflections scope mentor requests by the full UUID", async () => {
  const uuid = "123a4567-e89b-12d3-a456-426614174000";
  queue.push(json({ data: [] }), json({ data: [] }));
  await goals.fetchGoals("test-token", uuid);
  at(`/v1/goals?user_id=${uuid}`);
  await reflections.fetchReflections("test-token", uuid);
  at(`/v1/reflections?user_id=${uuid}`);
});
test("reflection create/update uses body and reflected_at and renders body", async () => {
  const payload = {
    title: "Week 1",
    body: "Journal content",
    reflected_at: "2026-10-15T10:00:00Z",
  };
  queue.push(
    json({ data: { id: 3, ...payload, user_id: "uuid" } }),
    json({ data: { id: 3, ...payload, user_id: "uuid" } }),
  );
  const reflection = await reflections.createReflection("test-token", payload);
  at("/v1/reflections", "POST");
  assert.deepEqual(last().body, payload);
  assert.equal(reflection.content, payload.body);
  assert.equal(reflection.createdAt, payload.reflected_at);
  await reflections.updateReflection("test-token", 3, payload);
  at("/v1/reflections/3", "PUT");
});
test("cohort create and update both map dates to starts_at and ends_at, retaining program/description/status", async () => {
  const payload = {
    name: "Test cohort",
    description: "Description",
    program_id: 1,
    start_date: "2026-10-15T00:00:00Z",
    end_date: "2026-12-31T23:59:59Z",
    status: "active",
  };
  queue.push(json({ data: { id: 1 } }), json({ data: { id: 1 } }));
  await cohorts.createCohort("test-token", payload);
  at("/v1/cohorts", "POST");
  assert.equal(last().body.starts_at, payload.start_date);
  assert.equal(last().body.ends_at, payload.end_date);
  assert.equal(last().body.program_id, 1);
  assert.equal(last().body.description, "Description");
  assert.equal("start_date" in last().body, false);
  await cohorts.updateCohort("test-token", 1, payload);
  at("/v1/cohorts/1", "PUT");
  assert.equal(last().body.starts_at, payload.start_date);
  assert.equal("start_date" in last().body, false);
});
test("admin list, account creation and assign/reassign use documented admin routes and UUIDs", async () => {
  queue.push(
    json({ data: [] }),
    json({
      data: {
        id: "uuid",
        name: "Test",
        email: "t@test.invalid",
        role: "mentee",
      },
    }),
    json({ data: {} }),
    json({ data: {} }),
  );
  await admin.fetchAdminUsers("test-token", { role: "mentor", cohort_id: 2 });
  at("/v1/admin/users?role=mentor&cohort_id=2");
  const user = {
    role: "mentee",
    first_name: "Test",
    last_name: "User",
    email: "t@test.invalid",
    password: "temporary",
    password_confirmation: "temporary",
    journey_year: 1,
  };
  await admin.createAdminUser("test-token", user);
  at("/v1/admin/users", "POST");
  assert.deepEqual(last().body, { ...user, name: "Test User" });
  const payload = {
    mentor_id: "123a-mentor-uuid",
    mentee_id: "456b-mentee-uuid",
  };
  await admin.assignMentor("test-token", payload);
  at("/v1/admin/assign-mentor", "POST");
  assert.deepEqual(last().body, payload);
  await admin.reassignMentor("test-token", payload);
  at("/v1/admin/reassign-mentor", "POST");
});
test("cohort membership uses user_id and DELETE membership route", async () => {
  queue.push(json({ data: {} }), new Response(null, { status: 204 }));
  await cohorts.addCohortMember("test-token", 2, "user-uuid");
  at("/v1/cohorts/2/members", "POST");
  assert.deepEqual(last().body, { user_id: "user-uuid" });
  await cohorts.removeCohortMember("test-token", 2, "user-uuid");
  at("/v1/cohorts/2/members/user-uuid", "DELETE");
});
test("profile updates use /me/profile and only the documented payload", async () => {
  queue.push(
    json({ data: {} }),
    json({
      data: {
        user: {
          id: "uuid",
          name: "Test",
          email: "t@test.invalid",
          role: "mentee",
        },
      },
    }),
  );
  await users.updateProfile("test-token", "uuid", {
    bio: "Updated bio",
    avatar_url: "https://example.test/photo.png",
  });
  assert.equal(requests[0].url, "/backend-api/v1/me/profile");
  assert.equal(requests[0].options.method, "PUT");
  assert.deepEqual(requests[0].body, {
    bio: "Updated bio",
    avatar_url: "https://example.test/photo.png",
  });
});
test("mentor list and mentee detail use scoped endpoints, not the nonexistent generic /users", async () => {
  queue.push(
    json({ data: [] }),
    json({ data: [] }),
    json({
      data: {
        mentee: { id: "uuid", name: "Test", role: "mentee", email: "x" },
        goals: [],
        sessions: [],
      },
    }),
  );
  await users.fetchMentees("test-token");
  at("/v1/mentees");
  assert.deepEqual(await users.fetchMentors("test-token"), []);
  at("/v1/mentors");
  await users.fetchMentee("test-token", "uuid");
  at("/v1/mentees/uuid");
});
test("booking uses a real availability_slot_id; availability uses UTC times", async () => {
  queue.push(
    json({ data: [] }),
    json({ data: { id: 2 } }),
    json({ data: { id: 9 } }),
  );
  await availability.fetchAvailabilitySlots("test-token", "mentor-uuid");
  at("/v1/availability-slots/open?mentor_id=mentor-uuid");
  const slot = {
    starts_at: "2026-10-20T10:00:00Z",
    ends_at: "2026-10-20T11:00:00Z",
    duration_minutes: 60,
  };
  await availability.createAvailabilitySlot("test-token", slot);
  at("/v1/availability-slots", "POST");
  assert.deepEqual(last().body, slot);
  await availability.bookSession("test-token", {
    availability_slot_id: 2,
    title: "Career",
  });
  at("/v1/sessions/book", "POST");
  assert.deepEqual(last().body, {
    availability_slot_id: 2,
    topic: "Career",
    session_type: "mentorship",
  });
});
test("session logging uses PATCH with Phase 1 field names; date adapter supports starts_at", async () => {
  const payload = {
    discussion_summary: "Review",
    action_points: "Write",
    follow_up_notes: "Next week",
    status: "completed",
  };
  queue.push(
    json({ data: { id: 4, starts_at: "2026-10-20T10:00:00Z", ...payload } }),
  );
  const session = await sessions.logSession("test-token", 4, payload);
  at("/v1/sessions/4/log", "PATCH");
  assert.deepEqual(last().body, payload);
  assert.equal(session.sessionDate, "2026-10-20T10:00:00Z");
  assert.equal(session.sessionSummary, "Review");
  assert.equal(session.actionPoints, "Write");
});
test("program fields and program-session CRUD are preserved", async () => {
  const payload = {
    name: "Test",
    description: "Desc",
    start_date: "2026-01-01",
    end_date: "2035-12-31",
    status: "active",
    is_upcoming: true,
    application_url: "https://example.test/apply",
    flyer_url: null,
  };
  queue.push(
    json({ data: { id: 1, ...payload } }),
    json({ data: { id: 1 } }),
    json({ data: { id: 1 } }),
    new Response(null, { status: 204 }),
  );
  const program = await programs.createProgram("test-token", payload);
  at("/v1/programs", "POST");
  assert.deepEqual(last().body, payload);
  assert.equal(program.isUpcoming, true);
  assert.equal(program.applicationUrl, payload.application_url);
  const session = {
    title: "Workshop",
    starts_at: "2026-10-20T14:00:00Z",
    ends_at: "2026-10-20T15:00:00Z",
    duration_minutes: 60,
    session_type: "workshop",
    cohort_id: null,
    status: "scheduled",
  };
  await programSessions.saveProgramSession("test-token", session);
  at("/v1/sessions", "POST");
  assert.deepEqual(last().body, session);
  await programSessions.saveProgramSession("test-token", session, 1);
  at("/myMasterclass/admin/program-sessions/1", "PUT");
  await programSessions.deleteProgramSession("test-token", 1);
  at("/myMasterclass/admin/program-sessions/1", "DELETE");
});
test("category CRUD uses goal-categories and deactivation returns no content", async () => {
  queue.push(
    json({
      data: { id: 9, name: "Career", description: "Careers", is_active: true },
    }),
    new Response(null, { status: 204 }),
  );
  const category = await goals.createGoalCategory("test-token", {
    name: "Career",
    description: "Careers",
    is_active: true,
  });
  at("/v1/goal-categories", "POST");
  assert.equal(category.description, "Career");
  assert.equal(category.details, "Careers");
  await goals.deleteGoalCategory("test-token", 9);
  at("/v1/goal-categories/9", "DELETE");
  queue.push(new Response(null, { status: 204 }));
  await goals.deleteGoalCategory("test-token", 9, true);
  at("/v1/goal-categories/9?hard=1", "DELETE");
});
test("paginated Laravel resource collections include every page and preserve filters", async () => {
  queue.push(
    json({ data: [{ id: 1 }], meta: { current_page: 1, last_page: 2 } }),
    json({ data: [{ id: 2 }], meta: { current_page: 2, last_page: 2 } }),
  );
  const rows = await apiCollection("/v1/goals?user_id=uuid", "test-token");
  assert.deepEqual(rows, [{ id: 1 }, { id: 2 }]);
  at("/v1/goals?user_id=uuid&page=2");
});
test("nested Laravel paginators work and foreign next URLs never receive bearer tokens", async () => {
  queue.push(
    json({
      data: {
        data: [{ id: 1 }],
        next_page_url: "https://attacker.invalid/steal",
        last_page: 2,
      },
    }),
    json({ data: { data: [{ id: 2 }], last_page: 2 } }),
  );
  assert.equal((await apiCollection("/v1/programs", "test-token")).length, 2);
  at("/v1/programs?page=2");
});
test("malformed lists and non-JSON success responses produce explicit failures", async () => {
  queue.push(
    json({ data: { bad: [] } }),
    new Response("<html>Login</html>", {
      status: 200,
      headers: { "content-type": "text/html" },
    }),
    new Response("{broken", {
      headers: { "content-type": "application/json" },
    }),
  );
  await assert.rejects(
    () => apiCollection("/v1/goals", "test-token"),
    /invalid list/,
  );
  await assert.rejects(
    () => apiCall("/v1/me", {}, "test-token"),
    /unexpected response/,
  );
  await assert.rejects(
    () => apiCall("/v1/me", {}, "test-token"),
    /invalid JSON/,
  );
});
test("validation errors retain backend fields; failed writes reject instead of returning success", async () => {
  queue.push(
    json(
      {
        message: "Validation failed",
        errors: { goal_category_id: ["Category is invalid."] },
      },
      422,
    ),
  );
  await assert.rejects(
    () => goals.createGoal("test-token", {}),
    (error) =>
      error instanceof ApiError &&
      error.status === 422 &&
      errorMessage(error).includes("Category is invalid."),
  );
});
test("expired bearer requests dispatch an auth event with the rejected token", async () => {
  global.window = new EventTarget();
  let rejected;
  window.addEventListener("auth-expired", (event) => {
    rejected = event.detail.token;
  });
  queue.push(json({ message: "Unauthenticated." }, 401));
  await assert.rejects(
    () => apiCall("/v1/me", {}, "expired-test-token"),
    (error) => error.status === 401,
  );
  assert.equal(rejected, "expired-test-token");
});
test("network failures are actionable and CSV downloads retain bearer authentication", async () => {
  queue.push(
    new Error("Network failure"),
    new Response("name,score\nTest,4\n", {
      headers: { "content-type": "text/csv" },
    }),
  );
  await assert.rejects(() => apiCall("/v1/me"), /Cannot connect/);
  const csv = await reports.downloadEngagementCsv("test-token");
  at("/v1/admin/reports/engagement.csv");
  assert.equal(
    last().options.headers.get("Authorization"),
    "Bearer test-token",
  );
  assert.match(await csv.text(), /Test,4/);
});

test("live data.items collections support nested meta pagination", async () => {
  queue.push(
    json({
      data: { items: [{ id: 1 }], meta: { current_page: 1, last_page: 2 } },
    }),
    json({
      data: { items: [{ id: 2 }], meta: { current_page: 2, last_page: 2 } },
    }),
  );
  assert.deepEqual(
    await apiCollection("/v1/admin/users?role=mentor", "test-token"),
    [{ id: 1 }, { id: 2 }],
  );
  at("/v1/admin/users?role=mentor&page=2");
});

test("live non-paginated data.items collections transform correctly", async () => {
  queue.push(
    json({
      data: {
        items: [
          {
            id: 2,
            name: "Live-shaped program",
            description: "",
            start_date: "2026-01-01",
            end_date: "2035-12-31",
          },
        ],
      },
    }),
  );
  const result = await programs.fetchPrograms("test-token");
  assert.equal(result[0].name, "Live-shaped program");
});

test("live named program/cohort/category wrappers return the actual IDs", async () => {
  queue.push(
    json({
      data: {
        program: {
          id: 31,
          name: "Wrapped Program",
          description: "",
          start_date: "2026-01-01",
          end_date: "2035-12-31",
        },
      },
    }),
    json({
      data: {
        cohort: {
          id: 41,
          name: "Wrapped Cohort",
          starts_at: null,
          ends_at: null,
        },
      },
    }),
    json({
      data: {
        category: {
          id: 51,
          name: "Wrapped Category",
          description: "",
          is_active: true,
        },
      },
    }),
  );
  assert.equal(
    (await programs.createProgram("test-token", { name: "Wrapped Program" }))
      .id,
    "31",
  );
  assert.equal((await cohorts.fetchCohort("test-token", 41)).id, 41);
  assert.equal(
    (
      await goals.createGoalCategory("test-token", {
        name: "Wrapped Category",
        description: "",
        is_active: true,
      })
    ).id,
    51,
  );
});

test("live user lists preserve role arrays, cohort memberships and profile values without inventing a role", () => {
  const user = transforms.transformUserFromAPI({
    id: "nested-user-uuid",
    name: "Test Participant",
    email: "nested@example.test",
    roles: ["mentee"],
    cohorts: [{ id: 8, name: "Cohort Eight" }],
    profile: {
      journey_year: 3,
      bio: "Existing profile",
      avatar_url: "https://example.test/photo.png",
      city: "Accra",
      country: "Ghana",
    },
  });
  assert.equal(user.role, "mentee");
  assert.equal(user.cohortId, 8);
  assert.deepEqual(user.cohorts, [{ id: 8, name: "Cohort Eight" }]);
  assert.equal(user.journeyYear, 3);
  assert.equal(user.location, "Accra, Ghana");
  assert.equal(user.avatarUrl, "https://example.test/photo.png");
  assert.equal(
    transforms.transformUserFromAPI({
      id: "unknown",
      name: "Unknown",
      email: "unknown@example.test",
      roles: ["unrecognized"],
    }).role,
    "",
  );
});

test("password updates use the suite route outside v1 and preserve rejection details", async () => {
  queue.push(
    json({ data: {} }),
    json(
      {
        message: "The route api/settings/account/password could not be found.",
      },
      404,
    ),
  );
  await auth.updatePassword(
    "test-token",
    "temporary",
    "NextPassword123!",
    "NextPassword123!",
  );
  at("/settings/account/password", "PUT");
  assert.deepEqual(last().body, {
    current_password: "temporary",
    password: "NextPassword123!",
    password_confirmation: "NextPassword123!",
  });
  await assert.rejects(
    () =>
      auth.updatePassword(
        "test-token",
        "temporary",
        "NextPassword123!",
        "NextPassword123!",
      ),
    (error) => error.status === 404,
  );
});

test("session IDs keep the exact prefixed identifier through detail and logging", async () => {
  const session = { id: "mentorship:12", starts_at: "2026-11-12T10:00:00Z" };
  queue.push(json({ data: session }), json({ data: session }));
  assert.equal(
    (await sessions.fetchSession("test-token", session.id)).id,
    session.id,
  );
  at("/v1/sessions/mentorship%3A12");
  assert.equal(
    (
      await sessions.logSession("test-token", session.id, {
        status: "completed",
      })
    ).id,
    session.id,
  );
  at("/v1/sessions/mentorship%3A12/log", "PATCH");
});

const engagement = require("../src/lib/services/engagement.ts");
const certificates = require("../src/lib/services/certificates.ts");
test("notifications map the Laravel notification data and read state", async () => {
  queue.push(
    json({
      data: {
        items: [
          {
            id: "n1",
            data: { title: "A session", body: "Tomorrow", type: "session" },
            read_at: null,
            created_at: "2026-11-08",
          },
          { id: "n2", title: "Read notice", is_read: true },
        ],
      },
    }),
  );
  const result = await engagement.fetchNotifications("test-token");
  at("/v1/notifications");
  assert.deepEqual(result[0], {
    id: "n1",
    title: "A session",
    message: "Tomorrow",
    type: "session",
    isRead: false,
    timestamp: "2026-11-08",
  });
  assert.equal(result[1].isRead, true);
});
test("search encodes the exact query and preserves backend result identities", async () => {
  queue.push(
    json({
      data: { items: [{ type: "mentor", id: "uuid", title: "Mentor" }] },
    }),
  );
  const result = await engagement.searchPlatform(
    "test-token",
    "  name & career  ",
  );
  at("/v1/search?q=name%20%26%20career");
  assert.equal(result[0].id, "uuid");
});
test("certificate catalogs keep server summaries and the admin route is distinct", async () => {
  queue.push(
    json({
      data: {
        summary: { earned: 2, available_to_unlock: 1 },
        items: [{ id: 11, title: "Achievement" }],
      },
    }),
    json({ data: { items: [] } }),
  );
  const mine = await certificates.fetchMyCertificates("test-token");
  at("/v1/certificates");
  assert.equal(mine.summary.earned, 2);
  assert.equal(mine.items[0].id, 11);
  await certificates.fetchAdminCertificates("test-token");
  at("/v1/admin/certificates");
});
test("certificate detail and issuing accept named wrappers and send only confirmed fields", async () => {
  queue.push(
    json({ data: { certificate: { id: 11, title: "Achievement" } } }),
    json({ data: { certificate: { id: 12, title: "New Award" } } }),
  );
  assert.equal((await certificates.fetchCertificate("test-token", 11)).id, 11);
  at("/v1/certificates/11");
  await certificates.issueCertificate("test-token", {
    user_id: "full-user-uuid",
    title: "New Award",
    issue_date: "2026-11-12",
    dedication: "For excellence",
    signatory: "Pamela Achebe",
    notify_by_email: true,
  });
  at("/v1/admin/certificates", "POST");
  assert.deepEqual(last().body, {
    user_id: "full-user-uuid",
    title: "New Award",
    issue_date: "2026-11-12",
    dedication: "For excellence",
    signatory: "Pamela Achebe",
    notify_by_email: true,
  });
});
test("certificate PDFs require PDF content and retain bearer authentication", async () => {
  queue.push(
    new Response("%PDF-1.4\n", {
      headers: { "content-type": "application/pdf" },
    }),
    new Response("<html>Login</html>", {
      headers: { "content-type": "text/html" },
    }),
  );
  const pdf = await certificates.downloadCertificate("test-token", 11);
  at("/v1/certificates/11/download");
  assert.equal(
    last().options.headers.get("Authorization"),
    "Bearer test-token",
  );
  assert.match(await pdf.text(), /PDF/);
  await assert.rejects(
    () => certificates.downloadCertificate("test-token", 11),
    /did not return a PDF/,
  );
});
test("certificate sharing rejects unsafe URLs and requests propagate server rejection", async () => {
  queue.push(
    json({ data: { url: "javascript:alert(1)" } }),
    json({ data: { share_url: "https://example.test/cert" } }),
    json({ message: "Not eligible" }, 422),
  );
  await assert.rejects(
    () => certificates.shareCertificate("test-token", 11),
    /valid sharing link/,
  );
  assert.equal(
    await certificates.shareCertificate("test-token", 11),
    "https://example.test/cert",
  );
  await assert.rejects(
    () => certificates.requestCertificate("test-token", 11),
    (error) => error.status === 422,
  );
  at("/v1/certificates/11/request", "POST");
});
test("mentor date booking uses full IDs without inventing an availability slot", async () => {
  queue.push(json({ data: { id: "mentorship:11" } }));
  const payload = {
    topic: "Career",
    session_type: "mentorship",
    date: "2030-11-12",
    time: "10:00",
    mentor_id: "mentor-uuid",
    mentee_id: "mentee-uuid",
  };
  await availability.bookSessionAtTime("test-token", payload);
  at("/v1/sessions/book", "POST");
  assert.deepEqual(last().body, payload);
});

test("admin user update, deactivation, hard deletion and CSV bulk import use /v1/admin/users", async () => {
  queue.push(
    json({ data: { id: "u-1", name: "Jane Updated", role: "mentor" } }),
    json({ data: { message: "Deactivated" } }),
    json({ data: { message: "Permanently deleted" } }),
    json({ data: { imported: 5 } }),
  );
  const updatePayload = {
    first_name: "Jane",
    last_name: "Updated",
    email: "jane@test.invalid",
    role: "mentor",
    status: "active",
  };
  await admin.updateAdminUser("test-token", "u-1", updatePayload);
  at("/v1/admin/users/u-1", "PATCH");
  assert.deepEqual(last().body, updatePayload);

  await admin.deleteAdminUser("test-token", "u-1");
  at("/v1/admin/users/u-1", "DELETE");

  await admin.deleteAdminUser("test-token", "u-1", { hard: true });
  at("/v1/admin/users/u-1?hard=1", "DELETE");

  const file = new Blob(["email,first_name,last_name\na@b.com,A,B"], { type: "text/csv" });
  await admin.importAdminUsers("test-token", file);
  at("/v1/admin/users/import", "POST");
  assert(last().options.body instanceof FormData);
});

test("admin create user without password receives temporary_password without sending blank passwords", async () => {
  queue.push(
    json({
      data: {
        id: "u-2",
        name: "Auto User",
        email: "auto@test.invalid",
        role: "mentee",
        temporary_password: "temp-pass-1234",
        must_change_password: true,
      },
    }),
  );
  const result = await admin.createAdminUser("test-token", {
    role: "mentee",
    first_name: "Auto",
    last_name: "User",
    email: "auto@test.invalid",
  });
  at("/v1/admin/users", "POST");
  assert.equal(last().body.password, undefined);
  assert.equal(last().body.password_confirmation, undefined);
  assert.equal(result.temporary_password, "temp-pass-1234");
  assert.equal(result.must_change_password, true);
});

test("session reschedule and reflection mentor feedback endpoints post to /v1 routes", async () => {
  queue.push(
    json({ data: { message: "Reschedule proposed" } }),
    json({
      data: {
        id: 7,
        title: "Growth",
        body: "Reflecting on leadership",
        mood: "Hopeful",
        mentor_feedback: "Great reflection and progress.",
      },
    }),
  );
  const reschedulePayload = {
    proposed_date: "2026-11-20",
    proposed_time: "14:00",
    note: "Conflict with travel",
  };
  await sessions.rescheduleSession("test-token", "sess-1", reschedulePayload);
  at("/v1/sessions/sess-1/reschedule", "POST");
  assert.deepEqual(last().body, reschedulePayload);

  const reflection = await reflections.submitReflectionFeedback(
    "test-token",
    7,
    "Great reflection and progress.",
  );
  at("/v1/reflections/7/feedback", "POST");
  assert.deepEqual(last().body, { feedback_text: "Great reflection and progress." });
  assert.equal(reflection.mentorFeedbackText, "Great reflection and progress.");
  assert.equal(reflection.mood, "Hopeful");
});

test("admin engagement history and leaderboard with cohort filter query the live endpoints", async () => {
  queue.push(
    json({ data: [{ week: "W1", sessions: 12 }, { week: "W2", sessions: 18 }] }),
    json({
      data: {
        items: [
          {
            position: 1,
            name: "Leader Mentee",
            score: 120,
            weekly_movement: "+2",
          },
        ],
      },
    }),
  );
  const history = await reports.fetchEngagementHistory("test-token");
  at("/v1/admin/analytics/engagement-history");
  assert.equal(history.length, 2);
  assert.equal(history[0].week, "W1");
  assert.equal(history[0].sessions, 12);

  const board = await dashboard.fetchLeaderboard("test-token", 5);
  at("/v1/leaderboard?cohort_id=5");
  assert.equal(board.data.items[0].weekly_movement, "+2");
});

test("admin preferences updates send PUT to /settings/preferences with payload", async () => {
  queue.push(
    json({
      data: {
        preferences: {
          email_digest: true,
          public_participant_profiles: false,
          auto_match: true,
        },
      },
    }),
  );
  await admin.updateAdminPreferences("test-token", {
    email_digest: true,
    public_participant_profiles: false,
    auto_match: true,
  });
  at("/settings/preferences", "PUT");
  assert.deepEqual(last().body, {
    email_digest: true,
    public_participant_profiles: false,
    auto_match: true,
  });
});

test("final Figma gaps: user messaging, notifications read, certificate endorse, avatar upload, and reflection type/tags", async () => {
  queue.push(
    json({ data: { message: "Message sent" } }),
    json({ data: { message: "All marked as read" } }),
    json({ data: { message: "Marked as read" } }),
    json({ data: { certificate: { id: 99, status: "endorsed" } } }),
    json({ data: { avatar_url: "https://example.test/avatar.jpg" } }),
    json({
      data: {
        reflection: {
          id: 42,
          title: "Monthly Check-in",
          body: "Strong progress",
          type: "Monthly",
          tags: ["Leadership", "Growth"],
          reflected_at: "2026-11-27",
          user_id: "u-1",
          created_at: "2026-11-27",
        },
      },
    }),
  );

  await admin.messageAdminUser("test-token", "user-uuid-1", {
    title: "Follow-up",
    body: "Checking in on your cohort goals.",
  });
  at("/v1/admin/users/user-uuid-1/message", "POST");
  assert.deepEqual(last().body, {
    title: "Follow-up",
    body: "Checking in on your cohort goals.",
  });

  await engagement.markAllNotificationsRead("test-token");
  at("/v1/notifications/read-all", "POST");

  await engagement.markNotificationRead("test-token", "notif-123");
  at("/v1/notifications/notif-123/read", "PATCH");

  await certificates.endorseCertificate("test-token", 99, {
    notes: "Endorsed by mentor",
  });
  at("/v1/certificates/99/endorse", "POST");
  assert.deepEqual(last().body, { notes: "Endorsed by mentor" });

  const avatarBlob = new Blob(["fake-image"], { type: "image/jpeg" });
  const avatarRes = await users.uploadAvatar("test-token", avatarBlob);
  at("/v1/me/avatar", "POST");
  assert(last().options.body instanceof FormData);
  assert.equal(avatarRes.data.avatar_url, "https://example.test/avatar.jpg");

  const createdReflection = await reflections.createReflection("test-token", {
    title: "Monthly Check-in",
    body: "Strong progress",
    reflected_at: "2026-11-27",
    type: "Monthly",
    tags: ["Leadership", "Growth"],
  });
  at("/v1/reflections", "POST");
  assert.deepEqual(last().body, {
    title: "Monthly Check-in",
    body: "Strong progress",
    reflected_at: "2026-11-27",
    type: "Monthly",
    tags: ["Leadership", "Growth"],
  });
  assert.equal(createdReflection.type, "Monthly");
  assert.deepEqual(createdReflection.tags, ["Leadership", "Growth"]);
});
