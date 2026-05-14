/**
 * Input validation utilities for ReferKaro.
 */

const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/

const LINKEDIN_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/

/**
 * Validates a URL format.
 */
export function isValidUrl(url: string): boolean {
    return URL_REGEX.test(url)
}

/**
 * Validates a LinkedIn profile URL.
 */
export function isValidLinkedInUrl(url: string): boolean {
    return LINKEDIN_REGEX.test(url)
}

/**
 * Sanitizes text input to prevent XSS in emails/HTML.
 * Escapes HTML special characters.
 */
export function sanitizeHtml(input: string): string {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

/**
 * Validates and sanitizes a cover letter.
 * Returns null if invalid, sanitized string if valid.
 */
export function validateCoverLetter(text: string): { valid: boolean; error?: string; sanitized?: string } {
    const trimmed = text.trim()
    if (trimmed.length < 20) {
        return { valid: false, error: 'Cover letter must be at least 20 characters.' }
    }
    if (trimmed.length > 5000) {
        return { valid: false, error: 'Cover letter must be under 5000 characters.' }
    }
    return { valid: true, sanitized: sanitizeHtml(trimmed) }
}

/**
 * Validates optional URL fields (linkedin, portfolio, job_url).
 * Returns null if empty (optional), error if malformed.
 */
export function validateOptionalUrl(url: string | null | undefined, fieldName: string): { valid: boolean; error?: string } {
    if (!url || url.trim() === '') return { valid: true }
    if (!isValidUrl(url.trim())) {
        return { valid: false, error: `${fieldName} must be a valid URL starting with http:// or https://` }
    }
    return { valid: true }
}
