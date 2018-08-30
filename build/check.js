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
  const prBranch = TRAVIS_PULL_REQUEST_BRANCH || 'master'
  const current = util.Version.from(prBranch)
  const previous = util.Version.from('master')
  if (previous.tag === current.tag) {
    current.patch += 1
    console.log(`The version will be automatically increased from ${previous} to ${current}.\n`)
    util.exec(`git remote set-url origin https://Shigma:${GITHUB_OAUTH}@github.com/Shigma/pxscope.git`)
    util.exec(`git checkout ${prBranch}`)
    fs.writeFileSync(
      path.join(__dirname, '../package.json'),
      JSON.stringify({
        ...require('../package.json'),
        version: current.toString(),
      }, null, 2)
    )
    util.exec(`git add package.json`)
    util.exec(`git commit -m "[skip ci] version ${current}"`)
    util.exec(`git push`)
    console.log('Check succeed.')
  } else {
    console.log(`The version has been increased from ${previous} to ${current}.`)
    console.log('Check succeed.')
  }
} else {
  console.log('Check: This is not a deploy-related commit.')
  console.log('Check Succeed.')
}
