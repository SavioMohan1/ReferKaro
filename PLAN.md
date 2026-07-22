# Plan: Resend Domain Verification

## 1. Files to be Created/Modified
* `[MODIFY]` `PLAN.md` - Track the Resend DNS verification operation.
* `[MODIFY]` `scripts/check-dns-email.js` - Validate the Resend sending subdomain and DKIM selector used by the deployed architecture.
* `[MODIFY]` `docs/launch-readiness-audit.md` - Record only verified DNS and Resend results.
* No application runtime source files are expected to change.

## 2. Dependencies to be Installed
* None.

## 3. Test Plan
* Confirm the configured Resend key's domain permission without printing the key.
* Inspect the signed-in Resend domain page for the exact DNS records.
* Identify the authoritative DNS provider and add only the Resend-provided records if authenticated access is available.
* Start Resend verification and verify public DNS plus the Resend domain status.
* Run the corrected repository DNS/email check and require zero failures.
* Run the Resend readiness check and document the expected send-only-key limitation.
* Run secret hygiene and disk verification.

## 4. Result
* Name.com and public DNS contain the exact Resend MX, SPF, DKIM, and DMARC records.
* The public DNS/email readiness check passes with zero failures and zero warnings.
* Resend now shows the overall domain, DKIM, MAIL FROM MX, and SPF records as `Verified`, with sending enabled.
* The send-only Resend API key still cannot read domain status and returns `restricted_api_key` as expected; dashboard verification is the authoritative result.
