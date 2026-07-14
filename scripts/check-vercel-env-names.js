#!/usr/bin/env node

const { spawnSync } = require('node:child_process')

const requiredNames = [
  'NEXT_PUBLIC_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
  'GOOGLE_GEMINI_API_KEY',
  'RESEND_API_KEY',
  'EMAIL_FROM',
  'ADMIN_EMAIL',
  'PROXY_EMAIL',
  'PROXY_EMAIL_DOMAIN',
  'TESTMAIL_API_KEY',
  'TESTMAIL_NAMESPACE',
  'CRON_SECRET',
  'WEBHOOK_INBOUND_SECRET'
]

function runVercelEnvList() {
  if (process.platform === 'win32') {
    return spawnSync('cmd.exe', ['/c', 'vercel', 'env', 'ls', 'production'], {
      encoding: 'utf8',
      timeout: 20000,
      stdio: ['ignore', 'pipe', 'pipe']
    })
  }

  return spawnSync('vercel', ['env', 'ls', 'production'], {
    encoding: 'utf8',
    timeout: 20000,
    stdio: ['ignore', 'pipe', 'pipe']
  })
}

function extractNames(output) {
  const names = new Set()
  for (const name of requiredNames) {
    const pattern = new RegExp(`(^|[^A-Z0-9_])${name}([^A-Z0-9_]|$)`)
    if (pattern.test(output)) {
      names.add(name)
    }
  }
  return names
}

console.log('ReferKaro Vercel production env-name check')
console.log('No secret values are printed. This checks variable names only.\n')

const result = runVercelEnvList()

if (result.error && result.error.code === 'ETIMEDOUT') {
  console.log('[FAIL] Vercel env list: command timed out after 20s; CLI may need login or non-interactive auth')
  process.exitCode = 1
  process.exit()
}

if (result.error) {
  console.log(`[FAIL] Vercel env list: ${result.error.message}`)
  process.exitCode = 1
  process.exit()
}

const combinedOutput = `${result.stdout || ''}\n${result.stderr || ''}`
if (result.status !== 0) {
  console.log('[FAIL] Vercel env list: command failed; authenticate Vercel CLI or verify project access')
  const safeLines = combinedOutput
    .split(/\r?\n/)
    .filter((line) => line && !line.includes('='))
    .slice(0, 6)
  for (const line of safeLines) {
    console.log(`  ${line}`)
  }
  process.exitCode = 1
  process.exit()
}

const foundNames = extractNames(combinedOutput)
let failures = 0

for (const name of requiredNames) {
  if (foundNames.has(name)) {
    console.log(`[PASS] ${name}: present in Vercel production env list`)
  } else {
    console.log(`[FAIL] ${name}: not found in Vercel production env list`)
    failures += 1
  }
}

console.log(`\nSummary: ${failures} missing required production env name(s).`)

if (failures > 0) {
  process.exitCode = 1
}
