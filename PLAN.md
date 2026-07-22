# Plan: Testmail Forwarding Retry Safety

## 1. Files to be Created/Modified
* `[MODIFY]` `PLAN.md` - Track the focused Testmail blocker fix and verification.
* `[MODIFY]` `src/lib/email/inbound-email.ts` - Preserve retryability when candidate forwarding fails.
* `[MODIFY]` or `[CREATE]` the existing inbound-email test file - Cover successful, failed, and retried forwarding behavior.
* `[MODIFY]` `docs/launch-readiness-audit.md` - Record only verified results and remaining payment work.

## 2. Dependencies to be Installed
* None expected. Existing repository libraries and test tooling will be used.

## 3. Test Plan
* [x] Inspect the current inbound processor, related database helpers, and existing tests.
* [x] Add a regression test proving a forwarding failure does not mark the application referred or deactivate the proxy.
* [x] Add or retain a success test proving state changes occur only after forwarding succeeds.
* [x] Run the smallest relevant test suite, then lint/type checks and the production build.
* [x] Deploy the verified fix to Vercel production and confirm the live scheduler route remains healthy with the empty Testmail inbox.
* [x] Run secret hygiene and `git diff --check`, then verify modified files from disk.

## 4. Result
* Failed Resend responses and thrown provider errors now leave the application and proxy unchanged for retry.
* Successful forwarding uses a stable Resend idempotency key before marking the application referred and deactivating the proxy.
* Four focused retry tests, TypeScript, the production build, secret hygiene, and the live protected poll pass.
* Production deployment: `dpl_Fj6FXMbXi9u7LtbK8w2q1AQwtsq8`.
