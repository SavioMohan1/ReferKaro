# Plan: Production Readiness Step 18 - Email DNS Provider Verification

## 1. Files to be Created/Modified
* `[MODIFY]` `PLAN.md` - Record this focused email/DNS verification task before execution.
* `[POSSIBLE CREATE]` `scripts/check-resend-domain.js` - Add a safe checker for Resend domain status and required DNS records if current repo tooling cannot inspect provider state.
* `[POSSIBLE MODIFY]` `scripts/check-dns-email.js` - Improve DNS/email verification only if provider evidence makes the current check incomplete.
* `[POSSIBLE MODIFY]` `docs/launch-readiness-audit.md` - Record verified provider state and remaining launch blockers.

## 2. Dependencies to be Installed
* None planned.

## 3. Test Plan
* Run `git status -sb` before changes.
* Use current official Resend and Name.com documentation before relying on external API syntax.
* Verify whether the Vercel production `RESEND_API_KEY` can access the ReferKaro domain without printing secrets.
* Run `npm run check:dns-email` and any new provider-specific checker.
* Verify changed files from disk with `Get-Content`.
* Run `npm run check:secret-hygiene` before staging or committing.
* Do not declare email ready until public DNS shows the required MX/SPF/DMARC/DKIM records.
