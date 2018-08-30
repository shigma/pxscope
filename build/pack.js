const { version } = require('../package.json')
const ep = require('electron-packager')
const archiver = require('archiver')
const path = require('path')
const fs = require('fs')

fs.copyFileSync(
  path.join(__dirname, 'main.prod.js'),
  path.join(__dirname, '../main.js')
)

ep({
  appVersion: version,
  platform: 'win32',
  arch: 'x64',
  dir: path.join(__dirname, '..'),
  executableName: 'PixivScope',
  ignore: [
    '/.vscode',
    '/.eslintignore',
    '/.eslintrc.yml',
    '/.gitattributes',
    '/.gitignore',
    '/.gitmodules',
    '/assets/icons.svg',
    '/assets/logo.*',
    '/build',
    '/comp',
    '/index.dev.html',
    '/package.json',
    '/README.md',
    'test.*',
  ],
  name: `PixivScope-v${version}`,
  out: path.join(__dirname, '../pack'),
  overwrite: true,
  prune: true,
}).then((_, error) => {
  fs.copyFileSync(
    path.join(__dirname, 'main.dev.js'),
    path.join(__dirname, '../main.js')
  )

  if (error) {
    console.error(error)
  } else {
    console.log('Pack Succeed. Waiting for files to be compressed ...')
    const FILEPATH = path.join(__dirname, `../pack/PixivScope-v${version}-win32-x64`)
    const stream = fs.createWriteStream(FILEPATH + '.zip')
    const archive = archiver('zip', { zlib: { level: 9 } })

    stream.on('end', () => console.log('Data has been drained.'))
    stream.on('close', () => {
      console.log(`Archive Succeed. Total size: ${archive.pointer() >> 20} MB.`)
    })

    archive.on('warning', error => console.error(error))
    archive.on('error', error => { throw error })

    archive.pipe(stream)
    archive.directory(FILEPATH)
    archive.finalize()
  }
})