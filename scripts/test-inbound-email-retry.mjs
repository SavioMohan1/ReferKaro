import assert from 'node:assert/strict'
import test from 'node:test'

import { processInboundProxyEmailWithDependencies } from '../src/lib/email/inbound-email.ts'

const email = {
    to: 'ReferKaro <proxy@example.com>',
    from: 'referrer@example.com',
    subject: 'Referral',
    text: 'Please review this candidate.',
    providerMessageId: 'testmail-message-1'
}

function createFakeAdmin({ applicationError = null, proxyError = null } = {}) {
    const updates = []
    const proxyEntry = {
        id: 'proxy-123',
        application_id: 'application-456',
        proxy_address: 'proxy@example.com',
        real_email: 'candidate@example.com',
        is_active: true,
        applications: {
            id: 'application-456',
            status: 'selected',
            job_seeker_id: 'seeker-1',
            job_id: 'job-1'
        }
    }

    return {
        updates,
        client: {
            from(table) {
                return {
                    select() {
                        return {
                            eq() {
                                return {
                                    async single() {
                                        return { data: proxyEntry, error: null }
                                    }
                                }
                            }
                        }
                    },
                    update(values) {
                        return {
                            async eq(column, value) {
                                updates.push({ table, values, column, value })
                                const error = table === 'applications' ? applicationError : proxyError
                                return { error }
                            }
                        }
                    }
                }
            }
        }
    }
}

test('keeps application and proxy retryable when forwarding returns null', async () => {
    const admin = createFakeAdmin()

    await assert.rejects(
        processInboundProxyEmailWithDependencies(email, {
            supabaseAdmin: admin.client,
            sendEmail: async () => null
        }),
        /Failed to forward inbound email/
    )

    assert.deepEqual(admin.updates, [])
})

test('keeps application and proxy retryable when forwarding throws', async () => {
    const admin = createFakeAdmin()

    await assert.rejects(
        processInboundProxyEmailWithDependencies(email, {
            supabaseAdmin: admin.client,
            sendEmail: async () => {
                throw new Error('provider unavailable')
            }
        }),
        /provider unavailable/
    )

    assert.deepEqual(admin.updates, [])
})

test('marks referred and deactivates the proxy only after forwarding succeeds', async () => {
    const admin = createFakeAdmin()
    const sends = []

    const result = await processInboundProxyEmailWithDependencies(email, {
        supabaseAdmin: admin.client,
        sendEmail: async (message) => {
            sends.push(message)
            return { id: 'resend-message-1' }
        }
    })

    assert.equal(result.status, 'processed')
    assert.equal(result.forwarded, true)
    assert.equal(sends[0].idempotencyKey, 'referkaro-inbound-proxy-123')
    assert.deepEqual(admin.updates, [
        {
            table: 'applications',
            values: { status: 'referred' },
            column: 'id',
            value: 'application-456'
        },
        {
            table: 'proxy_emails',
            values: { is_active: false },
            column: 'id',
            value: 'proxy-123'
        }
    ])
})

test('reuses the same idempotency key when database finalization is retried', async () => {
    const failedAdmin = createFakeAdmin({ applicationError: { message: 'temporary database error' } })
    const recoveredAdmin = createFakeAdmin()
    const keys = []
    const sendEmail = async (message) => {
        keys.push(message.idempotencyKey)
        return { id: 'resend-message-1' }
    }

    await assert.rejects(
        processInboundProxyEmailWithDependencies(email, {
            supabaseAdmin: failedAdmin.client,
            sendEmail
        }),
        /Failed to mark application referred/
    )

    const result = await processInboundProxyEmailWithDependencies(email, {
        supabaseAdmin: recoveredAdmin.client,
        sendEmail
    })

    assert.equal(result.status, 'processed')
    assert.deepEqual(keys, [
        'referkaro-inbound-proxy-123',
        'referkaro-inbound-proxy-123'
    ])
})
