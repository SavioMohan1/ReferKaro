export type TestmailEmail = {
    id?: string
    oid?: string
    to?: string
    envelope_to?: string
    from?: string
    envelope_from?: string
    subject?: string
    text?: string
    html?: string
    timestamp?: number
    date?: number
}

export type TestmailInbox = {
    result: string
    message?: string | null
    count?: number
    emails?: TestmailEmail[]
}

export async function fetchTestmailInbox() {
    const apiKey = process.env.TESTMAIL_API_KEY
    const namespace = process.env.TESTMAIL_NAMESPACE

    if (!apiKey || !namespace) {
        throw new Error('TESTMAIL_API_KEY and TESTMAIL_NAMESPACE are required')
    }

    const url = new URL('https://api.testmail.app/api/json')
    url.searchParams.set('apikey', apiKey)
    url.searchParams.set('namespace', namespace)
    url.searchParams.set('limit', process.env.TESTMAIL_POLL_LIMIT || '25')

    if (process.env.TESTMAIL_TAG) {
        url.searchParams.set('tag', process.env.TESTMAIL_TAG)
    }

    if (process.env.TESTMAIL_TIMESTAMP_FROM) {
        url.searchParams.set('timestamp_from', process.env.TESTMAIL_TIMESTAMP_FROM)
    }

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${apiKey}`
        },
        cache: 'no-store'
    })
    const body = await response.json() as TestmailInbox

    if (!response.ok || body.result !== 'success') {
        throw new Error(body.message || `Testmail API failed with HTTP ${response.status}`)
    }

    return {
        ...body,
        emails: [...(body.emails || [])].sort((a, b) => (a.timestamp || a.date || 0) - (b.timestamp || b.date || 0))
    }
}
