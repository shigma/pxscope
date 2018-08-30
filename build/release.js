const github = new (require('@octokit/rest'))()
const { version } = require('../package.json')

github.authenticate({
  type: 'oauth',
  token: process.env.GITHUB_OAUTH,
})

github.repos.createRelease({
  repo: 'pxscope',
  owner: 'shigma',
  tag_name: version,
  name: version,
}).then(() => {
  console.log(`Release ${version} created successfully.`)
})