const Vue = require('vue')

// Prevent vue from generating production tips.
Vue.config.productionTip = false

// Set global environment of pxscope.
// 0: production mode.
// 1: development mode.
global.PX_ENV = 1

if (global.PX_ENV === 1) require('./build/build')

const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = 'dist/app.css'
document.head.appendChild(link)

new Vue(require('./dist/app.vue')).$mount('#app')
