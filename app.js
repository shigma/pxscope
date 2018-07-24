const electron = require('electron')

const VueCompiler = require('vue-template-compiler/browser')
const Router = require('vue-router')
const I18n = require('vue-i18n')
const Vuex = require('vuex')
const Vue = require('vue')

const pxapi = require('pxapi')
const path = require('path')
const fs = require('fs')

// Use vue modules.
Vue.use(Router)
Vue.use(I18n)
Vue.use(Vuex)

// Prevent vue from generating production tips.
Vue.config.productionTip = false

// Interprocess communication for envireonment.
electron.ipcRenderer.send('env', global.ENV)

/**
 * Global environment of pxscope
 * 0: production mode.
 * 1: development mode.
 */
global.ENV = 1

/**
 * Render function generator
 * @param {string} filepath Template file path
 * @returns {Function} Render function
 */
global.$render = function(...paths) {
  const filepath = path.join(...paths)
  if (global.PXER_ENV === 0) {
    // Use compiled render functions.
    return require(filepath + '.js')
  } else {
    // Compile html into render functions.
    const html = fs.readFileSync(filepath, {encoding: 'utf8'})
    const result = VueCompiler.compileToFunctions(html).render
    fs.writeFileSync(filepath + '.js', 'module.exports = ' + result)
    return result
  }
}

// Pixiv API Client
global.$pixiv = new pxapi()

// Global library
global.$library = {
  languages: require('./i18n')
}

// Router
const router = new Router({
  routes: [
    'homepage',
    'settings'
  ].map(route => ({
    name: route,
    path: '/' + route,
    component: require('./comp/' + route)
  }))
})

// I18n
const i18n = new I18n({
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: new Proxy({}, {
    get(target, key) {
      if (key in global.$library.languages && !(key in target)) {
        // Lazy loading i18n resources.
        target[key] = require(`./i18n/${key}.json`)
      }
      return Reflect.get(target, key)
    }
  })
})

new Vue({
  el: '#app',
  i18n,
  router,

  data: () => ({
    node: ''
  }),

  mounted() {
  },

  render: $render('app.html')
})
