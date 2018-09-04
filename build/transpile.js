const vtc = require('vue-template-compiler')
const sass = require('sass')
const fs = require('fs')
const util = require('./util')

util.start()
const browser = typeof window !== 'undefined'
if (process.env.TRAVIS === 'true') console.log()

let css = ''

function randomID() {
  return Math.floor(Math.random() * 36 ** 6).toString(36)
}

util.start('f')
const comps = util.walk('comp', {
  onDir(name, full, files, callback) {
    util.mkdir('temp' + name.slice(4))
    return [].concat(...files.map(callback))
  },
  onFile(name) {
    if (name.endsWith('.vue')) return [name.slice(5, -4)]
    if (name.endsWith('.js')) util.clone(name, 'temp' + name.slice(4))
    return []
  }
})
util.pause('f')

comps.forEach((name) => {
  const compName = name.match(/[\w-]+$/)[0]
  const srcPath = util.resolve('comp', name) + '.vue'
  const distPath = util.resolve('temp', name) + '.vue.js'
  const id = randomID()

  try {
    util.start('v')
    const { template, styles, script } = vtc.parseComponent(fs.readFileSync(srcPath).toString())
    const { render, staticRenderFns } = vtc.compile(template.content)
    util.pause('v')

    const setters = []
    let scoped = false
    css += styles.map(style => {
      let data = style.content
      if (style.scoped) {
        scoped = true
        data = `[id-${id}]{${data}}`
      } else if ('ref' in style.attrs || 'ref-slot' in style.attrs) {
        let element, precedence
        if ('ref' in style.attrs) {
          precedence = 1
          const ref = `this.$refs.${style.attrs.ref}`
          element = `(${ref}.$el || ${ref})`
        } else if ('ref-slot' in style.attrs) {
          precedence = 2
          const match = style.attrs['ref-slot'].match(/^([\w-]+)(?:\.([\w-]+))?$/)
          const ref = match[1], slot = match[2] || 'default'
          element = `this.$refs.${ref}.$slots.${slot}[0].elm.parentElement`
        }
        data = `{${data}}`
        for (let i = style.attrs.prec || precedence; i > 0; i -= 1) {
          const id = randomID()
          data = `[id-${id}]` + data
          setters.push(`  ${element}.setAttribute('id-${id}', '');\n  `)
        }
      }

      util.start('s')
      const { css } = sass.renderSync({ data })
      util.pause('s')
      return css + '\n'
    }).join('')
    util.start('f')
    fs.writeFileSync(distPath, script.content + `
if (!module.exports.mixins) module.exports.mixins = [];
module.exports.mixins.push({ mounted() {${scoped ? `
  this.$el.setAttribute('id-${id}', '');` : ''}
  this.$nextTick(() => {\n  ${setters.join('')}});
} });
module.exports.staticRenderFns = [ ${staticRenderFns.join(',')} ];
module.exports.render = function() {${render}}`)
    util.pause('f')
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
    util.start('s')
    css += sass.renderSync({ data: `.${theme}{${
      fs.readFileSync(util.resolve('themes/' + theme) + '.scss')
    }}` }).css + '\n'
    util.pause('s')
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

if (browser) {
  const total = util.pause()
  console.log('Transpile Succeed.', util.finish(), `
  File Operations: ${util.percent(util.time('f') / total)}.
  CSS Transpiling: ${util.percent(util.time('s') / total)}.
  Component Parsing: ${util.percent(util.time('v') / total)}.`)
} else {
  console.log('Transpile Succeed.', util.finish())
}
