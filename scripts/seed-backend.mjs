/**
 * Database Seeding Script for MyMasterclass / Vision2535 Live Backend
 *
 * Usage:
 *   ADMIN_TOKEN="<your_bearer_token>" node scripts/seed-backend.mjs
 *   or
 *   ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="your-password" node scripts/seed-backend.mjs
 */

const API_BASE = process.env.API_BASE_URL || "https://appsuite.butterflytech.io/api";

async function api(path, options = {}, token = null) {
  const url = `${API_BASE}${path}`;
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return { status: response.status, ok: response.ok, data };
}

async function login(email, password) {
  console.log(`\n🔑 Authenticating with ${API_BASE}/auth/login...`);
  const res = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(`Login failed (${res.status}): ${JSON.stringify(res.data)}`);
  }

  const token = res.data?.token || res.data?.data?.token;
  if (!token) throw new Error("No token returned from login.");
  console.log("✅ Authenticated successfully!");
  return token;
}

async function seed() {
  console.log("==================================================");
  console.log("   Vision2535 Live Backend Database Seeder        ");
  console.log("==================================================");
  console.log(`Target Backend: ${API_BASE}`);

  let token = process.env.ADMIN_TOKEN;

  if (!token) {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.error("\n❌ Error: Please provide ADMIN_TOKEN or ADMIN_EMAIL and ADMIN_PASSWORD.");
      console.log("\nExamples:");
      console.log("  ADMIN_TOKEN=\"your-bearer-token\" node scripts/seed-backend.mjs");
      console.log("  ADMIN_EMAIL=\"admin@test.com\" ADMIN_PASSWORD=\"pass\" node scripts/seed-backend.mjs\n");
      process.exit(1);
    }

    token = await login(email, password);
  } else {
    console.log("🔑 Using provided ADMIN_TOKEN...");
  }

  const results = {
    programs: [],
    cohorts: [],
    categories: [],
    mentors: [],
    mentees: [],
    assignments: [],
    sessions: [],
  };

  // 1. Programs
  console.log("\n📦 1. Seeding Programs...");
  const programsToSeed = [
    {
      name: "Vision2535 Program",
      description: "A guided mentorship journey for leadership and personal growth.",
      status: "active",
      application_url: "https://forms.example.com/vision2535",
    },
    {
      name: "Fellowship Program",
      description: "Get advanced training and mentorship from senior leaders.",
      status: "active",
      application_url: "https://forms.example.com/fellowship",
    },
  ];

  for (const prog of programsToSeed) {
    const res = await api("/v1/programs", {
      method: "POST",
      body: JSON.stringify(prog),
    }, token);

    if (res.ok) {
      const created = res.data?.data || res.data?.program || res.data;
      console.log(`  ✅ Program created: ${prog.name} (ID: ${created?.id})`);
      results.programs.push(created);
    } else {
      console.log(`  ⚠️ Program creation (${prog.name}) returned ${res.status}:`, res.data?.message || res.data);
    }
  }

  // 2. Cohorts
  console.log("\n👥 2. Seeding Cohorts...");
  const cohortsToSeed = [
    {
      name: "Convergence '24",
      description: "Decade journey starting in 2024",
      starts_at: "2024-01-01T00:00:00Z",
      ends_at: "2034-12-31T23:59:59Z",
      status: "active",
      program_id: results.programs[0]?.id || 1,
    },
    {
      name: "Convergence '25",
      description: "Decade journey starting in 2025",
      starts_at: "2025-01-01T00:00:00Z",
      ends_at: "2035-12-31T23:59:59Z",
      status: "active",
      program_id: results.programs[0]?.id || 1,
    },
    {
      name: "Convergence '26",
      description: "Decade journey starting in 2026",
      starts_at: "2026-01-01T00:00:00Z",
      ends_at: "2036-12-31T23:59:59Z",
      status: "active",
      program_id: results.programs[0]?.id || 1,
    },
  ];

  for (const coh of cohortsToSeed) {
    const res = await api("/v1/cohorts", {
      method: "POST",
      body: JSON.stringify(coh),
    }, token);

    if (res.ok) {
      const created = res.data?.data || res.data?.cohort || res.data;
      console.log(`  ✅ Cohort created: ${coh.name} (ID: ${created?.id})`);
      results.cohorts.push(created);
    } else {
      console.log(`  ⚠️ Cohort creation (${coh.name}) returned ${res.status}:`, res.data?.message || res.data);
    }
  }

  // 3. Goal Categories
  console.log("\n🎯 3. Seeding Goal Categories...");
  const categoriesToSeed = [
    { name: "Personal Growth", description: "Habits, mindsets and discipline" },
    { name: "Career & Leadership", description: "Professional excellence and strategic growth" },
    { name: "Spiritual Life", description: "Faith, values and purpose" },
  ];

  for (const cat of categoriesToSeed) {
    const res = await api("/v1/goal-categories", {
      method: "POST",
      body: JSON.stringify(cat),
    }, token);

    if (res.ok) {
      const created = res.data?.data || res.data?.category || res.data;
      console.log(`  ✅ Goal Category created: ${cat.name} (ID: ${created?.id})`);
      results.categories.push(created);
    } else {
      console.log(`  ⚠️ Goal Category (${cat.name}) returned ${res.status}:`, res.data?.message || res.data);
    }
  }

  // 4. Mentors
  console.log("\n🧑‍🏫 4. Seeding Mentors...");
  const mentorsToSeed = [
    { first_name: "Jude", last_name: "Dajuma", email: `jude.dajuma.${Date.now()}@example.com`, role: "mentor" },
    { first_name: "Dele", last_name: "Ojo", email: `dele.ojo.${Date.now()}@example.com`, role: "mentor" },
    { first_name: "Aisha", last_name: "Bello", email: `aisha.bello.${Date.now()}@example.com`, role: "mentor" },
  ];

  for (let i = 0; i < mentorsToSeed.length; i++) {
    const m = mentorsToSeed[i];
    const cohortId = results.cohorts[i % (results.cohorts.length || 1)]?.id;

    const res = await api("/v1/admin/users", {
      method: "POST",
      body: JSON.stringify({
        ...m,
        password: "Password123!",
        password_confirmation: "Password123!",
        ...(cohortId ? { cohort_id: Number(cohortId) } : {}),
      }),
    }, token);

    if (res.ok) {
      const created = res.data?.data || res.data?.user || res.data;
      console.log(`  ✅ Mentor created: ${m.first_name} ${m.last_name} (${m.email})`);
      results.mentors.push(created);
    } else {
      console.log(`  ⚠️ Mentor creation (${m.email}) returned ${res.status}:`, res.data?.message || res.data);
    }
  }

  // 5. Mentees
  console.log("\n🌱 5. Seeding Mentees (Participants)...");
  const menteesToSeed = [
    { first_name: "Amara", last_name: "Okoye", email: `amara.okoye.${Date.now()}@example.com`, role: "mentee", journey_year: 3 },
    { first_name: "Chika", last_name: "Eze", email: `chika.eze.${Date.now()}@example.com`, role: "mentee", journey_year: 2 },
    { first_name: "Doris", last_name: "Bello", email: `doris.bello.${Date.now()}@example.com`, role: "mentee", journey_year: 3 },
    { first_name: "Williams", last_name: "Nkrumah", email: `williams.nkrumah.${Date.now()}@example.com`, role: "mentee", journey_year: 1 },
    { first_name: "Kwame", last_name: "Boateng", email: `kwame.boateng.${Date.now()}@example.com`, role: "mentee", journey_year: 1 },
  ];

  for (let i = 0; i < menteesToSeed.length; i++) {
    const m = menteesToSeed[i];
    const cohortId = results.cohorts[i % (results.cohorts.length || 1)]?.id;

    const res = await api("/v1/admin/users", {
      method: "POST",
      body: JSON.stringify({
        ...m,
        password: "Password123!",
        password_confirmation: "Password123!",
        ...(cohortId ? { cohort_id: Number(cohortId) } : {}),
      }),
    }, token);

    if (res.ok) {
      const created = res.data?.data || res.data?.user || res.data;
      console.log(`  ✅ Mentee created: ${m.first_name} ${m.last_name} (${m.email})`);
      results.mentees.push(created);
    } else {
      console.log(`  ⚠️ Mentee creation (${m.email}) returned ${res.status}:`, res.data?.message || res.data);
    }
  }

  // 6. Mentor Assignments
  console.log("\n🤝 6. Seeding Mentor Assignments...");
  if (results.mentors.length > 0 && results.mentees.length > 0) {
    for (let i = 0; i < results.mentees.length; i++) {
      const mentee = results.mentees[i];
      const mentor = results.mentors[i % results.mentors.length];
      const menteeId = mentee?.id || mentee?.uuid;
      const mentorId = mentor?.id || mentor?.uuid;

      if (menteeId && mentorId) {
        const res = await api("/v1/admin/assign-mentor", {
          method: "POST",
          body: JSON.stringify({
            mentee_id: String(menteeId),
            mentor_id: String(mentorId),
          }),
        }, token);

        if (res.ok) {
          console.log(`  ✅ Assigned Mentee (${menteeId}) -> Mentor (${mentorId})`);
          results.assignments.push({ menteeId, mentorId });
        } else {
          console.log(`  ⚠️ Assignment failed (${res.status}):`, res.data?.message || res.data);
        }
      }
    }
  }

  console.log("\n==================================================");
  console.log("   Seeding Completed! Summary of Live Records:    ");
  console.log("==================================================");
  console.log(`Programs created:     ${results.programs.length}`);
  console.log(`Cohorts created:      ${results.cohorts.length}`);
  console.log(`Categories created:   ${results.categories.length}`);
  console.log(`Mentors created:      ${results.mentors.length}`);
  console.log(`Mentees created:      ${results.mentees.length}`);
  console.log(`Assignments created:  ${results.assignments.length}`);
  console.log("==================================================\n");
}

seed().catch((err) => {
  console.error("\n❌ Seeding script encountered an error:", err.message);
  process.exit(1);
});
