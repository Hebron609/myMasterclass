const API_BASE = "https://appsuite.butterflytech.io/api";
const token = process.env.ADMIN_TOKEN;

async function seedSessions() {
  console.log("Seeding Sessions...");

  const now = new Date();
  const sessions = [
    {
      title: "Orientation Gathering",
      description: "Welcome all new participants and mentors.",
      starts_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      duration_minutes: 60,
      session_type: "in_house",
      status: "completed",
      cohort_id: 7,
    },
    {
      title: "Leadership Foundations",
      description: "Core leadership principles session.",
      starts_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
      duration_minutes: 90,
      session_type: "in_house",
      status: "completed",
      cohort_id: 8,
    },
    {
      title: "Monthly Gathering & Q&A",
      description: "Monthly convergence touchpoint.",
      starts_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      duration_minutes: 60,
      session_type: "in_house",
      status: "scheduled",
      cohort_id: 9,
    },
  ];

  for (const s of sessions) {
    const res = await fetch(`${API_BASE}/v1/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(s),
    });
    const data = await res.json();
    console.log(`Session '${s.title}' status ${res.status}:`, data.data?.title || data.message || data);
  }

  // Check Engagement history
  const historyRes = await fetch(`${API_BASE}/v1/admin/analytics/engagement-history`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
  });
  const historyData = await historyRes.json();
  console.log("\n📈 ENGAGEMENT HISTORY RESULT:", JSON.stringify(historyData, null, 2));

  // Check Admin Overview
  const ovRes = await fetch(`${API_BASE}/v1/admin/overview`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
  });
  const ovData = await ovRes.json();
  console.log("\n📊 UPDATED ADMIN OVERVIEW:", JSON.stringify(ovData, null, 2));
}

seedSessions().catch(console.error);
