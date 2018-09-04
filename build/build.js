const svg = require('svg2ttf/lib/svg')
const svg2ttf = require('svg2ttf')
const util = require('./util')
const fs = require('fs')

!async function() {
  util.start()
  if (process.env.TRAVIS === 'true') console.log()
  
  if (util.flag('init')) {
    util.mkdir('dist')
    util.mkdir('temp')
    util.mkdir('pack')
    util.mkdir('logs')
    util.clone('main.dev.js', 'main.js')
    util.clone('node_modules/vue/dist/vue.runtime.min.js', 'dist/vue.js')
    util.clone('node_modules/element-ui/lib/index.js', 'dist/element-ui.js')
    util.clone('node_modules/element-ui/lib/theme-chalk/fonts', 'dist/fonts')
    util.clone('node_modules/element-ui/lib/theme-chalk/index.css', 'dist/element-ui.css')
    console.log('Build: App structure has been initialized.')
  }

  if (util.flag('icons')) {
    const source = fs.readFileSync(util.resolve('assets/icons.svg')).toString()
    const base64 = Buffer.from(svg2ttf(source).buffer).toString('base64')
    fs.writeFileSync(util.resolve('assets/icons.css'), `\
@font-face{font-family:'pxscope-icons';\
src:url(data:font/ttf;base64,${base64})format('truetype');\
font-weight:normal;font-style:normal;}${
  svg.load(source).glyphs.map((glyph) => {
    if (!glyph.name) return ''
    return `.icon-${glyph.name}:before{content:"\\${
      glyph.unicode[0].toString(16).padStart(4, '0')
    }"}`}).join('')}`)
    console.log('Build: Icon stylesheet has been generated.')
  }
  
  if (util.flag('tsc')) {
    util.exec('tsc -p pixiv', { show: false })
    util.exec('tsc -p comp', { show: false })
    console.log('Build: Typescript files have been compiled.')
  }
  
  if (util.flag('hosts')) {
    const { Hosts } = require('../pixiv/dist/hosts')
    return new Hosts({
      save(data) {
        fs.writeFileSync(util.resolve('pixiv/hosts.json'), JSON.stringify(data))
        console.log('Build: Hosts file has been generated.\n')
        const serverNames = Object.keys(data)
        const maxLength = Math.max(...serverNames.map(name => name.length)) + 1
        serverNames.forEach((serverName) => {
          console.log(`${(serverName + ':').padEnd(maxLength)} ${data[serverName]}`)
        })
        console.log()
      }
    }).update()
  }
}().then(() => {
  console.log('Build Succeed.', util.finish())
}, (error) => {
  console.error(error)
  process.exit(1)
})

