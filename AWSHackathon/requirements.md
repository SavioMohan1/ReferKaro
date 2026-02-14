# ReferKaro MVP Requirements

## 🎯 Core Value Proposition
**"Monetize the Referral Attempt."**
A marketplace where Job Seekers pay for a *guaranteed* referral attempt, and Employees get paid for *making* that attempt.

---

## 👤 User Roles

### 1. Job Seeker (The Payer)
*   **Browse Listings:** View list of "Referrers" filtered by Company, Role, and Department.
*   **Token System:**
    *   **Buy Tokens:** Purchase application credits (e.g., ₹99 for 3 tokens).
    *   **Apply:** Spend 1 token to submit an application to a specific employee.
*   **Application Management:**
    *   **Resume Upload:** Upload PDF/DOCX resumes securely.
    *   View status of applications (`Pending` -> `Accepted` -> `Rejected`).
    *   Navigate to original job postings for verification.

### 2. Employee (The Earner)
*   **Job Listing Management:**
    *   Create job listings with company details, role, and official job URLs.
    *   Manage active listings.
*   **Application Review:**
    *   View pending applications with candidate details (LinkedIn, Portfolio, Cover Letter).
    *   **View Resume:** Download/View candidate's resume securely.
    *   **Accept:** Proceed with the referral process.
    *   **Reject:** Decline the application.
*   **Dashboard:**
    *   Track earnings and referral success rates.
    *   View pending application counts.

---

## 🛠️ Functional Requirements

### Authentication
*   Google OAuth via Supabase for secure login.
*   Role-based onboarding (User selects "Job Seeker" or "Employee").
*   **Legal Disclaimer:** Mandatory acknowledgment of terms (Liability & Privacy) on first login.
*   Secure session management.

### Job Marketplace
*   Two-sided marketplace for posting and browsing referral opportunities.
*   Search and filter capabilities.
*   "Official Job URL" field for authenticity verification.

### Application Flow
*   **Job Seeker:**
    *   Apply using tokens (Atomic transaction).
    *   Upload Resume (Secure Storage).
    *   Prevent duplicate applications to the same job.
*   **Employee:**
    *   Receive real-time (or near real-time) notification of new applications (via dashboard count).
    *   View and Download Resumes.
    *   Accept/Reject workflow updates application status.

### Trust & Verification (Future/Core Feature)
*   **Proxy Email System:**
    *   System generates a unique `[candidate_id]_[random]@referkaro.com` email.
    *   Verifies incoming emails from company domains to confirm successful referral.
    *   Auto-forwards verification emails to candidates.

---

## 🚫 Out of Scope (MVP)
*   **Mobile App:** Web-only interface (responsive).
*   **Social Network Features:** No chat, feeds, or friending.
*   **Complex Matching AI:** Manual selection by users.
