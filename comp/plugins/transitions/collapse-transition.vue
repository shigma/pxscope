<script>

module.exports = {
  functional: true,
  props: {
    duration: {
      type: Number,
      default: 0.3,
    },
    timingFunction: {
      type: String,
      default: 'ease-in-out',
    },
  },

  render(createElement, {
    props: {
      duration,
      timingFunction,
    },
    listeners,
    children,
  }) {

    const transition = [
      'height',
      'padding-top',
      'padding-bottom',
    ].map(name => `${duration}s ${timingFunction} ${name}`).join(',')

    function $emit(eventName, ...args) {
      if (listeners[eventName]) {
        listeners[eventName](...args)
      }
    }
    
    return createElement('transition', {
      attrs: {
        css: false,
      },
      on: {
        beforeEnter(el) {
          $emit('before-update', el)
          if (!el.dataset) el.dataset = {}
          el.dataset.oldTransition = el.style.transition
          el.dataset.oldPaddingTop = el.style.paddingTop
          el.dataset.oldPaddingBottom = el.style.paddingBottom
          el.style.transition = transition
          el.style.height = 0
          el.style.paddingTop = 0
          el.style.paddingBottom = 0
        },
        enter(el, done) {
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
          setTimeout(done, 1000 * duration)
        },
        afterEnter(el) {
          el.style.height = ''
          el.style.overflow = el.dataset.oldOverflow
          el.style.transition = el.dataset.oldTransition
          $emit('after-update', el)
        },
        beforeLeave(el) {
          $emit('before-update', el)
          if (!el.dataset) el.dataset = {}
          el.dataset.oldTransition = el.style.transition
          el.dataset.oldPaddingTop = el.style.paddingTop
          el.dataset.oldPaddingBottom = el.style.paddingBottom
          el.dataset.oldOverflow = el.style.overflow
          el.style.height = el.scrollHeight + 'px'
          el.style.overflow = 'hidden'
        },
        leave(el, done) {
          if (el.scrollHeight !== 0) {
            el.style.transition = transition
            el.style.height = 0
            el.style.paddingTop = 0
            el.style.paddingBottom = 0
          }
          setTimeout(done, 1000 * duration)
        },
        afterLeave(el) {
          el.style.transition = el.dataset.oldTransition
          el.style.height = ''
          el.style.overflow = el.dataset.oldOverflow
          el.style.paddingTop = el.dataset.oldPaddingTop
          el.style.paddingBottom = el.dataset.oldPaddingBottom
          $emit('after-update', el)
        },
      }
    }, children)
  }
}

</script>
