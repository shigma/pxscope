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
    return github.repos.getReleaseByTag({
      repo: 'pxscope',
      owner: 'Shigma',
      tag: tag,
    })
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
}().then((release) => {
  console.log('\nDownloading and installing wine ...\n')
  util.exec([
    'curl -o wine-3.0.2.tar.xz https://dl.winehq.org/wine/source/3.0/wine-3.0.2.tar.xz',
    'tar xf wine-3.0.2.tar.xz',
    'cd wine-3.0.2',
    'sudo apt-get update',
    'sudo apt-get install build-essential',
    './configure',
    './make',    
  ], { exit: false })

  console.log('Packing and archiving files ...')
  require('./pack')

  // console.log('Uploading zipped files ...')
  // github.repos.uploadAsset({
  //   url: release.data.upload_url,
  //   file: stringToArrayBuffer('Hello, world!\n'),
  //   contentType: 'text/plain',
  //   contentLength: 14,
  //   name: 'test-upload.txt',
  //   label: 'test'
  // })
}).catch(() => {
  console.log('An error encounted during the deploying process.')
})


