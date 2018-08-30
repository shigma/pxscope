const github = new (require('@octokit/rest'))()
const { execSync } = require('child-process')
const { version } = require('../package.json')

github.authenticate({
  type: 'oauth',
  token: process.env.GITHUB_OAUTH,
})

const tag = `v${version.match(/^(\d+\.\d+)\.\d+$/)[0]}`
console.log(`Start to release a new version with tag ${tag} ...`)

github.repos.createRelease({
  repo: 'pxscope',
  owner: 'Shigma',
  tag_name: tag,
  name: tag,
}).then(() => {
  console.log('Release created successfully. Generating release files ...')

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
