const pj = require('../package.json')
const ep = require('electron-packager')
const archiver = require('archiver')
const cp = require('child_process')
const path = require('path')
const fs = require('fs')

const DIR_PATH = path.join(__dirname, `../pack/PxScope-v${pj.version}-win32-x64`)
const ZIP_PATH = DIR_PATH + '.zip'

if (process.env.TRAVIS === 'true') console.log()

function remove(filepath) {
  if (!fs.existsSync(filepath)) return
  if (fs.statSync(filepath).isFile()) {
    fs.unlinkSync(filepath)
  } else {
    fs.readdirSync(filepath).forEach(name => remove(`${filepath}/${name}`))
    fs.rmdirSync(filepath)
  }
}

function getSize(filepath) {
  const stat = fs.statSync(filepath)
  return stat.isFile()
    ? stat.size
    : fs.readdirSync(filepath).reduce((total, name) => total + getSize(`${filepath}/${name}`), 0)
}

function hook(callback) {
  return [(tempdir, version, platform, arch, next) => {
    callback(tempdir)
    next()
  }]
}

module.exports = function({ level = 0 } = {}) {
  fs.copyFileSync(
    path.join(__dirname, 'main.prod.js'),
    path.join(__dirname, '../main.js')
  )

  if (fs.existsSync(DIR_PATH)) {
    console.log('Pack: Directory already exists and will be removed first ...\n')
    remove(DIR_PATH)
    remove(ZIP_PATH)
  }

  return new Promise((resolve, reject) => {
    ep({
      appVersion: pj.version,
      platform: 'win32',
      arch: 'x64',
      icon: path.join(__dirname, '../assets/logo.icon'),
      dir: path.join(__dirname, '..'),
      executableName: 'PxScope',
      ignore: [
        '.vscode',
        '.eslintignore',
        '.eslintrc.yml',
        '.gitattributes',
        '.gitignore',
        '.gitmodules',
        'tslint.yml',
        'tsconfig.json',
        '/assets/icons.svg',
        '/assets/logo.*',
        '/build',
        '/comp',
        '/docs',
        '/pixiv/src',
        '/index.dev.html',
        '/README.md',
        'test.*',
      ],
      name: `PxScope-v${pj.version}`,
      out: path.join(__dirname, '../pack'),
      prune: true,
      afterCopy: hook(tempdir => console.log(`All files have been copied to ${tempdir}.`)),
      afterExtract: hook(tempdir => console.log(`Electron has been extracted to ${tempdir}.`)),
      afterPrune: hook(tempdir => {
        console.log('Waiting for package dependencies to be reinstalled ...')
        delete pj.devDependencies
        fs.writeFileSync(path.join(tempdir, 'package.json'), JSON.stringify(pj))
        console.log('\n$ npm i')
        console.log(cp.execSync(`npm i`, { cwd: tempdir }).toString())
        fs.unlinkSync(path.join(tempdir, 'package-lock.json'))
        console.log(`Reinstall Succeed. Waiting for files to copied into ${DIR_PATH} ...`)
      }),
    }).then((_, error) => {
      fs.copyFileSync(
        path.join(__dirname, 'main.dev.js'),
        path.join(__dirname, '../main.js')
      )
    
      if (error) throw error
      console.log(`Pack Succeed. Total size: ${getSize(DIR_PATH) >> 20} MB.`)
      console.log('\nWaiting for files to be compressed ...')
      const stream = fs.createWriteStream(ZIP_PATH)
      const archive = archiver('zip', { zlib: { level } })
  
      stream.on('close', () => {
        console.log(`Compress Succeed. Total size: ${archive.pointer() >> 20} MB.`)
        resolve({
          size: archive.pointer(),
          path: ZIP_PATH,
        })
      })
  
      archive.on('warning', error => console.error(error))
      archive.on('error', error => { throw error })
  
      archive.pipe(stream)
      archive.directory(DIR_PATH)
      archive.finalize()
    }).catch((error) => {
      console.error(error)
      reject(error)
    })
  })
}
