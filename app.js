const electron = require('electron')

const VueCompiler = require('vue-template-compiler/browser')
const ElementUI = require('element-ui')
const Router = require('vue-router')
const I18n = require('vue-i18n')
const Vuex = require('vuex')
const Vue = require('vue')

const pxapi = require('./api')
const path = require('path')
const fs = require('fs')

// Use vue modules.
Vue.use(ElementUI)
Vue.use(Router)
Vue.use(I18n)
Vue.use(Vuex)

// Prevent vue from generating production tips.
Vue.config.productionTip = false

// Global environment of pxscope
// 0: production mode.
// 1: development mode.
global.PX_ENV = 1
global.$pixiv = new pxapi()

/**
 * Render function generator.
 * @param {string} filepath Template file path
 * @returns {Function} Render function
 */
global.$render = function(...paths) {
  const filepath = path.join(...paths)
  if (global.PX_ENV) {
    // Compile html into render functions.
    const html = fs.readFileSync(filepath + '.html', {encoding: 'utf8'})
    const result = VueCompiler.compileToFunctions(html).render
    fs.writeFileSync(filepath + '.html.js', 'module.exports = ' + result)
    return result
  } else {
    // Use compiled render functions.
    return require(filepath + '.html.js')
  }
}

const library = {
  i18n: require('./i18n'),
  themes: require('./themes'),
}

// Interprocess communication for envireonment.
electron.ipcRenderer.send('env', global.PX_ENV)
const browser = electron.remote.getCurrentWindow()

// Load settings from local storage.
let settings
const defaultSettings = require('./default')
const storageSettings = localStorage.getItem('settings')
try {
  settings = Object.assign({}, defaultSettings, JSON.parse(storageSettings))
} catch (error) {
  console.error('The settings information is malformed:\n' + storageSettings)
  settings = defaultSettings
}

// Vuex
const store = new Vuex.Store({
  state: {
    settings
  },
  mutations: {
    setSettings(state, settings) {
      Object.assign(state.settings, settings)
    }
  }
})

// Router
const roots = ['homepage', 'user', 'settings']
const routes = ['homepage', 'user', 'settings', 'user/login']
const router = new Router({
  routes: routes.map(route => ({
    name: route.replace(/\//g, '-'),
    path: '/' + route,
    component: require('./comp/' + route)
  }))
})

// I18n
const i18n = new I18n({
  locale: settings.language,
  fallbackLocale: 'en-US',
  messages: new Proxy({}, {
    get(target, key) {
      if (key in library.i18n && !(key in target)) {
        // Lazy loading i18n resources.
        target[key] = require(`./i18n/${key}.json`)
      }
      return Reflect.get(target, key)
    }
  })
})

/**
 * Load CSS files.
 * @param {string} href CSS file path
 */
function loadCSS(href) {
  if (!fs.existsSync(path.join(__dirname, href))) return
  const link = document.createElement('link')
  link.href = href
  link.rel = 'stylesheet'
  document.head.appendChild(link)
}

library.themes.forEach(theme => loadCSS(`themes/${theme}.css`))
routes.forEach(route => loadCSS(`comp/${route}/index.css`))

new Vue({
  el: '#app',
  i18n,
  store,
  router,

  provide: () => ({
    library,
  }),

  data: () => ({
    roots,
    routes,
    maximize: false,
    height: document.body.clientHeight - 48, // initial height
    width: document.body.clientWidth - 64, // initial width
  }),

  computed: {
    settings() {
      return this.$store.state.settings
    },
    currentRootTop() {
      console.log(this.$route)
      return 48 + roots.indexOf(this.$route.name.match(/^\w+/)[0]) * 64 + 'px'
    },
  },

  created() {
    this.browser = browser
    this.switchRoute(this.settings.route)

    // Set global reference.
    global.PX_VM = this

    // Respond to window maximizing.
    browser.on('maximize', () => this.maximize = true)
    browser.on('unmaximize', () => this.maximize = false)
  },

  mounted() {
    // Respond to resizing.
    addEventListener('resize', () => {
      this.height = window.innerHeight - 48
      this.width = window.innerWidth - 64
    }, {passive: true})

    // Save settings before unload.
    addEventListener('beforeunload', () => {
      this.$store.commit('setSettings', {
        route: this.$route.path,
        language: this.$i18n.locale,
      })
      localStorage.setItem('settings', JSON.stringify(this.settings))
    })
  },

  methods: {
    toggleMaximize() {
      if (browser.isMaximized()) {
        browser.unmaximize()
      } else {
        browser.maximize()
      }
    },
    switchRoute(route) {
      route = route || ''
      const next = route.startsWith('/') ? route : `${this.$route.path}/${route}`
      if (routes.includes(next.slice(1))) {
        this.$router.push(next)
      } else if (!routes.includes(this.$route.name)) {
        this.$router.push(defaultSettings.route)
      }
    },
  },

  render: $render('app')
})
