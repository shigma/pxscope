const util = require('./util')
const path = require('path')
const fs = require('fs')

const {
  GITHUB_OAUTH,
  TRAVIS_BRANCH,
  TRAVIS_PULL_REQUEST_BRANCH,
} = process.env

console.log()

if (TRAVIS_BRANCH === 'master') {
  console.log(`Check: This is a deploy-related commit.`)
  let prBranch, previous
  if (TRAVIS_PULL_REQUEST_BRANCH) {
    prBranch = TRAVIS_PULL_REQUEST_BRANCH
    previous = util.Version.from('master')
  } else {
    prBranch = 'master'
    const parent = util.exec('git log master -1 --pretty=%P').split(/\s/g)[0]
    previous = util.Version.from(parent)
  }
  const current = util.Version.from(prBranch)
  if (previous.tag === current.tag) {
    current.patch = Math.max(current.patch, previous.patch + 1)
    console.log(`The version will be automatically increased from ${previous} to ${current}.\n`)
    util.exec([
      `git remote set-url origin https://Shigma:${GITHUB_OAUTH}@github.com/Shigma/pxscope.git`,
      `git checkout ${prBranch}`,
    ])
    fs.writeFileSync(
      path.join(__dirname, '../package.json'),
      JSON.stringify({
        ...require('../package.json'),
        version: current.toString(),
      }, null, 2)
    )
    util.exec([
      `git add package.json`,
      `git commit -m "[skip ci] version ${current}"`,
      `git push`,
    ])
    console.log('Check succeed.')
  } else {
    console.log(`The version has been increased from ${previous} to ${current}.`)
    console.log('Check succeed.')
  }
} else {
  console.log('Check: This is not a deploy-related commit.')
  console.log('Check Succeed.')
}
