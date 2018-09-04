<script>

module.exports = {
  mixins: [
    require('./popper'),
  ],

  props: {
    trigger: {
      type: String,
      default: 'click',
      validator: value => ['click', 'focus', 'hover', 'manual'].indexOf(value) > -1
    },
    openDelay: {
      type: Number,
      default: 0
    },
    disabled: Boolean,
    content: String,
    reference: {},
    width: {},
    visibleArrow: {
      default: true
    },
    arrowOffset: {
      type: Number,
      default: 0
    },
  },

  computed: {
    tooltipId() {
      return `el-popover-${Math.floor(Math.random() * 10000)}`
    }
  },
  watch: {
    showPopper(val) {
      if (this.disabled) {
        return
      }
      val ? this.$emit('show') : this.$emit('hide')
    }
  },

  mounted() {
    let reference = this.referenceElm = this.reference || this.$refs.reference
    const popper = this.popper || this.$refs.popper

    if (!reference && this.$slots.reference && this.$slots.reference[0]) {
      reference = this.referenceElm = this.$slots.reference[0].elm
    }
    // 可访问性
    if (reference) {
      reference.classList.add('el-popover__reference')
      reference.setAttribute('aria-describedby', this.tooltipId)
      reference.setAttribute('tabindex', 0)
      popper.setAttribute('tabindex', 0)

      if (this.trigger !== 'click') {
        reference.addEventListener('focusin', () => {
          this.handleFocus()
          const instance = reference.__vue__
          if (instance && typeof instance.focus === 'function') {
            instance.focus()
          }
        })
        popper.addEventListener('focusin', this.handleFocus)
        reference.addEventListener('focusout', this.handleBlur)
        popper.addEventListener('focusout', this.handleBlur)
      }
      reference.addEventListener('keydown', this.handleKeydown)
      reference.addEventListener('click', this.handleClick)
    }
    if (this.trigger === 'click') {
      reference.addEventListener('click', this.doToggle)
      document.addEventListener('click', this.handleDocumentClick)
    } else if (this.trigger === 'hover') {
      reference.addEventListener('mouseenter', this.handleMouseEnter)
      popper.addEventListener('mouseenter', this.handleMouseEnter)
      reference.addEventListener('mouseleave', this.handleMouseLeave)
      popper.addEventListener('mouseleave', this.handleMouseLeave)
    } else if (this.trigger === 'focus') {
      if (reference.querySelector('input, textarea')) {
        reference.addEventListener('focusin', this.doShow)
        reference.addEventListener('focusout', this.doClose)
      } else {
        reference.addEventListener('mousedown', this.doShow)
        reference.addEventListener('mouseup', this.doClose)
      }
    }
  },

  methods: {
    doToggle() {
      this.showPopper = !this.showPopper
    },
    doShow() {
      this.showPopper = true
    },
    doClose() {
      this.showPopper = false
    },
    handleFocus() {
      this.referenceElm.classList.add('focusing')
      if (this.trigger !== 'manual') this.showPopper = true
    },
    handleClick() {
      this.referenceElm.classList.remove('focusing')
    },
    handleBlur() {
      this.referenceElm.classList.remove('focusing')
      if (this.trigger !== 'manual') this.showPopper = false
    },
    handleMouseEnter() {
      clearTimeout(this._timer)
      if (this.openDelay) {
        this._timer = setTimeout(() => {
          this.showPopper = true
        }, this.openDelay)
      } else {
        this.showPopper = true
      }
    },
    handleKeydown(ev) {
      if (ev.keyCode === 27 && this.trigger !== 'manual') { // esc
        this.doClose()
      }
    },
    handleMouseLeave() {
      clearTimeout(this._timer)
      this._timer = setTimeout(() => {
        this.showPopper = false
      }, 200)
    },
    handleDocumentClick(e) {
      let reference = this.reference || this.$refs.reference
      const popper = this.popper || this.$refs.popper

      if (!reference && this.$slots.reference && this.$slots.reference[0]) {
        reference = this.referenceElm = this.$slots.reference[0].elm
      }
      if (!this.$el ||
        !reference ||
        this.$el.contains(e.target) ||
        reference.contains(e.target) ||
        !popper ||
        popper.contains(e.target)) return
      this.showPopper = false
    },
    handleAfterEnter() {
      this.$emit('after-enter')
    },
    handleAfterLeave() {
      this.$emit('after-leave')
      this.doDestroy()
    }
  },

  destroyed() {
    const reference = this.reference

    reference.removeEventListener('click', this.doToggle)
    reference.removeEventListener('mouseup', this.doClose)
    reference.removeEventListener('mousedown', this.doShow)
    reference.removeEventListener('focusin', this.doShow)
    reference.removeEventListener('focusout', this.doClose)
    reference.removeEventListener('mousedown', this.doShow)
    reference.removeEventListener('mouseup', this.doClose)
    reference.removeEventListener('mouseleave', this.handleMouseLeave)
    reference.removeEventListener('mouseenter', this.handleMouseEnter)
    document.removeEventListener('click', this.handleDocumentClick)
  }
}
</script>

<template>
  <span>
    <transition name="fade-transition"
      @after-enter="handleAfterEnter"
      @after-leave="handleAfterLeave">
      <div
        class="el-popover el-popper"
        ref="popper"
        v-show="!disabled && showPopper"
        :style="{ width: width + 'px' }"
        role="tooltip"
        :id="tooltipId"
        :aria-hidden="(disabled || !showPopper) ? 'true' : 'false'"
      >
        <slot/>
      </div>
    </transition>
    <slot name="reference"/>
  </span>
</template>
