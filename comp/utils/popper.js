const Popper = require('popper.js')
const PopupManager = require('./popup')
const { getElement } = require('./utils')

module.exports = {
  props: {
    transformOrigin: { default: true },
    placement: { default: 'bottom' },
    modifiers: { default: null },
    fixed: { default: false },
    boundariesPadding: { default: 5 },
    offset: { default: 0 },
    showArrow: { default: true },
    arrowOffset: { default: 35 },
    value: Boolean,
  },

  data: () => ({
    showPopper: false,
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
      } else {
        this.destroyPopper()
      }
    },
  },

  beforeDestroy() {
    this.doDestroy(true)
    if (this.popper && this.popper.parentNode === document.body) {
      this.popper.removeEventListener('click', (event) => {
        event.stopPropagation()
      })
      document.body.removeChild(this.popper)
    }
  },

  deactivated() {
    this.$options.beforeDestroy[0].call(this)
  },

  methods: {
    createPopper() {
      this.popper = this.popper || getElement(this.$refs.popper)
      this.reference = this.reference || getElement(this.$refs.reference)

      if (this.showArrow) this.appendArrow(this.popper)
      document.body.appendChild(this.popper)
      if (this.popperJS && this.popperJS.destroy) {
        this.popperJS.destroy()
      }

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
      this.popperJS.popper.style.zIndex = PopupManager.nextZIndex()
      this.popper.addEventListener('click', (event) => {
        event.stopPropagation()
      })
    },

    updatePopper() {
      const popperJS = this.popperJS
      if (popperJS) {
        popperJS.update()
        if (popperJS.popper) {
          popperJS.popper.style.zIndex = PopupManager.nextZIndex()
        }
      } else {
        this.createPopper()
      }
    },

    doDestroy(forceDestroy) {
      if (!this.popperJS || (this.showPopper && !forceDestroy)) return
      this.popperJS.destroy()
      this.popperJS = null
    },

    destroyPopper() {
      if (this.popperJS) {
        this.resetTransformOrigin()
      }
    },

    resetTransformOrigin() {
      if (!this.transformOrigin) return
      const placementMap = {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left'
      }
      const placement = this.popperJS.popper.getAttribute('x-placement').split('-')[0]
      const origin = placementMap[placement]
      this.popperJS.popper.style.transformOrigin = typeof this.transformOrigin === 'string'
        ? this.transformOrigin
        : ['top', 'bottom'].indexOf(placement) > -1 ? `center ${ origin }` : `${ origin } center`
    },

    appendArrow(element) {
      let hash
      if (this.appended) {
        return
      }

      this.appended = true

      for (const item in element.attributes) {
        if (/^_v-/.test(element.attributes[item].name)) {
          hash = element.attributes[item].name
          break
        }
      }

      const arrow = document.createElement('div')

      if (hash) {
        arrow.setAttribute(hash, '')
      }
      arrow.setAttribute('x-arrow', '')
      arrow.className = 'arrow'
      element.appendChild(arrow)
    }
  }
}
