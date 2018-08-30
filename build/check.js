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

class Version {
  constructor(major, minor, patch) {
    this.major = major
    this.minor = minor
    this.patch = patch
  }

  toString() {
    return `${this.major}.${this.minor}.${this.patch}`
  }

  get manual() {
    return `${this.major}.${this.minor}`
  }

  static from(commit) {
    const data = JSON.parse(cp.execSync(`git show ${commit}:package.json`).toString('utf8'))
    return new Version(...data.version.match(/^(\d+)\.(\d+)\.(\d+)$/).slice(1))
  }
}

if (TRAVIS_PULL_REQUEST && TRAVIS_BRANCH === 'master') {
  const previous = Version.from('master')
  const current = Version.from(TRAVIS_PULL_REQUEST_SHA)
  if (previous.manual === current.manual) {
    current.patch += 1
    console.log(`The version number will be automatically increased from ${previous} to ${current}.`)
    cp.execSync(`git checkout ${TRAVIS_PULL_REQUEST_BRANCH}`)
    const data = JSON.parse(fs.readFileSync(PACKAGE_PATH).toString('utf8'))
    data.version = current.toString()
    fs.writeFileSync(PACKAGE_PATH, JSON.stringify(data), null, 2)
    cp.execSync(`git add`)
    cp.execSync(`git commit -m "[skip ci] version ${current}"`)
    cp.execSync(`git push`)
  } else {
    console.log(`The version number increases from ${previous} to ${current}.`)
  }
} else {
  console.log('This is not a deploy-related commit.')
}
