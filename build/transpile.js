const vtc = require('vue-template-compiler')
const sass = require('sass')
const path = require('path')
const fs = require('fs')

function fullPath(name) {
  return path.join(__dirname, '..', name)
}

// Make directory if it not exists.
function mkdir(name) {
  fs.existsSync(name) || fs.mkdirSync(name)
}

mkdir(fullPath('/dist'))
mkdir(fullPath('/logs'))

let css = ''

// Search for vue files.
function walk(name) {
  const path = fullPath(name)
  const distPath = fullPath('dist' + name.slice(4))
  return fs.statSync(path).isDirectory()
    ? (mkdir(distPath), [].concat(...fs.readdirSync(path).map(sub => walk(`${name}/${sub}`))))
    : name.endsWith('.js')
      ? (fs.copyFileSync(path, distPath), [])
      : name.endsWith('.vue')
        ? [name.slice(0, -4)]
        : []
}

// Traverse all components.
walk('comp').forEach((filepath) => {
  const srcPath = fullPath(filepath)
  const distPath = fullPath('dist' + filepath.slice(4))
  const id = Math.floor(Math.random() * 36 ** 6).toString(36)

  const {
    template: { content: html },
    styles: [{ content: scss }],
  } = vtc.parseComponent(fs.readFileSync(srcPath + '.vue', { encoding: 'utf8' }))

  const { render, staticRenderFns } = vtc.compileToFunctions(html)

  fs.writeFileSync(distPath + '.vue.js', `
    const data = require('./${filepath.match(/[\w-]+$/)[0]}');
    (data.mixins || (data.mixins = [])).push({ mounted() { this.$el.setAttribute('id-${id}', '') } });
    module.exports = { ...data, render: ${render}, staticRenderFns: [${staticRenderFns.join(',')}] };
  `)

  css += sass.renderSync({ data: `[id-${id}]{${scss}}`, outputStyle: 'compressed' }).css
})

require('../themes').forEach((theme) => {
  css += sass.renderSync({ data: `.${theme}{${
    fs.readFileSync(fullPath('themes/' + theme) + '.scss')
  }}`, outputStyle: 'compressed' }).css
})

fs.writeFileSync(fullPath('dist/app.css'), css)

console.log('Transpile Succeed.')