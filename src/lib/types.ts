/**
 * Shared TypeScript types for ReferKaro.
 */

export interface Profile {
    id: string
    email: string
    full_name: string
    role: 'job_seeker' | 'employee' | 'admin'
    token_balance: number | null
    company: string | null
    is_verified: boolean
    verification_status: 'pending' | 'verified' | 'rejected' | null
    verification_score: number | null
    verification_feedback: string | null
    verification_document_url: string | null
    has_accepted_terms: boolean
    created_at: string
}

export interface Job {
    id: string
    employee_id: string
    company: string
    role_title: string
    department: string | null
    location: string
    job_type: 'full_time' | 'part_time' | 'contract' | 'internship'
    experience_level: 'entry' | 'mid' | 'senior' | 'lead'
    description: string
    requirements: string | null
    job_url: string | null
    referral_type: 'single' | 'pooling'
    pool_size: number | null
    referral_fee: number
    is_active: boolean
    approval_status: 'pending' | 'approved' | 'rejected'
    admin_feedback: string | null
    created_at: string
    approved_at: string | null
}

export interface Application {
    id: string
    job_id: string
    job_seeker_id: string
    employee_id: string
    cover_letter: string
    linkedin_url: string | null
    portfolio_url: string | null
    resume_url: string | null
    status: 'pending' | 'selected' | 'payment_pending' | 'accepted' | 'rejected' | 'expired' | 'referred'
    referral_type: 'single' | 'pooling'
    applied_at: string
    selected_at: string | null
    updated_at: string | null
}

export interface Transaction {
    id: string
    user_id: string
    amount: number
    tokens_added: number
    status: 'pending' | 'success' | 'failed'
    razorpay_order_id: string
    razorpay_payment_id: string | null
    type: 'token' | 'success_fee'
    application_id: string | null
    created_at: string
}

export interface Notification {
    id: string
    user_id: string
    application_id: string | null
    type: string
    title: string
    body: string
    job_link: string | null
    is_read: boolean
    created_at: string
}

export interface ProxyEmail {
    id: string
    application_id: string
    proxy_address: string
    real_email: string
    is_active: boolean
    created_at: string
}

/** User object from Supabase Auth */
export interface AuthUser {
    id: string
    email?: string
    user_metadata: {
        full_name?: string
        avatar_url?: string
    }
}
