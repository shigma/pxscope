const github = new (require('@octokit/rest'))()
const packer = require('./packer')
const util = require('./util')
const fs = require('fs')

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
    }).then((release) => {
      console.log('Release created successfully.')
      return release
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
  return packer({ level: 9 }).then(({ path, size }) => {
    console.log('Uploading zipped files ...')
    const name = path.match(/[^/\\]+$/)[0]
    return github.repos.uploadAsset({
      url: release.data.upload_url,
      file: fs.readFileSync(path),
      contentType: 'application/zip',
      contentLength: size,
      name: name,
      label: name,
    })
  }).then(() => {
    console.log('Deploy Succeed.')
  })
}).catch(() => {
  console.log('An error encounted during the deploying process.')
})


