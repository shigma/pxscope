const VueMessage = Vue.extend(require('./message.vue'))
const PopupManager = require('./utils/popup')

const instances = []
let idCounter = 1

function Message(options = {}) {
  if (typeof options === 'string') {
    options = { message: options }
  }

  const id = 'message_' + idCounter ++
  const userOnClose = options.onClose
  options.onClose = () => Message.close(id, userOnClose)
  const instance = new VueMessage({ data: options })

  instance.id = id
  instance.vm = instance.$mount()
  document.body.appendChild(instance.vm.$el)
  instance.vm.visible = true
  instance.dom = instance.vm.$el
  instance.dom.style.zIndex = PopupManager.zIndex ++
  instances.push(instance)
  return instance.vm
}

['success', 'warning', 'info', 'error'].forEach(type => {
  Message[type] = options => {
    if (typeof options === 'string') {
      options = {
        message: options
      }
    }
    options.type = type
    return Message(options)
  }
})

Message.close = function(id, userOnClose) {
  const index = instances.findIndex(instance => instance.id === id)
  if (index) {
    if (typeof userOnClose === 'function') {
      userOnClose(instances[index])
    }
    instances.splice(index, 1)
  }
}

Message.closeAll = function() {
  for (let i = instances.length - 1; i >= 0; i--) {
    instances[i].close()
  }
}

module.exports = {
  install(Vue) {
    Vue.component('px-loading', require('./px-loading.vue'))
    Vue.component('px-popover', require('./px-popover.vue'))
    Vue.component('px-caption', require('./card/px-caption.vue'))
    Vue.component('px-illusts', require('./card/px-illusts.vue'))
    Vue.component('px-illusts-item', require('./card/px-illusts-item.vue'))
    Vue.component('px-image', require('./card/px-image.vue'))
    Vue.component('px-user-preview', require('./card/px-user-preview.vue'))
    Vue.prototype.$message = Message
  }
}

