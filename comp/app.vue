<script>

// Work around webpack default behaviors.
const lazyRequire = eval('require')
function CJS(module) {
  return module.__esModule && module.default ? module.default : module
}

const electron = require('electron')
const NeatScroll = require('neat-scroll')
const plugins = require('./plugins')
const I18n = CJS(require('vue-i18n'))
const Vuex = CJS(require('vuex'))
const path = require('path')
const fs = require('fs')

// Use vue plugins.
Vue.use(I18n)
Vue.use(Vuex)
Vue.use(plugins)

const errorLog = []
/**
 * Append an error into error log.
 * @param {string} type Error type
 * @param {object} data Error information
 */
function $pushError(type, data) {
  if (data instanceof Object) {
    errorLog.push({ type, ...data })
  } else {
    errorLog.push({ type, data })
  }
}

/**
 * Load data from storage.
 * @param {string} item Item key
 * @param {any} fallback Fallback
 */
function $loadFromStorage(item, fallback = null) {
  const storage = localStorage.getItem(item)
  try {
    return Object.assign({}, fallback, JSON.parse(storage))
  } catch (error) {
    $pushError('Malformed JSON from LocalStorage', storage)
    return fallback
  }
}

Vue.prototype.$pushError = $pushError
Vue.prototype.$loadFromStorage = $loadFromStorage

const library = {
  i18n: require('../i18n'),
  themes: require('../themes'),
}

// Get current browser window.
const browser = electron.remote.getCurrentWindow()

// Load settings and accounts from local storage.
const defaultSettings = require('../default')
const settings = $loadFromStorage('settings', defaultSettings)
const accounts = $loadFromStorage('accounts', [])

// Initialize Pixiv API.
global.$pixiv = require('../pixiv/dist')
$pixiv.config.hosts.load(require('../pixiv/hosts.json'))
$pixiv.config.timeout = settings.timeout * 1000
$pixiv.config.language = settings.language
$pixiv.authorize($loadFromStorage('auth'))
$pixiv.on('auth', ({ auth }) => localStorage.setItem('auth', JSON.stringify(auth)))

// Neat-scroll implementation.
NeatScroll.config.speed = settings.scroll_speed
NeatScroll.config.smooth = settings.scroll_smooth
Vue.prototype.$neatScroll = (...args) => new NeatScroll(...args)
Vue.prototype.$neatScroll.config = NeatScroll.config

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

// I18n
const i18n = new I18n({
  locale: settings.language,
  fallbackLocale: 'en-US',
  messages: new Proxy({}, {
    get(target, key) {
      // Lazy loading i18n resources.
      if (key in library.i18n && !(key in target)) {
        target[key] = lazyRequire(`../i18n/${key}.json`)
      }
      return Reflect.get(target, key)
    }
  })
})

module.exports = {
  el: '#app',
  i18n,
  store,

  components: {
    discovery: require('./discovery.vue'),
    download: require('./download.vue'),
    user: require('./user.vue'),
    settings: require('./settings.vue'),
  },

  provide: () => ({
    library,
  }),

  data: () => ({
    routes: [
      'discovery',
      'download',
      'user',
      'settings',
    ],
    loading: false,
    maximize: false,
    switching: false,
    scrollBarStyle: 'auto',
    enterDirection: 'none',
    leaveDirection: 'none',
    currentRoute: settings.route,
    width: document.body.clientWidth - 64,
    height: document.body.clientHeight - 48,
  }),

  computed: {
    settings() {
      return this.$store.state.settings
    },
    currentIndex() {
      return this.routes.indexOf(this.currentRoute)
    },
  },

  created() {
    // Set global reference.
    global.PX_VM = this

    // Respond to window maximizing.
    browser.on('maximize', () => this.maximize = true)
    browser.on('unmaximize', () => this.maximize = false)

    // Make sure the route really exists.
    if (!this.routes.includes(this.currentRoute)) {
      this.currentRoute = defaultSettings.route
    }
  },

  mounted() {
    this.viewScroll = this.$neatScroll(this.$refs.view)

    // Respond to resizing.
    addEventListener('resize', () => {
      this.height = window.innerHeight - 48
      this.width = window.innerWidth - 64
    }, { passive: true })

    // Save settings, accounts and error log before unload.
    addEventListener('beforeunload', () => {
      this.$store.commit('setSettings', {
        route: this.currentRoute,
        language: this.$i18n.locale,
        scroll_speed: this.$neatScroll.config.speed,
        scroll_smooth: this.$neatScroll.config.smooth,
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
    minimizeWindow() {
      browser.minimize()
    },
    closeWindow() {
      browser.close()
    },
    toggleMaximize() {
      if (browser.isMaximized()) {
        browser.unmaximize()
      } else {
        browser.maximize()
      }
    },
    updateScrollBar(switching) {
      const view = this.$refs.view
      this.switching = switching
      // Preserve current scroll style.
      if (view.scrollHeight > view.offsetHeight) {
        this.scrollBarStyle = 'auto'
      } else {
        this.scrollBarStyle = 'hidden'
      }
    },
    switchRoute(route) {
      if (this.loading) return
      if (!this.routes.includes(route)) return

      // Determine page transition direction.
      const nextRootIndex = this.routes.indexOf(route)
      if (this.currentIndex === nextRootIndex) {
        this.leaveDirection = this.enterDirection = 'none'
      } else if (this.currentIndex > nextRootIndex) {
        this.leaveDirection = 'bottom'
        this.enterDirection = 'top'
      } else {
        this.leaveDirection = 'top'
        this.enterDirection = 'bottom'
      }
      this.currentRoute = route
    },
  }
}

</script>

<template>
  <div :class="settings.theme">
    <div class="navbar">
      <div class="title" v-t="'title.' + currentRoute"/>
      <div class="top-right">
        <button @click="minimizeWindow()" class="minimize">
          <i class="icon-window-minimize"/>
        </button>
        <button @click="toggleMaximize()" class="maximize">
          <i v-if="maximize" class="icon-window-restore"/>
          <i v-else class="icon-window-maximize"/>
        </button>
        <button @click="closeWindow()" class="close">
          <i class="icon-window-close"/>
        </button>
      </div>
    </div>
    <div class="sidebar">
      <el-tooltip v-for="route in routes" :key="route" :hide-after="1000"
        :content="$t('title.' + route)" placement="right" :enterable="false">
        <button @click="switchRoute(route)" :class="{ active: route === currentRoute }">
          <i :class="'icon-' + route"/>
        </button>
      </el-tooltip>
      <div class="current-route" :style="{ transform: `
        translateY(-50%)
        translateY(${(currentIndex - (routes.length - 1) / 2) * 72}px)
      ` }"/>
    </div>
    <div ref="view" :class="['view', { switching }]" :style="{ 'overflow-y': scrollBarStyle }"
      @mousewheel.prevent.stop="viewScroll.scrollByDelta($event.deltaY)">
      <transition name="view" @before-enter="updateScrollBar(true)" @after-enter="updateScrollBar(false)"
        :leave-to-class="'transform-to-' + leaveDirection"
        :enter-class="'transform-to-' + enterDirection">
        <keep-alive>
          <component :is="currentRoute" :class="currentRoute"
            :height="height" :width="width" ref="content"
            @start-load="loading = true" @finish-load="loading = false"/>
        </keep-alive>
      </transition>
      <px-loading v-show="loading"/>
    </div>
    <div class="top-border"/>
    <div class="bottom-border"/>
    <div class="left-border"/>
    <div class="right-border"/>
  </div>
</template>

<style lang="scss">

$left-width: 64px;
$top-height: 48px;

.navbar, .sidebar, .view {
  position: absolute;
  overflow: hidden;
  transition: 0.5s ease;
}

.navbar, .sidebar {
  -webkit-app-region: drag;
  user-select: none;
}

button {
  text-align: center;
  border: none;
  outline: none;
  cursor: pointer;
  transition: 0.5s ease;
  -webkit-app-region: no-drag;
}

.navbar {
  top: 0;
  left: $left-width;
  height: $top-height;
  right: 0;

  button {
    top: 0;
    height: 100%;
    position: absolute;
  }
  
  div.title {
    top: 0;
    height: 28px;
    padding: 10px 16px;
    text-align: -webkit-left;
    font-size: 20px;
    transition: 0.5s ease;
  }
  
  div.top-right {
    position: absolute;
    top: 4px;
    bottom: 4px;
    right: 4px;
    float: right;

    button {
      width: 40px;
      padding: 8px 0;
      &.minimize { right: 80px }
      &.maximize { right: 40px }
      &.close { right: 0 }
    }
  }
}

.sidebar {
  top: 0;
  left: 0;
  bottom: 0;
  width: $left-width;
  display: flex;
  flex-direction: column;
  justify-content: center;

  button {
    width: 64px;
    height: 64px;
    margin: 4px 0;

    i {
      font-size: 28px;
      padding: 4px;
    }
  }

  .current-route {
    top: 50%;
    left: 60px;
    width: 4px;
    height: 64px;
    transition: 0.5s ease;
    position: absolute;
  }
}

.view {
  top: $top-height;
  left: $left-width;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: center;
  overflow-x: hidden;
  overflow-y: auto;
  
  > div { position: absolute }
}

div[class$="-border"] {
  position: absolute;
  -webkit-app-region: no-drag;
}

.top-border { top: 0; left: 0; height: 2px; width: 100% }
.bottom-border { bottom: 0; left: 0; height: 2px; width: 100% }
.left-border { top: 0; left: 0; height: 100%; width: 2px }
.right-border { top: 0; right: 0; height: 100%; width: 2px }

.no-transition { transition: none !important }
.transform-to-none { opacity: 0 }
.transform-to-top { transform: translateY(-100%); opacity: 0 }
.transform-to-bottom { transform: translateY(100%); opacity: 0 }
.view-enter-active, .view-leave-active { transition: 0.5s, opacity 0.5s ease }

</style>
