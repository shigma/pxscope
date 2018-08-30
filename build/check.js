const cp = require('child_process')
const path = require('path')
const fs = require('fs')

const {
  TRAVIS_BRANCH,
  TRAVIS_PULL_REQUEST,
  TRAVIS_PULL_REQUEST_SHA,
  TRAVIS_PULL_REQUEST_BRANCH,
} = process.env

const PACKAGE_PATH = path.join(__dirname, '../package.json')

function exec(command) {
  try {
    return cp.execSync(command)
  } catch (error) {
    console.error('An error was encounted during the process.')
    console.log(`  Status: ${error.status}`)
    console.log(`  Message: ${error.message}`)
    console.log(`  Stderr: ${error.stderr}`)
    console.log(`  Stdout: ${error.stdout}`)
    throw error
  }
}

class Version {
  constructor(major, minor, patch) {
    this.major = Number(major)
    this.minor = Number(minor)
    this.patch = Number(patch)
  }

  toString() {
    return `${this.major}.${this.minor}.${this.patch}`
  }

  get manual() {
    return `${this.major}.${this.minor}`
  }

  static from(commit) {
    const data = JSON.parse(exec(`git show ${commit}:package.json`).toString('utf8'))
    return new Version(...data.version.match(/^(\d+)\.(\d+)\.(\d+)$/).slice(1))
  }
}

if (TRAVIS_PULL_REQUEST === 'true' && TRAVIS_BRANCH === 'master') {
  console.log('Version checking ...')
  console.log(`  From: ${TRAVIS_PULL_REQUEST_BRANCH}`)
  console.log(`  SHA: ${TRAVIS_PULL_REQUEST_SHA}`)

  const previous = Version.from('master')
  const current = Version.from(TRAVIS_PULL_REQUEST_SHA)
  if (previous.manual === current.manual) {
    current.patch += 1
    console.log(`The version number will be automatically increased from ${previous} to ${current}.`)
    exec(`git checkout ${TRAVIS_PULL_REQUEST_BRANCH}`)
    const data = JSON.parse(fs.readFileSync(PACKAGE_PATH).toString('utf8'))
    data.version = current.toString()
    fs.writeFileSync(PACKAGE_PATH, JSON.stringify(data), null, 2)
    exec(`git add package.json`)
    exec(`git commit -m "[skip ci] version ${current}"`)
    exec(`git push`)
  } else {
    console.log(`The version number increases from ${previous} to ${current}.`)
  }
} else {
  console.log('This is not a deploy-related commit.')
  console.log(`  PR: ${TRAVIS_PULL_REQUEST}`)
  console.log(`  BRANCH: ${TRAVIS_BRANCH}`)
}
