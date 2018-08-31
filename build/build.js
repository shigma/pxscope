const util = require('./util')

if (process.env.TRAVIS === 'true') console.log()

if (util.flag('init') || process.argv.length === 2) {
  util.mkdir('dist')
  util.mkdir('temp')
  util.mkdir('pack')
  util.mkdir('logs')
  util.mkdir('dist/fonts')
  util.clone('main.dev.js', 'main.js')
  util.clone('node_modules/vue/dist/vue.runtime.common.js', 'dist/vue.js')
  util.clone('node_modules/element-ui/lib/theme-chalk/index.css', 'dist/el-index.css')
  util.clone('node_modules/element-ui/lib/theme-chalk/display.css', 'dist/el-display.css')
  util.clone('node_modules/element-ui/lib/theme-chalk/fonts/element-icons.ttf', 'dist/fonts/element-icons.ttf')
  util.clone('node_modules/element-ui/lib/theme-chalk/fonts/element-icons.woff', 'dist/fonts/element-icons.woff')
  console.log('Build: App structure has been initialized.')
}

if (util.flag('tsc') || process.argv.length === 2) {
  util.exec('tsc', { show: false })
  console.log('Build: Typescript files have been compiled.')
}

console.log('Build Succeed.')
