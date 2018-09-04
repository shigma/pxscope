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

  watch: {
    showPopper(val) {
      this.$emit(val ? 'show' : 'hide')
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
    <transition name="fade-transition" @after-leave="doDestroy()">
      <div ref="popper" v-show="showPopper"
        :style="{ width: width + 'px' }">
        <slot/>
      </div>
    </transition>
    <slot name="reference"/>
  </span>
</template>

<style lang="scss" ref="popper">

$arrow-size: 6px;

& {
  .popper__arrow,
  .popper__arrow::after {
    position: absolute;
    display: block;
    width: 0;
    height: 0;
    border-color: transparent;
    border-style: solid;
  }

  .popper__arrow {
    border-width: $arrow-size;
    filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.03))
  }

  .popper__arrow::after {
    content: " ";
    border-width: $arrow-size;
  }

  &[x-placement^="top"] {
    margin-bottom: #{$arrow-size + 6};
  }

  &[x-placement^="top"] .popper__arrow {
    bottom: -$arrow-size;
    left: 50%;
    margin-right: #{$arrow-size / 2};
    border-top-color: #ebeef5;
    border-bottom-width: 0;

    &::after {
      bottom: 1px;
      margin-left: -$arrow-size;
      border-top-color: #ffffff;
      border-bottom-width: 0;
    }
  }

  &[x-placement^="bottom"] {
    margin-top: #{$arrow-size + 6};
  }

  &[x-placement^="bottom"] .popper__arrow {
    top: -$arrow-size;
    left: 50%;
    margin-right: #{$arrow-size / 2};
    border-top-width: 0;
    border-bottom-color: #ebeef5;

    &::after {
      top: 1px;
      margin-left: -$arrow-size;
      border-top-width: 0;
      border-bottom-color: #ffffff;
    }
  }

  &[x-placement^="right"] {
    margin-left: #{$arrow-size + 6};
  }

  &[x-placement^="right"] .popper__arrow {
    top: 50%;
    left: -$arrow-size;
    margin-bottom: #{$arrow-size / 2};
    border-right-color: #ebeef5;
    border-left-width: 0;

    &::after {
      bottom: -$arrow-size;
      left: 1px;
      border-right-color: #ffffff;
      border-left-width: 0;
    }
  }

  &[x-placement^="left"] {
    margin-right: #{$arrow-size + 6};
  }

  &[x-placement^="left"] .popper__arrow {
    top: 50%;
    right: -$arrow-size;
    margin-bottom: #{$arrow-size / 2};
    border-right-width: 0;
    border-left-color: #ebeef5;

    &::after {
      right: 1px;
      bottom: -$arrow-size;
      margin-left: -$arrow-size;
      border-right-width: 0;
      border-left-color: #ffffff;
    }
  }
}

& {
  position: absolute;
  background: #ffffff;
  min-width: 150px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  padding: 12px;
  z-index: 2000;
  color: #606266;
  line-height: 1.4;
  text-align: justify;
  font-size: 14px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  &:focus:active, &:focus {
    outline-width: 0;
  }
}

</style>
