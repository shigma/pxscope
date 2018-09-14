const Popper = require('popper.js')
const utils = require('./utils')

const placementMap = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

module.exports = {
  props: {
    parent: { default: document.body },
    placement: { default: 'bottom' },
    fixed: { default: false },
    value: Boolean,
  },

  data: () => ({
    modifiers: {},
    showPopper: false,
    showArrow: true,
  }),

  watch: {
    value: {
      immediate: true,
      handler(value) {
        this.showPopper = value
      }
    },
    showPopper(value) {
      if (this.disabled) return
      if (value) {
        this.updatePopper()
        this.$emit('showed')
      } else if (this.popperJS) {
        this.resetTransformOrigin()
        this.$emit('hidden')
      }
    },
  },

  deactivated() {
    this.$options.beforeDestroy[0].call(this)
  },

  beforeDestroy() {
    this.destroyPopper(true)
    if (this.popper && this.popper.parentNode === this.parent) {
      this.popper.removeEventListener('click', utils.eventHandlers.stop)
      this.parent.removeChild(this.popper)
    }
  },

  methods: {
    createPopper() {
      this.popper = this.popper || utils.refElement.call(this, 'popper')
      this.reference = this.reference || utils.refElement.call(this, 'reference')
      if (this.showArrow) this.appendArrow()
      this.parent.appendChild(this.popper)
      this.popperJS = new Popper(this.reference, this.popper, {
        placement: this.placement,
        positionFixed: this.fixed,
        eventsEnabled: true,
        removeOnDestroy: false,
        modifiers: this.modifiers,
        onCreate: () => {
          this.$emit('created', this)
          this.resetTransformOrigin()
          this.$nextTick(this.updatePopper)
        },
        onUpdate: () => {
          this.$emit('updated', this)
        },
      })
      this.popper.addEventListener('click', utils.eventHandlers.stop)
    },
    updatePopper() {
      if (this.popperJS) {
        this.popperJS.update()
      } else {
        this.createPopper()
      }
      this.popper.style.zIndex = utils.nextZIndex()
    },
    destroyPopper(forced = false) {
      if (!this.popperJS || (this.showPopper && !forced)) return
      this.popperJS.destroy()
      this.popperJS = null
    },
    appendArrow() {
      if (this.appended) return
      const arrow = document.createElement('div')
      arrow.setAttribute('x-arrow', '')
      arrow.className = 'arrow'
      this.popper.appendChild(arrow)
      this.appended = true
    },
    resetTransformOrigin() {
      const placement = this.popper.getAttribute('x-placement').split('-')[0]
      const origin = placementMap[placement]
      this.popper.style.transformOrigin = ['top', 'bottom'].indexOf(placement) > -1
        ? `center ${origin}`
        : `${origin} center`
    },
  }
}
