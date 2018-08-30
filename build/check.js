const cp = require('child_process')
const path = require('path')
const fs = require('fs')

const {
  GITHUB_OAUTH,
  TRAVIS_BRANCH,
  TRAVIS_PULL_REQUEST_BRANCH,
} = process.env

function exec(command) {
  try {
    const result = cp.execSync(command).toString('utf8')
    console.log(result)
    return result
  } catch ({ message }) {
    console.log(message)
    process.exit(1)
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

  static from(branch) {
    const data = JSON.parse(exec(`git show ${branch}:package.json`))
    return new Version(...data.version.match(/^(\d+)\.(\d+)\.(\d+)$/).slice(1))
  }
}

if (TRAVIS_BRANCH === 'master') {
  console.log(`This is a deploy-related commit.\n`)
  const prBranch = TRAVIS_PULL_REQUEST_BRANCH || 'master'
  const current = Version.from(prBranch)
  const previous = Version.from('master')
  if (previous.manual === current.manual) {
    current.patch += 1
    console.log(`The version will be automatically increased from ${previous} to ${current}.`)
    exec(`git remote set-url origin https://Shigma:${GITHUB_OAUTH}@github.com/Shigma/pxscope.git`)
    if (prBranch !== 'master') exec(`git checkout ${prBranch}`)
    fs.writeFileSync(
      path.join(__dirname, '../package.json'),
      JSON.stringify({
        ...require('../package.json'),
        version: current.toString(),
      }, null, 2)
    )
    exec(`git add package.json`)
    exec(`git commit -m "[skip ci] version ${current}"`)
    exec(`git push`)
    console.log('\nCheck succeed.')
  } else {
    console.log(`The version has been increased from ${previous} to ${current}.`)
    console.log('\nCheck succeed.')
  }
} else {
  console.log('This is not a deploy-related commit.')
  console.log('Check succeed.')
}
