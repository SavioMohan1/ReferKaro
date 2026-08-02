#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')
const dns = require('node:dns').promises
const { createClient } = require('@supabase/supabase-js')

const root = path.resolve(__dirname, '..')
const args = process.argv.slice(2)
const envFileArgIndex = args.indexOf('--env-file')
const envPath = envFileArgIndex >= 0 && args[envFileArgIndex + 1]
  ? path.resolve(root, args[envFileArgIndex + 1])
  : path.join(root, '.env.local')

const requiredTables = [
  {
    name: 'profiles',
    columns: ['id', 'email', 'full_name', 'role', 'token_balance', 'company', 'is_verified', 'verification_status', 'verification_document_url', 'has_accepted_terms', 'terms_accepted_at']
  },
  {
    name: 'jobs',
    columns: ['id', 'employee_id', 'company', 'role_title', 'department', 'location', 'job_type', 'experience_level', 'description', 'requirements', 'referral_fee', 'job_url', 'referral_type', 'pool_size', 'is_active', 'approval_status', 'admin_feedback', 'approved_at']
  },
  {
    name: 'applications',
    columns: ['id', 'job_id', 'job_seeker_id', 'employee_id', 'cover_letter', 'linkedin_url', 'portfolio_url', 'resume_url', 'status', 'referral_type', 'selected_at', 'applied_at', 'reviewed_at']
  },
  {
    name: 'transactions',
    columns: ['id', 'user_id', 'amount', 'tokens_added', 'status', 'razorpay_order_id', 'razorpay_payment_id', 'application_id', 'type', 'created_at']
  },
  {
    name: 'proxy_emails',
    columns: ['id', 'application_id', 'proxy_address', 'real_email', 'is_active', 'created_at']
  },
  {
    name: 'notifications',
    columns: ['id', 'user_id', 'application_id', 'type', 'title', 'body', 'job_link', 'is_read', 'created_at']
  },
  {
    name: 'resume_ranking_runs',
    columns: ['id', 'job_id', 'requested_by', 'trigger_kind', 'run_number', 'status', 'model', 'created_at']
  },
  {
    name: 'resume_ranking_results',
    columns: ['id', 'run_id', 'application_id', 'rank', 'score', 'summary', 'strengths', 'gaps']
  },
  {
    name: 'admin_audit_logs',
    columns: ['id', 'admin_user_id', 'action', 'resource_type', 'resource_id', 'metadata', 'created_at']
  }
]

const requiredBuckets = [
  { id: 'resumes', public: false },
  { id: 'verification-documents', public: false }
]

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

const localEnv = parseDotEnv(envPath)
const env = { ...localEnv, ...process.env }

function add(results, status, label, detail) {
  results.push({ status, label, detail })
}

function printResults(results) {
  for (const result of results) {
    console.log(`[${result.status}] ${result.label}: ${result.detail}`)
  }
  const failures = results.filter((result) => result.status === 'FAIL').length
  const warnings = results.filter((result) => result.status === 'WARN').length
  console.log(`\nSummary: ${failures} failure(s), ${warnings} warning(s).`)
  if (failures > 0) {
    process.exitCode = 1
  }
}

async function checkTable(supabase, results, table) {
  const selectColumns = table.columns.join(',')
  const { error } = await supabase
    .from(table.name)
    .select(selectColumns)
    .limit(1)

  if (error) {
    add(results, 'FAIL', `Table ${table.name}`, error.message)
    return
  }

  add(results, 'PASS', `Table ${table.name}`, `columns verified: ${table.columns.join(', ')}`)
}

async function checkBuckets(supabase, results) {
  const { data, error } = await supabase.storage.listBuckets()
  if (error) {
    add(results, 'FAIL', 'Storage buckets', error.message)
    return
  }

  for (const expected of requiredBuckets) {
    const bucket = (data || []).find((item) => item.id === expected.id || item.name === expected.id)
    if (!bucket) {
      add(results, 'FAIL', `Storage bucket ${expected.id}`, 'bucket not found')
      continue
    }
    if (bucket.public !== expected.public) {
      add(results, 'FAIL', `Storage bucket ${expected.id}`, `public=${bucket.public}, expected ${expected.public}`)
      continue
    }
    add(results, 'PASS', `Storage bucket ${expected.id}`, `public=${bucket.public}`)
  }
}

async function checkAtomicApplicationRpc(supabase, results) {
  const zeroUuid = '00000000-0000-0000-0000-000000000000'
  const { error } = await supabase.rpc('submit_application', {
    p_job_id: zeroUuid,
    p_cover_letter: 'schema-check-no-write',
    p_linkedin_url: null,
    p_portfolio_url: null,
    p_resume_url: null
  })

  if (error && (error.message.includes('unauthorized') || error.message.includes('job_unavailable'))) {
    add(results, 'PASS', 'RPC submit_application', 'function exists and rejected the no-write probe')
    return
  }
  add(results, 'FAIL', 'RPC submit_application', error?.message || 'unexpected successful no-write probe')
}

async function main() {
  const results = []
  console.log('ReferKaro Supabase schema readiness check')
  console.log(`Env file: ${path.relative(root, envPath) || envPath}`)
  console.log('No secret values are printed.\n')

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || ''
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || ''
  let supabaseHost = ''

  if (!supabaseUrl) {
    add(results, 'FAIL', 'NEXT_PUBLIC_SUPABASE_URL', 'missing')
  } else {
    try {
      const parsedUrl = new URL(supabaseUrl)
      supabaseHost = parsedUrl.host
      if (parsedUrl.protocol !== 'https:') {
        add(results, 'FAIL', 'NEXT_PUBLIC_SUPABASE_URL', 'must use https')
      }
    } catch {
      add(results, 'FAIL', 'NEXT_PUBLIC_SUPABASE_URL', 'invalid URL')
    }
  }
  if (!serviceRoleKey) {
    add(results, 'FAIL', 'SUPABASE_SERVICE_ROLE_KEY', 'missing')
  }
  if (results.length > 0) {
    printResults(results)
    return
  }

  try {
    await dns.lookup(supabaseHost)
    add(results, 'PASS', 'Supabase host DNS', `${supabaseHost} resolves`)
  } catch (error) {
    add(results, 'FAIL', 'Supabase host DNS', `${supabaseHost} does not resolve: ${error.code || error.message}`)
    printResults(results)
    return
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  for (const table of requiredTables) {
    await checkTable(supabase, results, table)
  }
  await checkBuckets(supabase, results)
  await checkAtomicApplicationRpc(supabase, results)

  printResults(results)
}

main().catch((error) => {
  console.error('[ERROR] Supabase schema readiness check failed unexpectedly.')
  console.error(error && error.message ? error.message : error)
  process.exitCode = 1
})
