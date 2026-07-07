const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env.local');

function parseDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};

  return fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce((acc, rawLine) => {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) return acc;
      const index = line.indexOf('=');
      if (index === -1) return acc;
      const key = line.slice(0, index).trim();
      let value = line.slice(index + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      acc[key] = value;
      return acc;
    }, {});
}

const localEnv = parseDotEnv(envPath);
const env = { ...localEnv, ...process.env };
const isProductionCheck = process.argv.includes('--production') || env.NODE_ENV === 'production' || env.VERCEL_ENV === 'production';
const results = [];

function valueOf(name) {
  return env[name] || '';
}

function add(status, name, message) {
  results.push({ status, name, message });
}

function requirePresent(name, message = 'required for launch') {
  if (!valueOf(name)) add('fail', name, message);
  else add('pass', name, 'present');
}

function requireUrl(name, expectedHost) {
  const value = valueOf(name);
  if (!value) {
    add('fail', name, 'required URL is missing');
    return;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') add('fail', name, 'must use https');
    else if (expectedHost && url.host !== expectedHost) add('fail', name, `must point to ${expectedHost}`);
    else add('pass', name, 'valid https URL');
  } catch {
    add('fail', name, 'must be a valid URL');
  }
}

function requireSecret(name, minLength = 24) {
  const value = valueOf(name);
  if (!value) add('fail', name, 'required secret is missing');
  else if (value.length < minLength) add('fail', name, `secret should be at least ${minLength} characters`);
  else add('pass', name, 'present with acceptable length');
}

function requireEmail(name, expectedDomain) {
  const value = valueOf(name);
  if (!value) {
    add('fail', name, 'required email/sender is missing');
    return;
  }
  if (!value.includes('@') || !value.includes(expectedDomain)) {
    add('fail', name, `must use ${expectedDomain}`);
    return;
  }
  add('pass', name, `uses ${expectedDomain}`);
}

requireUrl('NEXT_PUBLIC_URL', 'referkaro.app');
requireUrl('NEXT_PUBLIC_SUPABASE_URL');
requirePresent('NEXT_PUBLIC_SUPABASE_ANON_KEY');
requirePresent('SUPABASE_SERVICE_ROLE_KEY');

if (valueOf('NEXT_PUBLIC_SUPABASE_ANON_KEY') && valueOf('SUPABASE_SERVICE_ROLE_KEY') && valueOf('NEXT_PUBLIC_SUPABASE_ANON_KEY') === valueOf('SUPABASE_SERVICE_ROLE_KEY')) {
  add('fail', 'SUPABASE_SERVICE_ROLE_KEY', 'must not match anon key');
}

requirePresent('NEXT_PUBLIC_RAZORPAY_KEY_ID');
requirePresent('RAZORPAY_KEY_SECRET');
requireSecret('RAZORPAY_WEBHOOK_SECRET');
if (isProductionCheck) {
  if (valueOf('NEXT_PUBLIC_RAZORPAY_KEY_ID').startsWith('rzp_test_')) add('fail', 'NEXT_PUBLIC_RAZORPAY_KEY_ID', 'production must use a live Razorpay key');
  if (valueOf('NEXT_PUBLIC_RAZORPAY_KEY_ID').startsWith('rzp_live_')) add('pass', 'NEXT_PUBLIC_RAZORPAY_KEY_ID', 'live Razorpay key detected');
} else if (valueOf('NEXT_PUBLIC_RAZORPAY_KEY_ID').startsWith('rzp_test_')) {
  add('warn', 'NEXT_PUBLIC_RAZORPAY_KEY_ID', 'test key detected; expected for local dev only');
}

requirePresent('GOOGLE_GEMINI_API_KEY');
requirePresent('RESEND_API_KEY');
requireEmail('EMAIL_FROM', 'referkaro.app');

if (valueOf('EMAIL_FROM').includes('onboarding@resend.dev')) {
  add('fail', 'EMAIL_FROM', 'must not use onboarding@resend.dev for launch');
}

if (isProductionCheck && valueOf('FORCE_EMAIL_TO')) {
  add('fail', 'FORCE_EMAIL_TO', 'must be empty in production');
} else if (valueOf('FORCE_EMAIL_TO')) {
  add('warn', 'FORCE_EMAIL_TO', 'set for local/dev email redirection');
} else {
  add('pass', 'FORCE_EMAIL_TO', 'empty');
}

requireEmail('ADMIN_EMAIL', 'referkaro.app');

if (valueOf('PROXY_EMAIL')) requireEmail('PROXY_EMAIL', 'referkaro.app');
else add('warn', 'PROXY_EMAIL', 'missing; app will fall back to proxy@referkaro.app');

if (valueOf('PROXY_EMAIL_DOMAIN') !== 'referkaro.app') add('fail', 'PROXY_EMAIL_DOMAIN', 'must be referkaro.app');
else add('pass', 'PROXY_EMAIL_DOMAIN', 'referkaro.app');

requireSecret('CRON_SECRET');
requireSecret('WEBHOOK_INBOUND_SECRET');

if (!valueOf('SENTRY_AUTH_TOKEN')) {
  add('warn', 'SENTRY_AUTH_TOKEN', 'missing; source map upload may be skipped');
} else {
  add('pass', 'SENTRY_AUTH_TOKEN', 'present');
}

const icon = { pass: 'PASS', warn: 'WARN', fail: 'FAIL' };
const failures = results.filter(r => r.status === 'fail');
const warnings = results.filter(r => r.status === 'warn');

console.log(`ReferKaro launch env check (${isProductionCheck ? 'production' : 'local/dev'} mode)`);
for (const result of results) {
  console.log(`${icon[result.status]} ${result.name}: ${result.message}`);
}
console.log(`Summary: ${failures.length} failure(s), ${warnings.length} warning(s)`);

if (failures.length > 0) {
  process.exitCode = 1;
}
