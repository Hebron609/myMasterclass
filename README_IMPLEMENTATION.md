# MyMasterclass implementation status

Updated 18 October 2026.

**Newly completed:** category management in Admin Settings, mentor availability, mentorship-session logging and mentee goal edit/status/remove controls are connected and passed live browser checks. Individual mentor assignment, mentor dashboard date filters and the existing in-house meeting/location field are also connected. [Connection results and locations](docs/FRONTEND_API_CONNECTIONS_2026-10-18.md).

The [frontend handoff workbook](docs/Vision2535_Feature_Completion_Tracker.xlsx) groups remaining connections by screen, with a [short introduction](docs/FEATURE_HANDOFF_GUIDE.md). Each row shows how the screen works, its current position and the connection still needed. Backend updates, remaining frontend work, later items and screen examples have their own space.

[Questions for Pamela, Daphne and the backend team](docs/clarifications/QUESTIONS_FOR_PAMELA_DAPHNE_AND_BACKEND.md) are kept separate from work that can proceed within existing controls. Add User currently has temporary password fields that differ from the approved form: the live endpoint rejects account creation without a password. Confirm first-login setup before changing that flow or adding new controls.

The recovered pre-integration dashboard layouts are the UI reference. General-purpose page replacements introduced during API integration have been removed. Real API data now fills the original screens where the existing flow is supported; missing data and unsupported actions remain visible as empty/unavailable states.

- [Live Add user and mentee login check — 18 October](docs/ADD_USER_LOGIN_RETEST_2026-10-18.md)
- [Restoration record, current connections and frontend/backend gaps](docs/UI_RESTORATION_AND_API_GAPS.md)
- [Testing the restored UI](docs/API_TESTING_GUIDE.md)
- [Recovered original UI source archive](docs/Vision2535_UI_Reference_2026-10-15.zip)
- [Historical full live retest from 16 October](docs/BACKEND_FIXES_RETEST_2026-10-16.md)

Authentication, server-verified roles, the same-origin API proxy and the optional password reminder are retained. Password saving still needs its confirmed contract. Following the owner’s clarification, Add User now creates accounts directly with a chosen role and password. A real new mentee signed in and loaded the unassigned dashboard successfully. Email/OTP recovery is deferred by the backend team. Other designed statistics and workflows also need alignment. Read the current report before presenting completion status.

## Local commands

```sh
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

Configure `NEXT_PUBLIC_API_BASE_URL` in `.env.local` to the backend base ending in `/api`. The current appsuite host was authorized by the project owner for disposable test writes during this review. Browser calls use the same-origin `/backend-api` prefix; Next.js forwards them to this configured upstream. Restart/rebuild Next.js after changing the upstream URL. The deployed app must support Next.js rewrites.

The development token tool is optional: set `NEXT_PUBLIC_ENABLE_TOKEN_TOOL=true`, restart development, and paste a test token into the tool. It verifies `/myMasterclass/me` and obtains the role from the API. It is disabled in production and does not require choosing a role manually.

The backend must enforce all permissions. Client-readable routing cookies are UI hints, not server-side authentication. There is no documented token-revocation/refresh route, and no documented password-change contract yet. Earlier claims in historical architecture/setup documents that the project was fully secure or production-ready should not be treated as current acceptance evidence.
