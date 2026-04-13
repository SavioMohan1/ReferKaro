# 🧪 ReferKaro — Full End-to-End Smoke Test Results

**Date:** 2026-04-13  
**Time:** 19:59 IST  
**Environment:** Local (`http://localhost:3000`) + Supabase Cloud  
**Total Runtime:** 32.6 seconds  
**Overall Result:** ✅ **20/20 Checks Passed — Perfect Score**

---

## 🐛 Bugs Discovered & Fixed During This Session

| # | Bug | Severity | Fix Applied |
|---|---|---|---|
| 1 | **Race Condition in Pooling** — 15 concurrent requests all bypassed pool_size check simultaneously | 🔴 Critical | New `safe_pool_apply` PostgreSQL RPC function wraps count + insert atomically with `FOR UPDATE` row lock |
| 2 | **Review Route: `accepted` → `payment_pending` for all jobs** — Git revert caused pooling jobs to be incorrectly mapped to a payment wall | 🔴 Critical | Restored full bifurcated logic: pooling → direct accept, single → token/payment flow |
| 3 | **`application.job.id` undefined in rejection query** — Select query didn't fetch `id` from jobs relation | 🟠 High | Fixed to use `application.job_id` directly; select query updated to include `referral_type` |
| 4 | **`referral_type` not stored on applications** — apply route didn't persist this field after git revert | 🟠 High | Restored job detail fetch + `referral_type` stored on every insert |
| 5 | **Silent RLS failures in DB writes** — `review` and `complete-payment` routes used anon client for privileged writes, which silently failed (0 rows updated) | 🟠 High | Switched all privileged writes (`tokens`, `applications`, `proxy_emails`, `transactions`) to service-role admin client |
| 6 | **Stale token balance in `complete-payment`** — Token balance read from join cache was stale after admin top-up | 🟡 Medium | Added fresh `profiles` query before deduction |

---

## 📋 Test Suite Results

### 🌊 Suite 1 — Pooling Flow

> **Setup:** 1 Employee, 1 Pooling Job (`pool_size: 10`), 15 Job Seekers (5 tokens each)

| Check | Expected | Result |
|---|---|---|
| 15 concurrent apply requests → pool enforces limit | Exactly 10 accepted, 5 blocked with "pool full" | ✅ PASS |
| Employee selects winner from pool | Status → `accepted`, proxy email generated | ✅ PASS |
| All other pool members auto-rejected | 9 remaining → `rejected` instantly | ✅ PASS |

**Sample Proxy Email Generated:** `ref-add56377@referkaro.com`

---

### 💎 Suite 2A — Single Referral (Seeker Has Tokens)

> **Setup:** 1 Employee, 1 Single-Referral Job, 1 Seeker with 15 tokens

| Check | Expected | Result |
|---|---|---|
| Seeker applies → 1 token deducted | Balance: 15 → 14 | ✅ PASS |
| Employee accepts → seeker has ≥9 tokens → direct accept | Status → `accepted` immediately, no payment wall | ✅ PASS |
| Proxy email generated immediately | Unique `ref-xxxx@referkaro.com` address | ✅ PASS |
| 9 tokens deducted on acceptance | Balance: 14 → 5 | ✅ PASS |
| `proxy_emails` row active in DB | `is_active = true` | ✅ PASS |

---

### 💎 Suite 2B — Single Referral (Seeker Needs Top-Up)

> **Setup:** 1 Employee, 1 Single-Referral Job, 1 Seeker with only 3 tokens

| Check | Expected | Result |
|---|---|---|
| Seeker applies → 1 token deducted | Balance: 3 → 2 | ✅ PASS |
| Employee accepts → seeker has <9 tokens → gated | Status → `selected` (not accepted) | ✅ PASS |
| No proxy email before payment | `proxyEmail: null` in response | ✅ PASS |
| Seeker tops up tokens (purchase simulated) | Balance → 12 | ✅ PASS |
| Seeker calls `complete-payment` endpoint | `{ success: true }` | ✅ PASS |
| Application finalized after payment | Status → `accepted` in DB | ✅ PASS |
| 9 tokens deducted on completion | Balance: 12 → 3 | ✅ PASS |
| Proxy email created post-payment | `ref-f16470fc@referkaro.com` in `proxy_emails` table | ✅ PASS |

---

### 🚫 Suite 2C — Rejection Flow

> **Setup:** 1 Employee, 1 Single-Referral Job, 1 Seeker with 5 tokens

| Check | Expected | Result |
|---|---|---|
| Seeker applies → 1 token deducted | Balance: 5 → 4 | ✅ PASS |
| Employee rejects application | Status → `rejected` | ✅ PASS |
| DB status confirmed | `status = 'rejected'` | ✅ PASS |
| No proxy email generated | `proxy_emails` table empty for this application | ✅ PASS |
| Token NOT refunded after rejection | Balance stays at 4 (correct — apply fee is sunk cost) | ✅ PASS |

---

### 🔒 Suite 2D — Edge Case: Duplicate Application

> **Setup:** 1 Employee, 1 Job, 1 Seeker with 10 tokens attempts to apply twice

| Check | Expected | Result |
|---|---|---|
| First application accepted | HTTP 200 | ✅ PASS |
| Second application to same job blocked | HTTP 400 `"You have already applied to this job"` | ✅ PASS |
| Token deducted only once | Balance: 10 → 9 (not 8) | ✅ PASS |

---

### 🔒 Suite 2E — Edge Case: Employee Cannot Apply

> **Setup:** 1 Employee attempts to apply to their own job

| Check | Expected | Result |
|---|---|---|
| Employee blocked from applying | HTTP 403 `"Only job seekers can apply"` | ✅ PASS |

---

## 🏗️ Architecture Changes Made

### New: `safe_pool_apply` PostgreSQL Function
**Location:** `supabase/sql/safe_pool_apply.sql` (deployed to Supabase)  
**Purpose:** Atomic pool application — eliminates race condition  
```sql
-- Locks the job row, checks pool count, deducts token, and inserts application
-- all within a single database transaction.
PERFORM 1 FROM jobs WHERE id = p_job_id FOR UPDATE;
```

### Modified: `src/app/api/applications/apply/route.ts`
- Re-fetches `job.referral_type` + `pool_size` before inserting
- Pooling jobs → calls `safe_pool_apply` RPC (atomic)
- Single-referral jobs → standard sequential flow
- Stores `referral_type` on every application row at insert

### Modified: `src/app/api/applications/review/route.ts`
- Added service-role admin client for all privileged DB writes
- Bifurcated logic: `pooling` → direct accept + bulk reject + proxy email; `single` → token check path
- Fixed `application.job.id` → `application.job_id` bug
- Fixed select query to include `referral_type` from jobs

### Modified: `src/app/api/applications/complete-payment/route.ts`
- Switched all DB operations to service-role admin client
- Added fresh profile token balance fetch (avoids stale join cache)
- Added explicit error checking on every step
- Returns `proxyEmail` in response for client confirmation

### Modified: `src/lib/supabase/server.ts`
- Server client now reads `Authorization: Bearer` header in addition to cookies
- Enables programmatic API calls (scripts, webhooks) to authenticate properly

---

## 🧹 Cleanup
- All 25 test users (auth + profile rows) deleted after the run
- No orphaned data left in development database
- Test script: `scripts/smoke-test.js`

---

## ▶️ How to Re-run the Smoke Test

```bash
# From the project root
node --env-file=.env.local scripts/smoke-test.js
```

> **Note:** Requires `npm run dev` to be running on `localhost:3000` first.

---

*Generated by Antigravity — ReferKaro Internal QA*
