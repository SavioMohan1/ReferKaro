#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const args = process.argv.slice(2)
const envFileArgIndex = args.indexOf('--env-file')
const domainArgIndex = args.indexOf('--domain')
const envPath = envFileArgIndex >= 0 && args[envFileArgIndex + 1]
  ? path.resolve(root, args[envFileArgIndex + 1])
  : path.join(root, '.env.local')
const domain = domainArgIndex >= 0 && args[domainArgIndex + 1]
  ? args[domainArgIndex + 1]
  : 'referkaro.app'

function parseDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return {}

  return fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce((acc, rawLine) => {
      const line = rawLine.trim()
      if (!line || line.startsWith('#')) return acc
      const index = line.indexOf('=')
      if (index === -1) return acc
      const key = line.slice(0, index).trim()
      let value = line.slice(index + 1).trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      acc[key] = value
      return acc
    }, {})
}

const envFile = parseDotEnv(envPath)
const env = { ...envFile, ...process.env }

function safeRecordValue(value) {
  if (!value) return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

async function resendRequest(apiKey, route) {
  const response = await fetch(`https://api.resend.com${route}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'User-Agent': 'ReferKaro launch readiness checker'
    }
  })
  const text = await response.text()
  let body
  try {
    body = JSON.parse(text)
  } catch {
    body = { message: text.slice(0, 200) }
  }
  return { response, body }
}

async function main() {
  console.log(`ReferKaro Resend domain check for ${domain}`)
  console.log(`Env file: ${path.relative(root, envPath) || envPath}`)
  console.log('No secret values are printed.\n')

  const apiKey = env.RESEND_API_KEY || ''
  if (!apiKey) {
    console.log('[FAIL] RESEND_API_KEY: missing; cannot verify Resend domain state')
    process.exitCode = 1
    return
  }

  const listResult = await resendRequest(apiKey, '/domains')
  if (!listResult.response.ok) {
    const message = listResult.body && listResult.body.message ? listResult.body.message : 'request failed'
    const name = listResult.body && listResult.body.name ? listResult.body.name : 'unknown_error'
    console.log(`[FAIL] Resend domains API: HTTP ${listResult.response.status} ${name}`)
    console.log(`  ${message}`)
    if (name === 'restricted_api_key') {
      console.log('  Use a Resend API key with domain-read access or verify records from the Resend dashboard.')
    }
    process.exitCode = 1
    return
  }

  const domains = Array.isArray(listResult.body.data) ? listResult.body.data : []
  const target = domains.find((item) => item.name === domain)
  if (!target) {
    console.log(`[FAIL] ${domain}: not found in this Resend account`)
    console.log(`  Resend domains visible to this key: ${domains.length}`)
    process.exitCode = 1
    return
  }

  const sending = target.capabilities && target.capabilities.sending ? target.capabilities.sending : 'unknown'
  const receiving = target.capabilities && target.capabilities.receiving ? target.capabilities.receiving : 'unknown'
  console.log(`[PASS] ${domain}: found in Resend account`)
  console.log(`[INFO] Domain status: ${target.status || 'unknown'}`)
  console.log(`[INFO] Capabilities: sending=${sending}, receiving=${receiving}`)

  const detailResult = await resendRequest(apiKey, `/domains/${target.id}`)
  if (!detailResult.response.ok) {
    const message = detailResult.body && detailResult.body.message ? detailResult.body.message : 'request failed'
    const name = detailResult.body && detailResult.body.name ? detailResult.body.name : 'unknown_error'
    console.log(`[FAIL] Resend domain detail API: HTTP ${detailResult.response.status} ${name}`)
    console.log(`  ${message}`)
    process.exitCode = 1
    return
  }

  const detail = detailResult.body.data || detailResult.body
  const records = Array.isArray(detail.records) ? detail.records : []
  if (records.length === 0) {
    console.log('[WARN] DNS records: Resend did not return provider DNS records for this domain')
  } else {
    console.log(`\nDNS records required by Resend (${records.length}):`)
    for (const record of records) {
      const type = record.record || record.type || 'UNKNOWN'
      const name = safeRecordValue(record.name)
      const value = safeRecordValue(record.value)
      const priority = record.priority !== undefined ? ` priority=${record.priority}` : ''
      const status = record.status ? ` status=${record.status}` : ''
      console.log(`- ${type} ${name} -> ${value}${priority}${status}`)
    }
  }

  if (target.status !== 'verified') {
    console.log(`\n[FAIL] ${domain}: Resend status is ${target.status || 'unknown'}, not verified`)
    process.exitCode = 1
    return
  }

  if (sending !== 'enabled') {
    console.log(`[FAIL] ${domain}: Resend sending capability is ${sending}, not enabled`)
    process.exitCode = 1
    return
  }

  console.log(`\n[PASS] ${domain}: Resend sending domain is verified`)
}

main().catch((error) => {
  console.error('[ERROR] Resend domain check failed unexpectedly.')
  console.error(error && error.message ? error.message : error)
  process.exitCode = 1
})
