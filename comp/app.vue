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
    if (fallback) {
      return Object.assign({}, fallback, JSON.parse(storage))
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
  i18n: require('../i18n'),
}

// Get current browser window.
const browser = electron.remote.getCurrentWindow()

// Load settings and accounts from local storage.
const defaultStorage = require('../default')
const storage = $loadFromStorage('storage', defaultStorage)

// Set default person folder path.
if (!storage.path) {
  if (process.platform === 'win32') {
    storage.path = process.env.APPDATA
  }
}

// Initialize Pixiv API.
global.$pixiv = require('../pixiv/dist')
$pixiv.config.hosts.load(require('../pixiv/hosts.json'))
$pixiv.config.timeout = storage.timeout * 1000
$pixiv.config.language = storage.language
$pixiv.authorize($loadFromStorage('auth'))
$pixiv.on('authorize', auth => localStorage.setItem('auth', JSON.stringify(auth)))

// Neat-scroll implementation.
NeatScroll.config.speed = storage.scroll_speed
NeatScroll.config.smooth = storage.scroll_smooth
Vue.prototype.$neatScroll = (...args) => new NeatScroll(...args)
Vue.prototype.$neatScroll.config = NeatScroll.config

// Vuex
const store = new Vuex.Store({
  state: storage,
  mutations: {
    setSettings(state, settings) {
      Object.assign(state, settings)
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
  locale: storage.language,
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
    currentRoute: storage.route,
    width: document.body.clientWidth - 64,
    height: document.body.clientHeight - 48,
  }),

  computed: {
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
      this.currentRoute = defaultStorage.route
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
      localStorage.setItem('storage', JSON.stringify(this.$store.state))
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
  <div>
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

@import './colors';

$left-width: 64px;
$top-height: 48px;

.navbar, .sidebar, .view {
  position: absolute;
  overflow: hidden;
  transition: 0.3s ease;
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
  right: 0;
  left: $left-width;
  height: $top-height;
  background: $bg0;
  color: $fg1;

  button {
    top: 0;
    color: $fg2;
    height: 100%;
    background: inherit;
    position: absolute;

    &:hover {
      color: $fg1;
      background: $bg2;
    }
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
  $bg-sidebar: mix($blue, $bg0, 80%);

  top: 0;
  left: 0;
  bottom: 0;
  display: flex;
  width: $left-width;
  flex-direction: column;
  justify-content: center;
  background-color: $bg-sidebar;

  button {
    width: 64px;
    height: 64px;
    margin: 4px 0;
    color: $bg1;
    background: inherit;

    i {
      font-size: 28px;
      padding: 4px;
    }

    &:hover, &.active {
      color: $bg0;
    }
  }

  .current-route {
    top: 50%;
    left: 60px;
    width: 4px;
    height: 64px;
    background: $bg0;
    position: absolute;
    transition: 0.5s ease;
  }
}

.view {
  $bg-view: #f5f6f8;

  color: $fg1;
  top: $top-height;
  left: $left-width;
  bottom: 0;
  right: 0;
  display: flex;
  overflow-y: auto;
  overflow-x: hidden;
  justify-content: center;
  background-color: $bg-view;
  
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
