const github = new (require('@octokit/rest'))()
const util = require('./util')

console.log()

github.authenticate({
  type: 'oauth',
  token: process.env.GITHUB_OAUTH,
})

const tag = new util.Version(require('../package.json').version).tag

!async function() {
  if (util.exec('git tag -l', { show: false }).split(/\r?\n/).includes(tag)) {
    console.log(`Tag ${tag} already exists.`)
  } else {
    console.log(`Start to release a new version with tag ${tag} ...`)
    return github.repos.createRelease({
      repo: 'pxscope',
      owner: 'Shigma',
      tag_name: tag,
      name: `Pixiv Scope ${tag}`,
    }).then(() => {
      console.log('Release created successfully.')
    }, (error) => {
      console.log(error)
      throw error
    })
  }
}().then(() => {
  console.log('\nDownloading and installing wine ...')
  util.exec([
    'wget -nc https://dl.winehq.org/wine-builds/Release.key',
    'sudo apt-key add Release.key',
    'sudo apt-add-repository https://dl.winehq.org/wine-builds/ubuntu/',
    'sudo apt-get install --install-recommends winehq-stable',
    'sudo apt-get update',
  ], { exit: false })
}).then(() => {
  console.log('Packing and archiving files ...')
  try {
    require('./pack')
  } catch (error) {
    console.log(error)
    throw error
  }
// }).then(() => {
//   console.log('Uploading zipped files ...')
//   github.repos.uploadAsset({url, Content-Length, Content-Type, name, label})
}).catch(() => {
  console.log('An error encounted during the deploying process.')
})


