export type EmploymentAnalysis = {
    isVerified: boolean
    confidenceScore: number
    extractedName: string
    extractedCompany: string
    reasoning: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeConfidenceScore(value: unknown, isVerified: boolean) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) return null

    // Gemini occasionally emits a 0-1 fraction even when explicitly asked for a percentage.
    // Only normalize the positive decision case so a genuine 1% rejection stays rejected.
    const percentage = isVerified && value > 0 && value <= 1 ? value * 100 : value
    return Math.round(percentage)
}

export function parseEmploymentAnalysis(value: unknown): EmploymentAnalysis | null {
    if (!isRecord(value) || typeof value.is_verified !== 'boolean') return null

    const confidenceScore = normalizeConfidenceScore(value.confidence_score, value.is_verified)
    const extractedName = typeof value.extracted_name === 'string' ? value.extracted_name.trim() : ''
    const extractedCompany = typeof value.extracted_company === 'string' ? value.extracted_company.trim() : ''
    const reasoning = typeof value.reasoning === 'string' ? value.reasoning.trim().slice(0, 1000) : ''

    if (confidenceScore === null || !extractedName || !extractedCompany || !reasoning) return null

    return {
        isVerified: value.is_verified,
        confidenceScore,
        extractedName,
        extractedCompany,
        reasoning,
    }
}

export function passesAutomaticEmploymentVerification(analysis: EmploymentAnalysis) {
    return analysis.isVerified && analysis.confidenceScore >= 90
}
