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

const errorLog = []
function $pushError(type, data) {
  if (data instanceof Object) {
    errorLog.push({ type, ...data })
  } else {
    errorLog.push({ type, data })
  }
}

function $loadFromStorage(item, fallback = null) {
  const storage = localStorage.getItem(item)
  try {
    if (fallback) {
      return Object.assign(fallback, JSON.parse(storage))
    } else {
      return JSON.parse(storage)
    }
  } catch (error) {
    $pushError('Malformed JSON from LocalStorage', storage)
    return fallback
  }
}

Vue.prototype.$pushError = $pushError
Vue.prototype.$loadFromStorage = $loadFromStorage

const library = {
  i18n: require('./i18n'),
  themes: require('./themes'),
}

// Interprocess communication for envireonment.
electron.ipcRenderer.send('env', global.PX_ENV)
const browser = electron.remote.getCurrentWindow()

// Load settings and accounts from local storage.
const defaultSettings = require('./default')
const settings = $loadFromStorage('settings', {...defaultSettings})
const accounts = $loadFromStorage('accounts', [])

global.$pixiv = new pxapi({
  timeout: settings.timeout * 1000,
  language: settings.language,
})
$pixiv.authorize($loadFromStorage('auth'))
$pixiv.on('auth', auth => {
  localStorage.setItem('auth', JSON.stringify(auth))
})

// Vuex
const store = new Vuex.Store({
  state: {
    settings,
    accounts,
  },
  mutations: {
    setSettings(state, settings) {
      Object.assign(state.settings, settings)
    },
    saveAccount(state, user) {
      const index = state.accounts.findIndex(account => account.id === user.id)
      if (index >= 0) {
        Object.assign(state.accounts[index], user)
      } else {
        state.accounts.push(user)
      }
    }
  }
})

// Root router
const rootMap = {}
const roots = ['homepage', 'user', 'settings']
roots.forEach(root => rootMap[root] = '/' + root)

// Router
const routes = ['homepage', 'user', 'settings', 'user/login']
const router = new Router({
  routes: routes.map(route => ({
    name: route.replace(/\//g, '-'),
    path: '/' + route,
    component: require('./comp/' + route)
  }))
})

// Save browsering history.
router.afterEach(to => {
  if (to.path === '/') return
  rootMap[to.path.match(/^\/(\w+)/)[1]] = to.path
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
    rootMap,
    loading: false,
    maximize: false,
    enterDirection: 'none',
    leaveDirection: 'none',
    height: document.body.clientHeight - 48, // initial height
    width: document.body.clientWidth - 64, // initial width
  }),

  computed: {
    settings() {
      return this.$store.state.settings
    },
    currentRootIndex() {
      return roots.indexOf(this.$route.path.match(/^\/(\w+)/)[1])
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

    // Save settings, accounts, auth information and error log before unload.
    addEventListener('beforeunload', () => {
      this.$store.commit('setSettings', {
        route: this.$route.path,
        language: this.$i18n.locale,
      })
      localStorage.setItem('settings', JSON.stringify(this.settings))
      localStorage.setItem('accounts', JSON.stringify(this.$store.state.accounts))
      if (errorLog.length > 0) {
        const isoString = new Date().toISOString()
        fs.writeFileSync(
          path.join(__dirname, `logs/${isoString}.log`),
          JSON.stringify(errorLog, null, 2)
        )
      }
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
      if (this.loading) return
      if (!route) route = ''
      let nextRoute
      if (route.startsWith('/')) {
        // Using absolute path.
        nextRoute = route
      } else {
        // Using relative path, with '../' to be resolved.
        const back = (route + '/').match(/^(\.\.\/)*/)[0].length / 3
        nextRoute = `${
          this.$route.path.match(new RegExp(`^(.+)(\\/\\w+){${back}}$`))[1]
        }/${(route + '/').slice(back * 3)}`.slice(0, -1)
      }
      const nextRootIndex = roots.indexOf(nextRoute.match(/^\/(\w+)/)[1])
      if (this.currentRootIndex === nextRootIndex) {
        this.leaveDirection = this.enterDirection = 'none'
      } else if (this.currentRootIndex > nextRootIndex) {
        this.leaveDirection = 'bottom'
        this.enterDirection = 'top'
      } else {
        this.leaveDirection = 'top'
        this.enterDirection = 'bottom'
      }
      if (routes.includes(nextRoute.slice(1))) {
        this.$router.push(nextRoute)
      } else if (!routes.includes(this.$route.name)) {
        this.$router.push(defaultSettings.route)
      }
    },
  },

  render: $render('app')
})
