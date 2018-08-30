const github = new (require('@octokit/rest'))()
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
}).catch(console.error)
