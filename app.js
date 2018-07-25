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

// Global environment of pxscope
// 0: production mode.
// 1: development mode.
global.PX_ENV = 1

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
  languages: require('./i18n'),
  default: require('./default')
}

// Interprocess communication for envireonment.
electron.ipcRenderer.send('env', global.PX_ENV)

// Get current window for maximize, etc.
const browser = electron.remote.getCurrentWindow()

// Load settings from local storage.
let settings
const storageSettings = localStorage.getItem('settings')
try {
  settings = Object.assign({}, $library.default, JSON.parse(storageSettings))
} catch (error) {
  console.error('The settings information is malformed:\n' + storageSettings)
  settings = $library.default
}

// Vuex
const store = new Vuex.Store({
  state: {
    settings
  }
})

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
  store,
  router,

  data: () => ({
    sidebar: true,
    height: document.body.clientHeight - 48, // initial height
    width: document.body.clientWidth - 64, // initial width
  }),

  watch: {
    sidebar(value) {
      this.width = window.innerWidth - (value ? 64 : 0)
    }
  },

  created() {
    global.PX_VM = this
  },

  mounted() {
    // Respond to resizing.
    addEventListener('resize', () => {
      this.height = window.innerHeight - 48
      this.width = window.innerWidth - (this.sidebar ? 64 : 0)
    }, {passive: true})

    // Save settings before unload.
    addEventListener('beforeunload', () => {
      localStorage.setItem('settings', JSON.stringify(this.$store.state.settings))
    })
  },

  methods: {
    toggleMaximize() {
      if (browser.isMaximized()) {
        browser.unmaximize()
      } else {
        browser.maximize()
      }
    }
  },

  render: $render('app.html')
})
