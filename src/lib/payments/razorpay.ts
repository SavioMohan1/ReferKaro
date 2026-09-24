import 'server-only'
import Razorpay from 'razorpay'

export class RazorpayConfigurationError extends Error {}

export function getRazorpayClient() {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim()
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim()
    if (!keyId || !keySecret) throw new RazorpayConfigurationError('Razorpay is not configured')

    return {
        client: new Razorpay({ key_id: keyId, key_secret: keySecret }),
        keyId,
        keySecret,
    }
}

export function getRazorpayErrorStatus(error: unknown) {
    if (!error || typeof error !== 'object') return null
    const status = 'statusCode' in error ? error.statusCode : 'status' in error ? error.status : null
    return typeof status === 'number' ? status : null
}
