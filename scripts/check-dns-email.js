#!/usr/bin/env node

const dns = require('node:dns').promises
const { execFileSync } = require('node:child_process')

const args = process.argv.slice(2)
const domainArgIndex = args.indexOf('--domain')
const domain = domainArgIndex >= 0 && args[domainArgIndex + 1]
  ? args[domainArgIndex + 1]
  : 'referkaro.app'

const expectedVercelApexIp = '76.76.21.21'
const results = []

function pass(label, detail) {
  results.push({ status: 'PASS', label, detail })
}

function warn(label, detail) {
  results.push({ status: 'WARN', label, detail })
}

function fail(label, detail) {
  results.push({ status: 'FAIL', label, detail })
}

function normalizeRows(value) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function resolveWithPowerShell(type, name) {
  if (process.platform !== 'win32') {
    return null
  }

  const safeName = name.replace(/'/g, "''")
  const command = [
    "$ErrorActionPreference = 'Stop'",
    `$records = Resolve-DnsName -Name '${safeName}' -Type ${type} -ErrorAction Stop`,
    '$records | Select-Object Name,Type,IPAddress,NameExchange,Preference,Strings,NameHost | ConvertTo-Json -Compress'
  ].join('; ')

  try {
    const raw = execFileSync('powershell.exe', ['-NoProfile', '-Command', command], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim()
    if (!raw) return []

    const rows = normalizeRows(JSON.parse(raw))
    switch (type) {
      case 'A':
      case 'AAAA':
        return rows.map((row) => row.IPAddress).filter(Boolean)
      case 'CNAME':
        return rows.map((row) => row.NameHost).filter(Boolean)
      case 'MX':
        return rows
          .filter((row) => row.NameExchange)
          .map((row) => ({ exchange: row.NameExchange, priority: row.Preference ?? 0 }))
      case 'TXT':
        return rows
          .map((row) => Array.isArray(row.Strings) ? row.Strings.join('') : row.Strings)
          .filter(Boolean)
      default:
        throw new Error(`Unsupported DNS record type: ${type}`)
    }
  } catch (error) {
    return []
  }
}

async function resolveSafe(type, name) {
  try {
    switch (type) {
      case 'A':
        return await dns.resolve4(name)
      case 'AAAA':
        return await dns.resolve6(name)
      case 'CNAME':
        return await dns.resolveCname(name)
      case 'MX':
        return await dns.resolveMx(name)
      case 'TXT':
        return (await dns.resolveTxt(name)).map((parts) => parts.join(''))
      default:
        throw new Error(`Unsupported DNS record type: ${type}`)
    }
  } catch (error) {
    const fallback = resolveWithPowerShell(type, name)
    if (fallback !== null) {
      return fallback
    }

    if (['ENODATA', 'ENOTFOUND', 'ENODOMAIN', 'ETIMEOUT', 'ECONNREFUSED'].includes(error.code)) {
      return []
    }
    throw error
  }
}

async function main() {
  console.log(`ReferKaro DNS/email readiness check for ${domain}`)
  console.log('No secrets are read or printed. This checks public DNS only.\n')

  const apexA = await resolveSafe('A', domain)
  if (apexA.includes(expectedVercelApexIp)) {
    pass('Web apex A record', `${domain} points to Vercel apex IP ${expectedVercelApexIp}.`)
  } else if (apexA.length > 0) {
    fail('Web apex A record', `${domain} has A record(s) ${apexA.join(', ')}, but not expected Vercel apex IP ${expectedVercelApexIp}.`)
  } else {
    fail('Web apex A record', `${domain} has no public A record.`)
  }

  const wwwCname = await resolveSafe('CNAME', `www.${domain}`)
  const wwwA = await resolveSafe('A', `www.${domain}`)
  if (wwwCname.length > 0 || wwwA.length > 0) {
    pass('www record', `www.${domain} resolves publicly.`)
  } else {
    warn('www record', `www.${domain} does not resolve publicly. This is optional if the launch only uses the apex domain.`)
  }

  const mx = await resolveSafe('MX', domain)
  if (mx.length > 0) {
    pass('Inbound email MX', `${domain} has ${mx.length} MX record(s).`)
  } else {
    fail('Inbound email MX', `${domain} has no public MX records, so domain mailbox/inbound routing is not ready.`)
  }

  const rootTxt = await resolveSafe('TXT', domain)
  const spf = rootTxt.find((record) => record.toLowerCase().startsWith('v=spf1'))
  if (spf) {
    pass('SPF TXT', `${domain} has an SPF record.`)
  } else {
    fail('SPF TXT', `${domain} has no SPF TXT record for sender authentication.`)
  }

  const dmarcTxt = await resolveSafe('TXT', `_dmarc.${domain}`)
  const dmarc = dmarcTxt.find((record) => record.toLowerCase().startsWith('v=dmarc1'))
  if (dmarc) {
    pass('DMARC TXT', `_dmarc.${domain} has a DMARC record.`)
  } else {
    fail('DMARC TXT', `_dmarc.${domain} has no DMARC TXT record.`)
  }

  warn('DKIM TXT', 'DKIM selector is provider-specific and cannot be verified until the email provider supplies the selector record(s).')

  for (const result of results) {
    console.log(`[${result.status}] ${result.label}: ${result.detail}`)
  }

  const failCount = results.filter((result) => result.status === 'FAIL').length
  const warnCount = results.filter((result) => result.status === 'WARN').length
  console.log(`\nSummary: ${failCount} failure(s), ${warnCount} warning(s).`)

  if (failCount > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error('[ERROR] DNS/email readiness check failed unexpectedly.')
  console.error(error && error.message ? error.message : error)
  process.exitCode = 1
})