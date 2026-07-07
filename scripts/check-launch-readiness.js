#!/usr/bin/env node

const { spawnSync } = require('node:child_process')

function productionEnvArgs() {
  const args = ['scripts/check-launch-env.js', '--production']
  if (process.env.LAUNCH_ENV_FILE) {
    args.push('--env-file', process.env.LAUNCH_ENV_FILE)
  }
  if (process.env.ALLOW_REDACTED_SENSITIVE_ENV === '1') {
    args.push('--allow-redacted-sensitive')
  }
  return args
}

const checks = [
  {
    name: 'Secret hygiene',
    command: process.execPath,
    args: ['scripts/check-secret-hygiene.js']
  },
  {
    name: 'DNS and email',
    command: process.execPath,
    args: ['scripts/check-dns-email.js']
  },
  {
    name: 'Resend domain',
    command: process.execPath,
    args: process.env.LAUNCH_ENV_FILE
      ? ['scripts/check-resend-domain.js', '--env-file', process.env.LAUNCH_ENV_FILE]
      : ['scripts/check-resend-domain.js']
  },
  {
    name: 'Live site smoke',
    command: process.execPath,
    args: ['scripts/check-live-site.js']
  },
  {
    name: 'Deployment metadata',
    command: process.execPath,
    args: ['scripts/check-deployment-metadata.js']
  },
  {
    name: 'Vercel env names',
    command: process.execPath,
    args: ['scripts/check-vercel-env-names.js']
  },
  {
    name: 'Production environment',
    command: process.execPath,
    args: productionEnvArgs()
  }
]

const results = []

console.log('ReferKaro combined launch readiness check')
console.log('No secret values are printed by this orchestrator.\n')

for (const check of checks) {
  console.log(`=== ${check.name} ===`)
  const result = spawnSync(check.command, check.args, {
    stdio: 'inherit'
  })

  if (result.error) {
    console.error(`[ERROR] ${check.name} could not start: ${result.error.message}`)
  }

  const status = result.status === 0 && !result.error ? 'PASS' : 'FAIL'
  results.push({ name: check.name, status })
  console.log(`=== ${check.name}: ${status} ===\n`)
}

const failures = results.filter((result) => result.status === 'FAIL')

console.log('Launch readiness summary')
for (const result of results) {
  console.log(`${result.status} ${result.name}`)
}

if (failures.length > 0) {
  console.log(`\nOverall: NOT READY (${failures.length} failing gate(s))`)
  process.exitCode = 1
} else {
  console.log('\nOverall: READY for the safe automated gates covered by this script')
}
