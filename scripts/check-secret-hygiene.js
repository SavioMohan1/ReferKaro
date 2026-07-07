#!/usr/bin/env node

const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const root = process.cwd()
const findings = []

const textExtensions = new Set([
  '.cjs', '.css', '.csv', '.env', '.example', '.html', '.js', '.json', '.jsx', '.md', '.mjs', '.sql', '.svg', '.ts', '.tsx', '.txt', '.yaml', '.yml'
])

const skippedPathParts = new Set([
  '.git', '.next', 'node_modules', 'dist', 'build', '.vercel', 'coverage'
])

const detectors = [
  {
    name: 'GitHub personal access token',
    pattern: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g
  },
  {
    name: 'Credential embedded in URL',
    pattern: /https?:\/\/[^\s/:@]+:[^\s/@]+@[^\s]+/g
  },
  {
    name: 'Token embedded in GitHub URL',
    pattern: /https?:\/\/gh[pousr]_[A-Za-z0-9_]{20,}@github\.com\//g
  },
  {
    name: 'Named token or API key with long hex value',
    pattern: /\b(?:token|api[_-]?key|secret|password)\b[^\n]{0,40}\b[a-f0-9]{32,64}\b/gi
  },
  {
    name: 'Private key block',
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g
  }
]

function run(command, args) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  })
}

function shouldScan(file) {
  const normalized = file.split(/[\\/]+/)
  if (normalized.some((part) => skippedPathParts.has(part))) return false

  const base = path.basename(file)
  if (base === 'package-lock.json') return false
  if (base === 'pnpm-lock.yaml') return false
  if (base === 'yarn.lock') return false

  const ext = path.extname(file).toLowerCase()
  if (textExtensions.has(ext)) return true
  if (base.includes('.env')) return true
  return false
}

function record(scope, detector, location) {
  findings.push({ scope, detector, location })
}

function scanText(scope, text) {
  const lines = text.split(/\r?\n/)
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    for (const detector of detectors) {
      detector.pattern.lastIndex = 0
      if (detector.pattern.test(line)) {
        record(scope, detector.name, `line ${index + 1}`)
      }
    }
  }
}

function getRepoFiles() {
  const output = run('git', ['ls-files', '--cached', '--others', '--exclude-standard'])
  return output.split(/\r?\n/).filter(Boolean)
}

function scanRepoFiles() {
  const files = getRepoFiles()
  for (const file of files) {
    if (!shouldScan(file)) continue

    const fullPath = path.join(root, file)
    if (!fs.existsSync(fullPath)) continue
    const stat = fs.statSync(fullPath)
    if (!stat.isFile()) continue
    if (stat.size > 1024 * 1024) continue

    const text = fs.readFileSync(fullPath, 'utf8')
    scanText(file, text)
  }
}

function scanGitRemotes() {
  const remotes = run('git', ['remote', '-v'])
  scanText('git remote -v', remotes)
}

function main() {
  console.log('ReferKaro secret hygiene check')
  console.log('No secret values are printed. Findings show only scope, detector, and location.\n')

  scanRepoFiles()
  scanGitRemotes()

  if (findings.length === 0) {
    console.log('[PASS] No credential-like patterns found in scanned repo files or git remotes.')
    return
  }

  for (const finding of findings) {
    console.log(`[FAIL] ${finding.scope} (${finding.location}): ${finding.detector}`)
  }

  console.log(`\nSummary: ${findings.length} finding(s).`)
  process.exitCode = 1
}

try {
  main()
} catch (error) {
  console.error('[ERROR] Secret hygiene check failed unexpectedly.')
  console.error(error && error.message ? error.message : error)
  process.exitCode = 1
}