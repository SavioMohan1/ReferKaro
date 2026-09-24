export const FIXED_CANDIDATE_POOL_SIZE = 10

export type ReferralType = 'single' | 'pooling'

export function parseReferralType(value: unknown): ReferralType | null {
    return value === 'single' || value === 'pooling' ? value : null
}

export function normalizeJobRole(value: unknown) {
    if (typeof value !== 'string') return null

    const role = value.trim()
    return role.length >= 2 && role.length <= 120 ? role : null
}

export function poolSizeForReferralType(referralType: ReferralType) {
    return referralType === 'pooling' ? FIXED_CANDIDATE_POOL_SIZE : null
}
