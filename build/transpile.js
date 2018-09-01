const vtc = require('vue-template-compiler')
const sass = require('sass')
const fs = require('fs')
const util = require('./util')

const browser = typeof window !== 'undefined'

if (process.env.TRAVIS === 'true') console.log()

let css = ''

util.walk('comp', {
  onDir(name, files, callback) {
    util.mkdir('temp' + name.slice(4))
    return [].concat(...files.map(callback))
  },
  onFile(name) {
    if (name.endsWith('.js')) {
      util.clone(name, 'temp' + name.slice(4))
      return []
    } else {
      return name.endsWith('.vue') ? [name.slice(0, -4)] : []
    }
  }
}).forEach((filepath) => {
  const compName = filepath.match(/[\w-]+$/)[0]
  const srcPath = util.resolve(filepath) + '.vue'
  const distPath = util.resolve('temp' + filepath.slice(4))
  const id = Math.floor(Math.random() * 36 ** 6).toString(36)

  try {
    let scoped = false
    const { template, styles } = vtc.parseComponent(fs.readFileSync(srcPath).toString())
    const { render, staticRenderFns: fns } = vtc.compileToFunctions(template.content)
    css += styles.map((style) => {
      scoped |= style.scoped
      return sass.renderSync({
        data: style.scoped ? `[id-${id}]{${style.content}}` : style.content,
        outputStyle: 'compressed'
      }).css
    }).join('')
    fs.writeFileSync(distPath + '.vue.js', scoped ? `
      const data = require('./${compName}');
      (data.mixins || (data.mixins = [])).push({ mounted() { this.$el.setAttribute('id-${id}', '') } });
      module.exports = { ...data, render: ${render}, staticRenderFns: [${fns.join(',')}] };
    ` : `
      module.exports = { ...require('./${compName}'), render: ${render}, staticRenderFns: [${fns.join(',')}] };
    `)
  } catch (error) {
    console.log(`An error was encounted when transpiling component "${compName}".`)
    console.error(error)
    process.exit(1)
  }
})

if (browser) {
  module.exports = require('../temp/app.vue')
} else {
  console.log('Transpile: All components have been transpiled.')
}

require('../themes').forEach((theme) => {
  try {
    css += sass.renderSync({ data: `.${theme}{${
      fs.readFileSync(util.resolve('themes/' + theme) + '.scss')
    }}`, outputStyle: 'compressed' }).css
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
  fs.writeFileSync(util.resolve('dist/app.css'), css)
  console.log('Transpile: All color schemes have been transpiled.')
}

console.log('Transpile Succeed.')