const sass = require('sass')
const path = require('path')
const util = require('./util')
const sfc2js = require('sfc2js')

util.start()
if (process.env.TRAVIS === 'true') console.log()

sfc2js.install({
  name: 'sass-plugin',
  version: '1.0',
  target: 'style',
  lang: [
    'sass',
    'scss',
    'css',
  ],
  default: {
    includePaths: [],
  },
  updated(options) {
    const dirPath = path.dirname(options.srcPath)
    this.options.includePaths.push(dirPath)
  },
  render(style) {
    return sass.renderSync({ ...this.options, data: style.content }).css.toString()
  },
})

module.exports = sfc2js.transpile({
  baseDir: util.resolve(),
  srcDir: 'comp',
  outDir: 'temp',
  filter: [
    '!tsconfig.json',
    '!**/*.ts',
  ],
  enterance: process.argv[0].endsWith('electron.exe') ? 'app.vue' : '',
})

console.log('Transpile Succeed.', util.finish())
