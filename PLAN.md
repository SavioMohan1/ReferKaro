# Plan: Production Email Flow Verification

## 1. Files to be Created/Modified
* `[MODIFY]` `PLAN.md` - Track the two controlled production email tests and evidence.
* `[MODIFY]` `src/lib/email/inbound-email.ts` - Stop writing the absent production `applications.updated_at` column during finalization.
* `[MODIFY]` `scripts/test-inbound-email-retry.mjs` - Keep the success-state regression aligned with the production schema.
* `[MODIFY]` `docs/launch-readiness-audit.md` - Record only verified, secret-safe test results.

## 2. Dependencies to be Installed
* None expected. Existing repository scripts, environment configuration, and provider APIs will be used.

## 3. Test Plan
* Inspect the outbound Resend helper, Testmail client, proxy schema, and available secret-safe operational scripts.
* Select a controlled destination that does not expose or unexpectedly contact an unrelated user.
* Send one uniquely tagged outbound message through production Resend and verify its delivery in Testmail.
* Select or create a safe active proxy test record, send one uniquely tagged Testmail message to it, and invoke the protected production poll.
* Verify forwarding evidence, application status transition, proxy deactivation, and retry/idempotency behavior without printing secrets or personal addresses.
* Run the inbound regression suite, TypeScript, production build, secret hygiene, and disk verification.
* Deploy the verified fix and replay the same provider message/idempotency key to complete production finalization without duplicate forwarding.

## 4. Result
* Outbound test `outboundmrw437ri` passed: Resend accepted the message and Testmail received the exact subject.
* Proxy test `proxyflowmrw44bzc` reached Testmail, the production forward was accepted by Resend, and Gmail received the uniquely tagged forwarded message.
* Production finalization exposed two schema mismatches: `applications.updated_at` is absent and the live `applications_status_check` constraint rejects `referred`.
* Removed the nonessential `updated_at` write, passed tests/build, and deployed `dpl_9RNM9rtZYjtYCnQX9YTJbGrQtpkt`.
* The proxy record was restored after each failed finalization attempt; the application remains `accepted` and the proxy remains active until the live status constraint migration is applied.
