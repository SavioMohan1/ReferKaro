# Plan: Production Readiness Step 21 - Launch Operations Runbook

## 1. Files to be Created/Modified
* `[MODIFY]` `PLAN.md` - Record this focused operational unblock task before execution.
* `[CREATE]` `docs/launch-runbook.md` - Document exact, secret-safe steps for Testmail, Razorpay, email DNS, scheduler setup, and final verification.
* `[MODIFY]` `docs/launch-readiness-audit.md` - Record the runbook and keep unresolved launch gates explicit.

## 2. Dependencies to be Installed
* None.

## 3. Test Plan
* Verify every referenced script, route, and configuration file exists in the repository.
* Verify the runbook does not contain credential-like values.
* Run `npm run check:secret-hygiene`.
* Read the created runbook back from disk and inspect `git diff --check`.
* Keep the app marked not ready until DNS/email, Testmail secret, Razorpay live mode, scheduler, and live transaction checks pass.
