# Plan: Production Readiness Step 19 - Supabase Schema Verification

## 1. Files to be Created/Modified
* `[MODIFY]` `PLAN.md` - Record this focused Supabase schema verification task before execution.
* `[POSSIBLE CREATE]` `scripts/check-supabase-schema.js` - Add a secret-safe checker for production Supabase tables, columns, buckets, and required RPCs.
* `[POSSIBLE MODIFY]` `scripts/check-launch-readiness.js` - Add the Supabase schema checker to the combined launch gate if it proves useful.
* `[POSSIBLE MODIFY]` `package.json` - Add a script alias for the new checker.
* `[POSSIBLE MODIFY]` `docs/launch-readiness-audit.md` - Record verified Supabase state and remaining blockers.

## 2. Dependencies to be Installed
* None planned. Use the existing `@supabase/supabase-js` dependency.

## 3. Test Plan
* Run `git status -sb` before changes.
* Inspect existing Supabase scripts and `sql/production_launch_schema.sql`.
* Verify the pulled Vercel production env file has Supabase URL and service-role key lengths without printing values.
* Run the new checker against `.env.vercel.production.local`.
* Run `npm run check:secret-hygiene`.
* Run the combined launch gate with `LAUNCH_ENV_FILE=.env.vercel.production.local` and `ALLOW_REDACTED_SENSITIVE_ENV=1`.
* Do not declare database readiness unless required production tables, columns, buckets, and RPCs are verified.
