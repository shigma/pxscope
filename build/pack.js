const { version } = require('../package.json')
const ep = require('electron-packager')
const archiver = require('archiver')
const path = require('path')
const fs = require('fs')

fs.copyFileSync(
  path.join(__dirname, 'main.prod.js'),
  path.join(__dirname, '../main.js')
)

const DIR_PATH = path.join(__dirname, `../pack/PixivScope-v${version}-win32-x64`)
const ZIP_PATH = DIR_PATH + '.zip'
fs.existsSync(DIR_PATH) && fs.rmdirSync(DIR_PATH)
fs.existsSync(ZIP_PATH) && fs.unlinkSync(ZIP_PATH)

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
    '/pixiv/src',
    '/pixiv/tslint.yml',
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
    const stream = fs.createWriteStream(ZIP_PATH)
    const archive = archiver('zip', { zlib: { level: 9 } })

    stream.on('end', () => console.log('Data has been drained.'))
    stream.on('close', () => {
      console.log(`Archive Succeed. Total size: ${archive.pointer() >> 20} MB.`)
    })

    archive.on('warning', error => console.error(error))
    archive.on('error', error => { throw error })

    archive.pipe(stream)
    archive.directory(DIR_PATH)
    archive.finalize()
  }
})