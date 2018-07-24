const {ipcRenderer} = require('electron')
const VueCompiler = require('vue-template-compiler/browser')
const pxapi = require('pxapi')
const Router = require('vue-router')
const I18n = require('vue-i18n')
const Vue = require('vue')
const fs = require('fs')

// Set global envieronment.
// 0: production mode.
// 1: development mode.
global.PXER_ENV = 1

// Interprocess communication for envireonment.
ipcRenderer.send('start', global.PXER_ENV)

global.$render = function(filepath) {
  if (global.PXER_ENV === 0) {
    // Use compiled render functions.
    return require(filepath + '.js')
  } else {
    // Compile html into render functions.
    const html = fs.readFileSync(filepath, {encoding: 'utf8'})
    const result = VueCompiler.compileToFunctions(html).render
    fs.writeFileSync(filepath + '.js', `module.exports=${result}`)
    return result
  }
}

global.$pixiv = new pxapi()

new Vue({
  el: '#app',

  data: () => ({
    node: ''
  }),

  mounted() {
  },

  render: $render('app.html')
})
