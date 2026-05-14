/**
 * Simple in-memory rate limiter for API routes.
 * For production, replace with Redis-based solution (e.g., @upstash/ratelimit).
 */

interface RateLimitEntry {
    count: number
    resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes to prevent memory leaks
setInterval(() => {
    const now = Date.now()
    rateLimitMap.forEach((entry, key) => {
        if (now > entry.resetTime) {
            rateLimitMap.delete(key)
        }
    })
}, 5 * 60 * 1000)

interface RateLimitOptions {
    /** Max requests allowed in the window */
    limit: number
    /** Time window in seconds */
    windowSeconds: number
}

interface RateLimitResult {
    success: boolean
    limit: number
    remaining: number
    resetIn: number // seconds until reset
}

export function rateLimit(
    identifier: string,
    options: RateLimitOptions
): RateLimitResult {
    const now = Date.now()
    const windowMs = options.windowSeconds * 1000
    const key = identifier

    const existing = rateLimitMap.get(key)

    if (!existing || now > existing.resetTime) {
        // New window
        rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
        return {
            success: true,
            limit: options.limit,
            remaining: options.limit - 1,
            resetIn: options.windowSeconds,
        }
    }

    if (existing.count >= options.limit) {
        return {
            success: false,
            limit: options.limit,
            remaining: 0,
            resetIn: Math.ceil((existing.resetTime - now) / 1000),
        }
    }

    existing.count++
    return {
        success: true,
        limit: options.limit,
        remaining: options.limit - existing.count,
        resetIn: Math.ceil((existing.resetTime - now) / 1000),
    }
}

/**
 * Helper to extract IP or user identifier from a request.
 * Falls back to x-forwarded-for header or 'unknown'.
 */
export function getRequestIdentifier(request: Request, userId?: string): string {
    if (userId) return `user:${userId}`
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
    return `ip:${ip}`
}
