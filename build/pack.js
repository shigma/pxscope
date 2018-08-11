const ep = require('electron-packager')
const path = require('path')
const fs = require('fs')

fs.copyFileSync(
  path.join(__dirname, 'main.prod.js'),
  path.join(__dirname, '../main.js')
)

ep({
  appVersion: '0.1.0',
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
  name: 'PixivScope-v0.1',
  out: path.join(__dirname, '../pack'),
  overwrite: true,
  platform: 'win32',
  prune: true,
}).then((_, error) => {
  fs.copyFileSync(
    path.join(__dirname, 'main.dev.js'),
    path.join(__dirname, '../main.js')
  )
  if (error) {
    console.log(error)
  } else {
    console.log('Succeed!')
  }
})