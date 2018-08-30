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
  const compName = filepath.match(/[\w-]+$/)[0]
  const srcPath = fullPath(filepath) + '.vue'
  const distPath = fullPath('dist' + filepath.slice(4))
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

console.log('Transpile: All components have been transpiled.')

require('../themes').forEach((theme) => {
  try {
    css += sass.renderSync({ data: `.${theme}{${
      fs.readFileSync(fullPath('themes/' + theme) + '.scss')
    }}`, outputStyle: 'compressed' }).css
  } catch (error) {
    console.log(`An error was encounted when transpiling color scheme "${theme}".`)
    console.error(error)
    process.exit(1)
  }
})

console.log('Transpile: All color schemes have been transpiled.')

fs.writeFileSync(fullPath('dist/app.css'), css)

console.log('Transpile Succeed.')