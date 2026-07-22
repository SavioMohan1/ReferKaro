# Plan: Razorpay Alternative Research

## 1. Files to be Created/Modified
* `[MODIFY]` `PLAN.md` - Track the payment-provider comparison and repo evidence.
* No application source files will be changed during this research task.

## 2. Dependencies to be Installed
* None.

## 3. Test Plan
* Inspect the current Razorpay order, verification, webhook, and reconciliation implementation.
* Identify the payment capabilities ReferKaro actually requires from repository evidence.
* Verify current India availability, payment methods, webhook/security model, SDK/API support, and pricing from official provider sources.
* Rank viable alternatives by migration effort, onboarding risk, and production suitability.
* Clearly distinguish payment processors from authentication/billing wrappers such as Clerk.

## 4. Result
* Recommend Cashfree Payments as the first Razorpay replacement to evaluate for ReferKaro.
* PhonePe Payment Gateway is the second choice; PayU is viable but would require a less direct checkout migration.
* Stripe is invite-only in India and lacks local payment methods for Indian accounts, making it a poor launch unblocker.
* Clerk Billing is not a payment gateway replacement: it uses Stripe, is subscription-focused, supports only USD, and is not supported in India.
