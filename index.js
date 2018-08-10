const Vue = require('vue')

// Prevent vue from generating production tips.
Vue.config.productionTip = false

require('./build/transpile')

const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = 'dist/app.css'
document.head.appendChild(link)

new Vue(require('./dist/app.vue')).$mount('#app')
