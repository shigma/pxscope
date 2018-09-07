const github = new (require('@octokit/rest'))()
const cp = require('child_process')
const util = require('./util')
const fs = require('fs')

console.log()

github.authenticate({
  type: 'oauth',
  token: process.env.GITHUB_OAUTH,
})

const version = new util.Version(require('../package.json').version)

!async function() {
  if (util.exec('git tag -l', { show: false }).split(/\r?\n/).includes(version.tag)) {
    console.log(`Tag ${version.tag} already exists.`)
    return github.repos.getReleaseByTag({
      repo: 'pxscope',
      owner: 'Shigma',
      tag: version.tag,
    })
  } else {
    console.log(`Start to release a new version with tag ${version.tag} ...`)
    return github.repos.createRelease({
      repo: 'pxscope',
      owner: 'Shigma',
      tag_name: version.tag,
      name: `Pixiv Scope ${version.tag}`,
    }).then((release) => {
      console.log('Release created successfully.')
      return release
    })
  }
}().then((release) => {
  console.log('Packing and archiving files ...')

  console.log('\n$ node ./build/pack --min')
  const child = cp.exec('node ./build/pack --min', (error) => {
    if (error) {
      console.error(error)
      process.exit(1)
    }

    util.start()
    console.log('Uploading zipped files ...')
    const file = util.resolve(`pack/PxScope-v${version}-win32-x64.zip`)
    return github.repos.uploadAsset({
      url: release.data.upload_url,
      file: fs.readFileSync(file),
      contentType: 'application/zip',
      contentLength: fs.statSync(file).size,
      name: name,
      label: name,
    }).then(() => {
      console.log('Deploy Succeed.', util.finish())
    })
  })

  child.stdout.on('data', console.log)
  child.stderr.on('data', console.error)
}).catch((error) => {
  console.error(error)
  console.log('An error encounted during the deploying process.')
})


