#!/usr/bin/env node

const baseUrlArgIndex = process.argv.indexOf('--base-url')
const baseUrl = baseUrlArgIndex >= 0 && process.argv[baseUrlArgIndex + 1]
  ? process.argv[baseUrlArgIndex + 1].replace(/\/$/, '')
  : 'https://referkaro.app'

const pages = [
  { path: '/', marker: 'ReferKaro' },
  { path: '/about', marker: 'ReferKaro' },
  { path: '/jobs', marker: 'ReferKaro' },
  { path: '/contact', marker: 'Get In Touch' },
  { path: '/login', marker: 'ReferKaro' },
  { path: '/privacy', marker: 'ReferKaro' },
  { path: '/terms', marker: 'ReferKaro' }
]

async function checkPage(page) {
  const url = `${baseUrl}${page.path}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'ReferKaroLaunchCheck/1.0'
      }
    })
    const body = await response.text()

    if (!response.ok) {
      return { status: 'FAIL', url, detail: `HTTP ${response.status}` }
    }

    if (!body.includes(page.marker)) {
      return { status: 'FAIL', url, detail: `missing marker "${page.marker}"` }
    }

    return { status: 'PASS', url, detail: `HTTP ${response.status}` }
  } catch (error) {
    const message = error && error.name === 'AbortError'
      ? 'request timed out'
      : error.message || String(error)
    return { status: 'FAIL', url, detail: message }
  } finally {
    clearTimeout(timeout)
  }
}

async function main() {
  console.log(`ReferKaro live-site smoke check for ${baseUrl}`)
  console.log('No secrets are read or printed. This checks public pages only.\n')

  const results = []
  for (const page of pages) {
    const result = await checkPage(page)
    results.push(result)
    console.log(`[${result.status}] ${result.url}: ${result.detail}`)
  }

  const failures = results.filter((result) => result.status === 'FAIL')
  console.log(`\nSummary: ${failures.length} failure(s).`)

  if (failures.length > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error('[ERROR] Live-site smoke check failed unexpectedly.')
  console.error(error && error.message ? error.message : error)
  process.exitCode = 1
})
