# Plan: ReferKaro Trustworthy Career Service Rebuild

## Current Implementation Status (2026-08-02)
* Completed: role-based remote admin queue for job and employment review with audit logs.
* Completed: server-only job creation and approved-only public listings.
* Completed: atomic application submission, review, selection completion, and token accounting.
* Completed: private 5MB storage policies for resumes and verification evidence.
* Completed: Azure OpenAI full-pool ranking with strict structured output, two-run cap, and suggestion-only UI.
* Completed: idempotent Razorpay token crediting and direct Orders API integration.
* Completed: Testmail error handling and a secured five-minute GitHub Actions poller.
* Completed: live Supabase migrations, policy cleanup, indexes, schema checks, lint, TypeScript, inbound-email tests, and production build.
* Manual blocker: rotate the Azure key exposed in chat and set `AZURE_OPENAI_API_KEY` in Vercel production.
* Manual blocker: set GitHub Actions secret `REFERKARO_CRON_SECRET` to the same value as Vercel `CRON_SECRET`.
* External blocker: Razorpay currently rejects the configured credentials and the configured key ID is a test key.
* Dashboard setting: enable Supabase Auth leaked-password protection before launch.

## Product Decision
* Serve job seekers and referring employees equally through two explicit pathways under one trust-first brand promise.
* Preserve the ReferKaro name, backend contracts, data models, routes, permissions, and side effects.
* Replace every previous visual decision: fonts, palette, backgrounds, imagery, layout language, component styling, navigation, and motion.
* Keep all public claims evidence-based and label the product clearly as **BETA**.

## 1. Files to be Created/Modified

### Phase 1: Foundation and Public Experience
* `[MODIFY]` `src/app/layout.tsx` - Install the new type system and root shell.
* `[REPLACE]` `src/app/globals.css` - Create a new semantic token, layout, component, responsive, accessibility, and motion system from scratch.
* `[REPLACE]` `src/components/landing-page.tsx` - Build the dual-path, trust-first public experience from scratch.
* `[REPLACE]` `src/components/layout/global-navbar.tsx` - Build the responsive public/authenticated navigation from scratch.
* `[REPLACE]` `src/components/layout/navbar.tsx` - Build the role-aware signed-in navigation from scratch while retaining sign-out behavior.
* `[REPLACE]` `src/components/layout/footer.tsx` - Build a factual, compact footer from scratch.
* `[REPLACE]` `src/app/login/page.tsx` and `src/app/onboarding/page.tsx` - Build new authentication and role-entry experiences while retaining existing Supabase calls.

### Phase 2: Core Product Shells
* `[REPLACE]` job-seeker and employee dashboard components with role-specific command centres.
* `[REPLACE]` jobs list, job detail, create-listing, and application modal presentation while retaining existing queries and API payloads.
* `[REPLACE]` employee review and job-seeker application tracking cards while retaining status/payment actions.
* `[REPLACE]` inbox, verification, token store, and admin presentation while retaining all backend behavior.

### Phase 3: Supporting Pages and Quality
* `[REPLACE]` about, contact, feedback, legal, policy, code-of-conduct, loading, error, and empty-state presentation.
* `[CREATE/MODIFY]` focused browser and component tests for critical user journeys.
* `[MODIFY]` launch documentation with verified behavior and remaining external-service blockers.

## 2. Dependencies to be Installed
* None initially.
* Use `next/font` for the new typography and CSS/React platform primitives for motion.
* Add an animation library only if the handoff choreography cannot remain accessible and maintainable without it.

## 3. Test Plan
* Establish route, API, Supabase table/storage, and payment/email contract baselines before changing each functional surface.
* After every phase, run targeted lint, TypeScript, secret hygiene, and a warning-free production build.
* Verify desktop and mobile layouts, keyboard flow, focus visibility, contrast, reduced motion, and browser console output.
* Verify anonymous, job-seeker, employee, and admin journeys across browser action, API handler, Supabase state, and rendered response.
* Use test-mode payments and safe test accounts only; do not trigger live charges or unintended emails.
* Confirm no backend contract changed by comparing API/lib diffs and exercising the existing launch/schema checks.

## 4. Implementation Record
* Rebuilt the public brand, navigation, footer, authentication, and onboarding to establish a trustworthy dual-audience BETA identity without unsupported metrics.
* Rebuilt role dashboards, inbox, jobs, application submission, review, tracking, token purchase, listing creation, verification, support, feedback, and admin surfaces while preserving existing API, Supabase, storage, and Razorpay contracts.
* Removed unsupported earnings, response-time, usage, review-guarantee, and token-expiry claims because no repository evidence substantiated them.
* Replaced simulated feedback success with an honest prefilled email handoff because no feedback submission endpoint exists in the repository.
* Corrected the seeker token-balance fetch from a render-time state initializer to `useEffect` to avoid a side effect during render.

## 5. Ruflo-Assisted Launch Continuation
* `[AUDIT]` Map current git state, launch blockers, test coverage, agent configuration, and sensitive data boundaries before orchestration.
* `[DECIDE]` Select the smallest Ruflo profile that supports parallel security, test-gap, browser, and deployment review without overriding project rules.
* `[VERIFY]` Re-run launch checks and authenticated critical-path tests before committing or deploying.

### Ruflo Dependencies
* None for the read-only preflight.
* Pin the verified Ruflo version if project initialization is explicitly approved.

### Ruflo Test Plan
* Snapshot repository and agent configuration before initialization and compare generated files afterward.
* Keep federation, autopilot, remote memory, and production-data access disabled.
* Require existing lint, TypeScript, build, launch, browser, payment, email, and Supabase checks to remain green.

## 6. Secure Resume Pool Ranking and Admin Review
* `[AUDIT]` Verify existing resume analysis, application pooling, job approval, admin authorization, Supabase schema/RLS, and Vercel execution paths.
* `[RESEARCH]` Confirm Azure AI/OpenAI authentication and Responses API usage plus current GitHub Student Developer Pack options from official sources.
* `[MODIFY]` Server-only Azure AI client and structured resume-ranking service; never expose credentials to browser bundles or logs.
* `[MODIFY]` Pool completion flow to rank ten resumes automatically and persist ranked results with a maximum of two runs per job pool.
* `[MODIFY]` Employee pool-ranking presentation and admin job-review workflow while retaining approved-only job visibility.
* `[CREATE/MODIFY]` Supabase migration for ranking runs/results, atomic usage enforcement, and admin authorization if repository evidence requires it.
* `[CREATE/MODIFY]` Focused tests for ranking authorization, ten-resume threshold, two-run limit, structured output validation, job approval visibility, and secret hygiene.

### Ranking Dependencies
* Determine after official API and current package inspection; prefer existing platform libraries where practical.
* Azure credentials must remain server-only in local/Vercel environment variables or managed identity.

### Ranking Test Plan
* Prove secrets are absent from git diffs, browser bundles, API responses, logs, and client-visible environment variables.
* Exercise 9-resume no-run, 10th-resume automatic run, deterministic ranking persistence, one rerun, and blocked third run.
* Verify only the listing owner and authorized admins can view rankings or trigger the allowed rerun.
* Verify pending/rejected jobs remain hidden from job seekers and approved jobs become visible.
* Run targeted tests, lint, TypeScript, production build, Supabase schema checks, and browser/API end-to-end verification.

## 7. Current Functionality and Scenario Audit
* `[AUDIT]` Inventory public, authentication, job-seeker, employee, admin, payment, email, proxy, AI, and observability surfaces from repository evidence.
* `[TRACE]` Map happy paths, permission branches, validation failures, limits, external dependencies, and unfinished paths for each feature.
* `[VERIFY]` Cross-check UI claims against API handlers, Supabase schema/RLS, tests, and environment-readiness scripts.

### Audit Dependencies
* None; this is a read-only repository analysis.

### Audit Test Plan
* Enumerate routes and API handlers directly from the file tree.
* Search every external-service integration and authorization check.
* Run non-mutating static checks where practical, and label anything requiring credentials or live services as not runtime-verified.

## 8. Launch Gap Remediation
* `[MODIFY]` Supabase SQL migration(s) for role-based administration, private verification documents, hardened pool application, atomic application/payment transitions, ranking runs/results, and audit records.
* `[MODIFY]` Server authorization helpers and Supabase admin client to centralize privileged access without hardcoded emails.
* `[MODIFY]` Job creation/detail/review paths so verification and approval are enforced server-side and pending jobs cannot be reached directly by seekers.
* `[MODIFY]` Employment verification and admin dashboard so low-confidence submissions receive manual review.
* `[MODIFY]` Resume upload and analysis paths for server-side ownership, file constraints, private storage, and safe structured output handling.
* `[CREATE/MODIFY]` Azure OpenAI server client, ten-candidate/configured-pool batch ranking service, automatic first run, one employee rerun, and ranking presentation.
* `[MODIFY]` Application review/payment/proxy transitions to remove the unreachable payment state and make deductions/finalization retry-safe.
* `[MODIFY]` Testmail scheduling/runtime configuration and readiness checks.
* `[MODIFY]` Focused automated tests, schema checks, environment templates, and operational documentation.

### Remediation Dependencies
* Add the officially supported `openai` JavaScript SDK at a pinned lockfile-resolved version for Azure OpenAI v1 Responses API access.
* Do not add Ruflo to application dependencies; use its staged audit/review workflow only.

### Remediation Test Plan
* Run migration/static SQL review and Supabase security advisors before and after live schema application.
* Prove anonymous/cross-user pool application, resume access, ranking access, and admin actions are denied.
* Test approved-only listing reads, manual employment approval/rejection, automatic ranking, one rerun, blocked third run, and prompt/response validation.
* Test token purchase and referral completion idempotency, failed/retried webhooks, expiry, proxy forwarding, and cron authorization.
* Run lint with zero warnings, TypeScript, focused tests, secret hygiene, production build, schema/readiness checks, and browser verification of public and authenticated paths.
