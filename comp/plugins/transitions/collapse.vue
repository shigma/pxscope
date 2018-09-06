<script>

module.exports = {
  functional: true,
  render(createElement, context) {
    function $emit(eventName, ...args) {
      if (context.listeners[eventName]) {
        context.listeners[eventName](...args)
      }
    }
    return createElement('transition', {
      on: {
        beforeEnter(el) {
          el.classList.add('collapse-transition')
          if (!el.dataset) el.dataset = {}
          el.dataset.oldPaddingTop = el.style.paddingTop
          el.dataset.oldPaddingBottom = el.style.paddingBottom
          el.style.height = 0
          el.style.paddingTop = 0
          el.style.paddingBottom = 0
          $emit('before-update', el)
        },
        enter(el) {
          el.dataset.oldOverflow = el.style.overflow
          if (el.scrollHeight !== 0) {
            el.style.height = el.scrollHeight + 'px'
            el.style.paddingTop = el.dataset.oldPaddingTop
            el.style.paddingBottom = el.dataset.oldPaddingBottom
          } else {
            el.style.height = ''
            el.style.paddingTop = el.dataset.oldPaddingTop
            el.style.paddingBottom = el.dataset.oldPaddingBottom
          }
          el.style.overflow = 'hidden'
        },
        afterEnter(el) {
          el.classList.remove('collapse-transition')
          el.style.height = ''
          el.style.overflow = el.dataset.oldOverflow
          $emit('after-update', el)
        },
        beforeLeave(el) {
          if (!el.dataset) el.dataset = {}
          el.dataset.oldPaddingTop = el.style.paddingTop
          el.dataset.oldPaddingBottom = el.style.paddingBottom
          el.dataset.oldOverflow = el.style.overflow
          el.style.height = el.scrollHeight + 'px'
          el.style.overflow = 'hidden'
          $emit('before-update', el)
        },
        leave(el) {
          if (el.scrollHeight !== 0) {
            el.classList.add('collapse-transition')
            el.style.height = 0
            el.style.paddingTop = 0
            el.style.paddingBottom = 0
          }
        },
        afterLeave(el) {
          el.classList.remove('collapse-transition')
          el.style.height = ''
          el.style.overflow = el.dataset.oldOverflow
          el.style.paddingTop = el.dataset.oldPaddingTop
          el.style.paddingBottom = el.dataset.oldPaddingBottom
          $emit('after-update', el)
        },
      }
    }, context.children)
  }
}

</script>

<style lang="scss">

.collapse-transition {
  transition: 0.3s height ease-in-out, 0.3s padding-top ease-in-out, 0.3s padding-bottom ease-in-out;
}

</style>

