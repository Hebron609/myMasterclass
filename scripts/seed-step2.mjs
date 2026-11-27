const API_BASE = "https://appsuite.butterflytech.io/api";
const token = process.env.ADMIN_TOKEN;

async function seedStep2() {
  console.log("Seeding remaining Cohorts and Memberships...");

  // 1. Create Convergence '25 and Convergence '26
  const cohortsToCreate = [
    { name: "Convergence '25", starts_at: "2025-01-01", ends_at: "2035-12-31", status: "active" },
    { name: "Convergence '26", starts_at: "2026-01-01", ends_at: "2036-12-31", status: "active" },
  ];

  for (const c of cohortsToCreate) {
    const res = await fetch(`${API_BASE}/v1/cohorts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(c),
    });
    const data = await res.json();
    console.log(`Cohort ${c.name} creation status ${res.status}:`, data.data?.cohort?.name || data.message);
  }

  // 2. Fetch all cohorts
  const cohortsRes = await fetch(`${API_BASE}/v1/cohorts`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
  });
  const cohortsData = await cohortsRes.json();
  const cohorts = cohortsData.data?.items || [];
  console.log(`Fetched ${cohorts.length} cohorts:`, cohorts.map(c => ({ id: c.id, name: c.name })));

  // 3. Fetch all users
  const usersRes = await fetch(`${API_BASE}/v1/admin/users?per_page=50`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
  });
  const usersData = await usersRes.json();
  const users = usersData.data?.items || [];
  console.log(`Fetched ${users.length} users.`);

  // 4. Assign members to cohorts (POST /v1/cohorts/{id}/members)
  // Let's distribute users across cohorts
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const targetCohort = cohorts[i % cohorts.length];
    if (targetCohort) {
      const res = await fetch(`${API_BASE}/v1/cohorts/${targetCohort.id}/members`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ user_id: user.id }),
      });
      const data = await res.json();
      console.log(`Assigned ${user.name} (${user.role}) to Cohort ${targetCohort.name} -> Status ${res.status}`);
    }
  }

  // 5. Assign mentors to mentees (POST /v1/admin/assign-mentor)
  const mentors = users.filter(u => u.role === "mentor");
  const mentees = users.filter(u => u.role === "mentee");
  console.log(`Mentors: ${mentors.length}, Mentees: ${mentees.length}`);

  for (let i = 0; i < mentees.length; i++) {
    const mentee = mentees[i];
    const mentor = mentors[i % mentors.length];
    if (mentor) {
      const res = await fetch(`${API_BASE}/v1/admin/assign-mentor`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ mentee_id: mentee.id, mentor_id: mentor.id }),
      });
      const data = await res.json();
      console.log(`Assigned Mentee ${mentee.name} to Mentor ${mentor.name} -> Status ${res.status}`);
    }
  }

  // 6. Check Admin Overview to verify live stats!
  const overviewRes = await fetch(`${API_BASE}/v1/admin/overview`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
  });
  const overviewData = await overviewRes.json();
  console.log("\n📊 LIVE ADMIN OVERVIEW AFTER SEEDING:", JSON.stringify(overviewData, null, 2));
}

seedStep2().catch(console.error);
