const vtc = require('vue-template-compiler')
const equal = require('fast-deep-equal')
const sass = require('sass')
const fs = require('fs')
const util = require('./util')

util.start()
let ADD_COUNT = 0
let REMOVE_COUNT = 0
let UPDATE_COUNT = 0
const CACHE_PATH = util.resolve('temp/.cache.json')
let cache = fs.existsSync(CACHE_PATH) ? require(CACHE_PATH) : {}
if (cache._version !== '1.0') cache = { _version: '1.0' }
if (!cache.components) cache.components = []
if (!cache.themes) cache.themes = []

const browser = typeof window !== 'undefined'
if (process.env.TRAVIS === 'true') console.log()

let css = ''

function randomID() {
  return Math.floor(Math.random() * 36 ** 6).toString(36)
}

const comps = util.timing('f', () => util.walk('comp', {
  onDir(name, full, files, callback) {
    util.mkdir('temp' + name.slice(4))
    return [].concat(...files.map(callback))
  },
  onFile(name) {
    if (name.endsWith('.vue')) return [name.slice(5, -4)]
    if (name.endsWith('.js')) util.clone(name, 'temp' + name.slice(4))
    return []
  }
}))

cache.components.forEach(({ name }, index) => {
  if (!comps.includes(name)) {
    REMOVE_COUNT += 1
    cache.components.splice(index, 1)
    const distPath = util.resolve('temp', name + '.vue.js')
    if (fs.existsSync(distPath)) fs.unlinkSync(distPath)
  }
})

comps.forEach((name) => {
  const compName = name.match(/[\w-]+$/)[0]
  const srcPath = util.resolve('comp', name + '.vue')
  const distPath = util.resolve('temp', name + '.vue.js')
  let data = cache.components.find(comp => comp.name === name)
  if (!data) {
    ADD_COUNT += 1
    cache.components.push(data = { name })
  }

  try {
    const file = util.timing('f', () => fs.readFileSync(srcPath).toString())
    if (file === data.file) {
      css += data.css
      return
    } else {
      UPDATE_COUNT += 1
      data.file = file
    }

    const id = randomID()
    const { template, styles, script } = util.timing('v', () => vtc.parseComponent(file))
    
    let setters = [], scoped = false
    css += (data.css = styles.map(style => {
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
      return util.timing('s', () => sass.renderSync({ data })).css + '\n'
    }).join(''))

    script.content += `
module.exports.componentName = '${compName}';`

    if (scoped || setters.length) {
      script.content += `
if (!module.exports.mixins) module.exports.mixins = [];
module.exports.mixins.push({ mounted() {${scoped ? `
  this.$el.setAttribute('id-${id}', '');` : ''}
  this.$nextTick(() => {\n  ${setters.join('')}});
} });`
    }

    if (template) {
      const { render, staticRenderFns } = util.timing('v', () => vtc.compile(template.content))
      script.content += `
module.exports.staticRenderFns = [ ${staticRenderFns.join(',')} ];
module.exports.render = function() {${render}}`
    }

    util.timing('f', () => fs.writeFileSync(distPath, script.content))

  } catch (error) {
    console.log(`An error was encounted when transpiling component "${compName}".`)
    console.error(error)
    process.exit(1)
  }
})

UPDATE_COUNT -= ADD_COUNT

if (browser) {
  module.exports = require('../temp/app.vue')
} else {
  console.log('Transpile: All components have been transpiled.')
}

const themes = require('../themes')

cache.themes.forEach(({ name }, index) => {
  if (!themes.includes(name)) {
    cache.themes.splice(index, 1)
  }
})

themes.forEach((name) => {
  let data = cache.themes.find(theme => theme.name === name)
  if (!data) {
    cache.themes.push(data = { name })
  }

  try {
    const file = util.timing('f', () => fs.readFileSync(util.resolve('themes', name + '.scss')).toString())
    css += file === data.file
      ? data.css
      : (
        data.file = file,
        data.css = util.timing('s', () => sass.renderSync({ data: `.${name}{${file}}` })).css + '\n')
  } catch (error) {
    console.log(`An error was encounted when transpiling color scheme "${name}".`)
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

util.timing('f', () => fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2)))

function report(noun, ...sentences) {
  const result = sentences.map(([verb, numeral]) => {
    return numeral ? `${verb} ${numeral} ${noun}${numeral - 1 ? 's' : ''}` : ''
  }).filter(str => str).join(', ')
  return result
    ? result[0].toUpperCase() + result.slice(1) + '.'
    : `All ${noun}s are up to date.`
}

const total = util.pause()
console.log('Transpile Succeed.', util.finish())

if (browser) {
  console.log(`\
  File Operations: ${util.percent(util.time('f') / total)}.
  SCSS Transpiling: ${util.percent(util.time('s') / total)}.
  Component Parsing: ${util.percent(util.time('v') / total)}.`)
}

console.log(report('component',
  ['added', ADD_COUNT],
  ['removed', REMOVE_COUNT],
  ['updated', UPDATE_COUNT],
))
