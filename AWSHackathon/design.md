# ReferKaro Technical Design

## 🏗️ Architecture Overview

ReferKaro is built as a **Next.js 15** web application using a **Supabase** backend. It acts as an escrow system for both money and information, ensuring trust between Job Seekers and Employees.

### Tech Stack
*   **Frontend:** Next.js 15 (App Router), Tailwind CSS v3.4, Shadcn UI, Lucide React.
*   **Backend:** Next.js API Routes (Serverless), Supabase (PostgreSQL + Auth + Storage).
*   **Database:** PostgreSQL (via Supabase) with Row Level Security (RLS).
*   **Authentication:** Supabase Auth (Google OAuth).
*   **State Management:** React Server Components (RSC) & Server Actions.

---

## 📊 Database Schema

### `profiles` (Users)
- `id`: UUID (PK)
- `email`: Text
- `full_name`: Text
- `avatar_url`: Text
- `role`: Enum ('job_seeker', 'employee')
- `token_balance`: Integer (default 3)
- `has_accepted_terms`: Boolean (default false)
- `terms_accepted_at`: Timestamptz

### `jobs` (Listings)
- `id`: UUID (PK)
- `employee_id`: UUID (FK)
- `company`: Text
- `role_title`: Text
- `description`: Text
- `job_url`: Text (Official posting link)
- `created_at`: Timestamptz

### `applications` (Referral Requests)
- `id`: UUID (PK)
- `job_id`: UUID (FK)
- `job_seeker_id`: UUID (FK)
- `employee_id`: UUID (FK)
- `status`: Enum ('pending', 'accepted', 'rejected')
- `cover_letter`: Text
- `linkedin_url`: Text
- `portfolio_url`: Text
- `resume_url`: Text (Storage Path)
- `applied_at`: Timestamptz
- `reviewed_at`: Timestamptz

### Storage (Supabase)
- **Bucket:** `resumes`
- **Policies:**
  - Insert: Authenticated Job Seekers.
  - Select: Owner (Job Seeker) and Recipient (Employee).
  - Security: Private bucket, accessed via Signed URLs.

### Security (RLS Policies)
- **Profiles:** Users can read/update their own profile.
- **Jobs:** Public read, Employees can insert/update their own.
- **Applications:**
  - Job Seekers: Insert own, Select own.
  - Employees: Select where `employee_id` matches user.

---

## 🔄 Core Workflows

### 1. Application Submission (Atomic Transaction)
1.  **Check Balance:** API verifies user has > 0 tokens.
2.  **Deduct Token:** DB update decements `token_balance`.
3.  **Upload Resume:** File uploaded to secure storage.
4.  **Create Application:** Insert record into `applications` table.
5.  **Error Handling:** If step 4 fails, roll back token deduction to ensure consistency.

### 2. Legal Disclaimer
1.  **Check:** Middleware/Page checks `has_accepted_terms`.
2.  **Prompt:** Modal appears if false.
3.  **Record:** Update profile on acceptance.

---

## 📁 Project Structure
```
src/
├── app/
│   ├── api/          # Server-side API routes (e.g., token deduction)
│   ├── auth/         # Auth callback handlers
│   ├── dashboard/    # Role-based dashboard logic
│   ├── jobs/         # Job browsing and creation pages
│   ├── login/        # Authentication pages
│   └── page.tsx      # Landing page
├── components/
│   ├── dashboard/    # Dashboard widgets (charts, stats)
│   ├── jobs/         # Job cards, forms, modals
│   ├── auth/         # Legal Modal
│   └── ui/           # Shadcn reusable UI components
├── lib/
│   └── supabase/     # Supabase client/server utilities
└── middleware.ts     # Auth session protection
```
