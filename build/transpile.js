const vtc = require('vue-template-compiler')
const sass = require('sass')
const fs = require('fs')
const util = require('./util')

util.start()
const browser = typeof window !== 'undefined'
if (process.env.TRAVIS === 'true') console.log()

const MAP_PATH = util.resolve('temp/map.json')
const map = fs.existsSync(MAP_PATH) ? require(MAP_PATH) : {}

let css = ''

util.walk('comp', {
  onDir(name, full, files, callback) {
    util.mkdir('temp' + name.slice(4))
    return [].concat(...files.map(callback))
  },
  onFile(name) {
    if (name.endsWith('.vue')) return [name.slice(5, -4)]
    if (name.endsWith('.js')) util.clone(name, 'temp' + name.slice(4))
    return []
  }
}).forEach((name) => {
  const compName = name.match(/[\w-]+$/)[0]
  const srcPath = util.resolve('comp', name) + '.vue'
  const distPath = util.resolve('temp', name) + '.vue.js'
  const id = name in map ? map[name] : (map[name] = Math.floor(Math.random() * 36 ** 6).toString(36))

  try {
    const { template, styles, script } = vtc.parseComponent(fs.readFileSync(srcPath).toString())
    const { render, staticRenderFns } = vtc.compileToFunctions(template.content)
    css += styles.map(style => sass.renderSync({
      data: style.scoped ? `[id-${id}]{${style.content}}` : style.content
    }).css + '\n').join('')
    fs.writeFileSync(distPath, script.content + `;\
      if (!module.exports.mixins) module.exports.mixins = [];\
      module.exports.mixins.push({ mounted() { this.$el.setAttribute('id-${id}', '') } });\
      module.exports.staticRenderFns = [ ${staticRenderFns.join(',')} ];\
      module.exports.render = ${render};\
    `)
  } catch (error) {
    console.log(`An error was encounted when transpiling component "${compName}".`)
    console.error(error)
    process.exit(1)
  }
})

fs.writeFileSync(MAP_PATH, JSON.stringify(map, null, 2))

if (browser) {
  module.exports = require('../temp/app.vue')
} else {
  console.log('Transpile: All components have been transpiled.')
}

require('../themes').forEach((theme) => {
  try {
    css += sass.renderSync({ data: `.${theme}{${
      fs.readFileSync(util.resolve('themes/' + theme) + '.scss')
    }}` }).css + '\n'
  } catch (error) {
    console.log(`An error was encounted when transpiling color scheme "${theme}".`)
    console.error(error)
    process.exit(1)
  }
})

if (browser) {
  const style = document.createElement('style')
  style.innerText = css
  document.head.appendChild(style)
} else {
  fs.writeFileSync(util.resolve('temp/app.css'), css)
  console.log('Transpile: All color schemes have been transpiled.')
}

console.log('Transpile Succeed.', util.time())