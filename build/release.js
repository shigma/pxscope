const github = new (require('@octokit/rest'))()
const { execSync } = require('child-process')
const { version } = require('../package.json')

github.authenticate({
  type: 'oauth',
  token: process.env.GITHUB_OAUTH,
})

console.log('Start to release a new version ...')

github.repos.createRelease({
  repo: 'pxscope',
  owner: 'shigma',
  tag_name: version,
  name: version,
}).then(() => {
  console.log(`Release ${version} created successfully.`)
  console.log(`Generating packed files ...`)

  try {
    execSync('wget -nc https://dl.winehq.org/wine-builds/Release.key')
    execSync('sudo apt-key add Release.key')
    execSync('sudo apt-add-repository https://dl.winehq.org/wine-builds/ubuntu/')
    execSync('sudo apt-get install --install-recommends winehq-stable')
    execSync('sudo apt-get update')
  } catch (error) {
    console.error('An error was encounted during the process.')
    console.log(`  Status: ${error.status}`)
    console.log(`  Message: ${error.message}`)
    console.log(`  Stderr: ${error.stderr}`)
    console.log(`  Stdout: ${error.stdout}`)
    throw error
  }
  
  require('./pack')
}).catch(console.error)
