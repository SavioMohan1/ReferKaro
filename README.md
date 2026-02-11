# ReferKaro 🚀

**ReferKaro** is a referral marketplace connecting Job Seekers with Employees for verified job referrals.

## 🌟 Features

### For Job Seekers 👨‍💻
- **Browse Jobs:** View referral opportunities from verified employees.
- **One-Click Apply:** Use tokens to apply directly.
- **Resume Upload:** Securely upload your resume (PDF/DOCX).
- **Track Applications:** Monitor status (Pending -> Accepted -> Rejected).

### For Employees 💼
- **Post Jobs:** Create listings with official job URLs.
- **Manage Referrals:** innovative dashboard to review candidates.
- **Verify Candidates:** View profiles, cover letters, and resumes.

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), Tailwind CSS, Shadcn UI
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Authentication:** Google OAuth
- **Payments:** Razorpay (Coming Soon)

## 🚀 Getting Started

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/ReferKaro.git
    cd ReferKaro
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📄 Documentation

- [Requirements](docs/requirements.md)
- [Technical Design](docs/design.md)
