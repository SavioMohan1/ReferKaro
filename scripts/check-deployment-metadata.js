#!/usr/bin/env node

const fs = require('node:fs')
const { spawnSync } = require('node:child_process')

const results = []

function add(status, label, detail) {
  results.push({ status, label, detail })
}

function run(command, args = []) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  })
}

function commandPath(command) {
  const lookup = process.platform === 'win32'
    ? run('where.exe', [command])
    : run('which', [command])

  if (lookup.status !== 0) return null

  const paths = lookup.stdout.split(/\r?\n/).filter(Boolean)
  if (process.platform === 'win32') {
    return paths.find((item) => /\.(cmd|exe|bat)$/i.test(item)) || paths[0] || null
  }

  return paths[0] || null
}

function checkVercelLink() {
  const projectPath = '.vercel/project.json'
  if (!fs.existsSync(projectPath)) {
    add('FAIL', 'Vercel project link', '.vercel/project.json is missing')
    return
  }

  try {
    const project = JSON.parse(fs.readFileSync(projectPath, 'utf8'))
    if (project.projectName !== 'referkaro') {
      add('FAIL', 'Vercel project link', `linked project is ${project.projectName || 'unknown'}, expected referkaro`)
      return
    }

    if (!project.projectId || !project.orgId) {
      add('FAIL', 'Vercel project link', 'projectId or orgId is missing')
      return
    }

    add('PASS', 'Vercel project link', 'linked to project referkaro')
  } catch (error) {
    add('FAIL', 'Vercel project link', `could not parse ${projectPath}`)
  }
}

function checkVercelCli() {
  const vercelPath = commandPath('vercel')
  if (!vercelPath) {
    add('FAIL', 'Vercel CLI', 'vercel command was not found')
    return
  }

  add('PASS', 'Vercel CLI', 'vercel command is available')
}

function checkGitRemote() {
  const remote = run('git', ['remote', '-v'])
  if (remote.status !== 0) {
    add('FAIL', 'Git remote', 'could not read git remotes')
    return
  }

  const output = remote.stdout.trim()
  if (!output) {
    add('FAIL', 'Git remote', 'no git remote configured')
    return
  }

  if (/https?:\/\/[^/\s@]+@/.test(output) || /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/.test(output)) {
    add('FAIL', 'Git remote', 'remote URL contains credential-like material')
    return
  }

  if (!output.includes('github.com/SavioMohan1/ReferKaro.git')) {
    add('WARN', 'Git remote', 'remote is token-free but not the expected GitHub repo URL')
    return
  }

  add('PASS', 'Git remote', 'origin is token-free and points to the expected repo')
}

function checkBranch() {
  const branch = run('git', ['branch', '--show-current'])
  if (branch.status !== 0) {
    add('FAIL', 'Git branch', 'could not determine current branch')
    return
  }

  const name = branch.stdout.trim()
  if (name !== 'main') {
    add('WARN', 'Git branch', `current branch is ${name || 'detached'}, not main`)
    return
  }

  add('PASS', 'Git branch', 'main')
}

function checkWorkingTree() {
  const status = run('git', ['status', '--porcelain'])
  if (status.status !== 0) {
    add('FAIL', 'Working tree', 'could not read git status')
    return
  }

  const changes = status.stdout.split(/\r?\n/).filter(Boolean)
  if (changes.length > 0) {
    add('FAIL', 'Working tree', `${changes.length} pending change(s) must be committed/deployed`)
    return
  }

  add('PASS', 'Working tree', 'clean')
}

console.log('ReferKaro deployment metadata check')
console.log('No secrets are read or printed. This checks local metadata only.\n')

checkVercelLink()
checkVercelCli()
checkGitRemote()
checkBranch()
checkWorkingTree()

for (const result of results) {
  console.log(`[${result.status}] ${result.label}: ${result.detail}`)
}

const failures = results.filter((result) => result.status === 'FAIL')
const warnings = results.filter((result) => result.status === 'WARN')
console.log(`\nSummary: ${failures.length} failure(s), ${warnings.length} warning(s).`)

if (failures.length > 0) {
  process.exitCode = 1
}
