const github = new (require('@octokit/rest'))()
const util = require('./util')

github.authenticate({
  type: 'oauth',
  token: process.env.GITHUB_OAUTH,
})

const tag = new util.Version(require('../package.json').version).tag
console.log(`Start to release a new version with tag ${tag} ...`)

github.repos.createRelease({
  repo: 'pxscope',
  owner: 'Shigma',
  tag_name: tag,
  name: tag,
}).then(() => {
  console.log('Release created successfully. Generating release files ...')

  util.exec('wget -nc https://dl.winehq.org/wine-builds/Release.key')
  util.exec('sudo apt-key add Release.key')
  util.exec('sudo apt-add-repository https://dl.winehq.org/wine-builds/ubuntu/')
  util.exec('sudo apt-get install --install-recommends winehq-stable')
  util.exec('sudo apt-get update')
  
  require('./pack')
}).catch(console.error)
