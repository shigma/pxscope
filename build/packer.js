const { version } = require('../package.json')
const ep = require('electron-packager')
const archiver = require('archiver')
const path = require('path')
const fs = require('fs')

const DIR_PATH = path.join(__dirname, `../pack/PxScope-v${version}-win32-x64`)
const ZIP_PATH = DIR_PATH + '.zip'

module.exports = function({ level = 0 } = {}) {
  fs.copyFileSync(
    path.join(__dirname, 'main.prod.js'),
    path.join(__dirname, '../main.js')
  )

  fs.existsSync(DIR_PATH) && fs.rmdirSync(DIR_PATH)
  fs.existsSync(ZIP_PATH) && fs.unlinkSync(ZIP_PATH)

  return new Promise((resolve, reject) => {
    ep({
      appVersion: version,
      platform: 'win32',
      arch: 'x64',
      dir: path.join(__dirname, '..'),
      executableName: 'PxScope',
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
      name: `PxScope-v${version}`,
      out: path.join(__dirname, '../pack'),
      overwrite: true,
      prune: true,
    }).then((_, error) => {
      fs.copyFileSync(
        path.join(__dirname, 'main.dev.js'),
        path.join(__dirname, '../main.js')
      )
    
      if (error) throw error
      
      console.log('Pack Succeed. Waiting for files to be archived ...')
      const stream = fs.createWriteStream(ZIP_PATH)
      const archive = archiver('zip', { zlib: { level } })
  
      stream.on('close', () => {
        console.log(`Archive Succeed. Total size: ${archive.pointer() >> 20} MB.`)
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
