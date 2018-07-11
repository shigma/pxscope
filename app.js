const {remote, ipcRenderer} = require('electron')
const VueCompiler = require('vue-template-compiler/browser')
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

new Vue({
  el: '#app',

  data: () => ({
    node: ''
  }),

  mounted() {
    ipcRenderer.send('load', 'https://www.pixiv.net', '.everyone-new-illusts>.content')
    ipcRenderer.on('loaded', (event, html) => {
      this.node = html
    })
  },
  
  render: $render('app.html')
})
