const meta = require('../package.json')
const ep = require('electron-packager')
const archiver = require('archiver')
const cp = require('child_process')
const semver = require('semver')
const util = require('./util')
const path = require('path')
const fs = require('fs')

const INFO_PATH = util.resolve('build/info.json')
const DIR_PATH = util.resolve(`pack/PxScope-v${meta.version}-win32-x64`)
const ERROR_CODE = util.flag('slient') ? 0 : 1

function hook(callback) {
  return [(tempdir, version, platform, arch, next) => {
    callback(tempdir)
    next()
  }]
}

new Promise((resolve, reject) => {

  if (process.platform === 'win32') {
    resolve()
  } else {
    console.log('\n$ sudo sh ./build/wine.sh')
    const child = cp.exec('sudo sh ./build/wine.sh', (error) => {
      if (error) reject(error); else resolve()
    })
    child.stdout.pipe(process.stdout)
    child.stderr.pipe(process.stderr)
  }

}).then(() => {

  const info = fs.existsSync(INFO_PATH) ? require(INFO_PATH) : {}
  const rceditVersion = require('rcedit/package.json').version
  if (!info.rcedit || semver.neq(rceditVersion, info.rcedit)) {
    info.rcedit = rceditVersion
    console.log('Downloading node-rcedit patch ...\n')
    util.exec('curl -L -o node_modules/rcedit/bin/rcedit.exe https://github.com/electron/rcedit/releases/download/v1.1.0/rcedit-x64.exe')
  }
  fs.writeFileSync(INFO_PATH, JSON.stringify(info))

}).then(() => {

  util.start()
  util.clone('main.prod.js', 'main.js')
  
  if (fs.existsSync(DIR_PATH)) {
    console.log('Directory already exists and will be removed first.\n')
    util.remove(DIR_PATH)
    util.remove(DIR_PATH + '.zip')
  }
  
  return ep({
    appVersion: meta.version,
    platform: 'win32',
    arch: 'x64',
    icon: util.resolve('assets/logo.icon'),
    dir: util.resolve(),
    executableName: 'PxScope',
    ignore: [
      /.+\.js\.map/,
      /.+\.d\.ts/,
      /test\..+/,
      '.vscode',
      '.travis.yml',
      '.eslintignore',
      '.eslintrc.yml',
      '.gitattributes',
      '.gitignore',
      '.gitmodules',
      'tslint.yml',
      'tsconfig.json',
      '/main.prod.js',
      '/main.dev.js',
      '/index.dev.html',
      '/default.json',
      '/package-lock.json',
      '/assets/icons.svg',
      '/assets/logo.ico',
      '/assets/logo.svg',
      '/node_modules',
      '/build',
      '/comp',
      '/docs',
      '/pixiv',
      '/temp',
    ],
    asar: util.flag('asar'),
    name: `PxScope-v${meta.version}`,
    out: path.join(__dirname, '../pack'),
    prune: true,
    afterCopy: hook(tempdir => console.log(`All files have been copied to ${tempdir}.`)),
    afterExtract: hook(tempdir => console.log(`Electron has been extracted to ${tempdir}.`)),
    afterPrune: hook(tempdir => {
      // Work around potential problem on platforms other than win32 and darwin.
      // console.log('Waiting for package dependencies to be removed ...')
      // delete meta.devDependencies
      // const { opn } = meta.dependencies
      // meta.dependencies = { opn }
      // fs.writeFileSync(path.join(tempdir, 'package.json'), JSON.stringify(pj))
      // console.log('\n$ npm install')
      // console.log(cp.execSync(`npm install`, { cwd: tempdir }).toString())
      // fs.unlinkSync(path.join(tempdir, 'package-lock.json'))
      console.log(`Prune Succeed. Waiting for files to copied into ${DIR_PATH} ...`)
    }),
  })

}).then((_, error) => {

  util.clone('main.dev.js', 'main.js')

  if (error) throw error
  console.log(`Pack Succeed. ${util.finish()} Total size: ${util.getSize(DIR_PATH) >> 20} MB.`)

  if (!util.flag('only')) {
    console.log('\nWaiting for files to be compressed ...')
    const stream = fs.createWriteStream(DIR_PATH + '.zip')
    const archive = archiver('zip', { zlib: { level: util.flag('min') ? 9 : 0 } })

    stream.on('close', () => {
      console.log(`Compress Succeed. ${util.finish()} Total size: ${archive.pointer() >> 20} MB.`)
      process.exit(0)
    })

    archive.on('warning', error => console.error(error))
    archive.on('error', error => { throw error })

    archive.pipe(stream)
    archive.directory(DIR_PATH)
    archive.finalize()
  }

}).catch((error) => {
  console.error(error)
  process.exit(ERROR_CODE)
})  
