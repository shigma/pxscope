<script>

module.exports = {
  mixins: [
    require('../utils/popper'),
  ],

  props: {
    trigger: { default: 'hover' }, // hover, click, focus, manual
    tag: { default: 'span' },
    openDelay: { default: 0 },
    closeDelay: { default: 200 },
    width: { default: 180 },
    padding: { default: 12 },
    showArrow: { default: true },
    arrowOffset: { default: 0 },
  },

  watch: {
    showPopper(value) {
      this.$emit(value ? 'show' : 'hide')
    }
  },

  mounted() {
    if (this.$slots.reference.length === 0) return
    const popper = this.popper = this.$refs.popper
    const reference = this.reference = this.$el

    reference.addEventListener('keydown', this.handleKeydown)
    reference.addEventListener('click', this.handleClick)

    if (this.trigger !== 'click') {
      reference.addEventListener('focus', this.handleFocus)
      popper.addEventListener('focus', this.handleFocus)
      reference.addEventListener('blur', this.handleBlur)
      popper.addEventListener('blur', this.handleBlur)
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
      this.reference.classList.add('focusing')
      if (this.trigger !== 'manual') this.showPopper = true
    },
    handleClick() {
      this.reference.classList.remove('focusing')
    },
    handleBlur() {
      this.reference.classList.remove('focusing')
      if (this.trigger !== 'manual') this.showPopper = false
    },
    handleMouseEnter() {
      clearTimeout(this._timer)
      if (this.openDelay) {
        this._timer = setTimeout(() => this.showPopper = true, this.openDelay)
      } else {
        this.showPopper = true
      }
    },
    handleMouseLeave() {
      clearTimeout(this._timer)
      if (this.closeDelay) {
        this._timer = setTimeout(() => this.showPopper = false, this.closeDelay)
      } else {
        this.showPopper = false
      }
    },
    handleKeydown(event) {
      if (event.keyCode === 27 && this.trigger !== 'manual') {
        this.doClose()
      }
    },
    handleDocumentClick(event) {
      function outof(element) {
        return !element || element.contains(event.target)
      }
      if (outof(this.$el) && outof(this.reference) && outof(this.popper)) {
        this.showPopper = false
      }
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
  <component :is="tag" class="px-popper">
    <transition name="fade-transition" @after-leave="doDestroy()">
      <div ref="popper" v-show="showPopper"
        :style="{ 'min-width': width + 'px', padding: padding + 'px' }">
        <slot/>
      </div>
    </transition>
    <slot name="reference"/>
  </component>
</template>

<style lang="scss" ref="popper">

& {
  position: absolute;
  background: #ffffff;
  min-width: 150px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  z-index: 2000;
  color: #606266;
  line-height: 1.4;
  text-align: justify;
  font-size: 14px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

&:focus:active, &:focus {
  outline-width: 0;
}

.arrow, .arrow::after {
  position: absolute;
  display: block;
  width: 0;
  height: 0;
  border-width: 6px;
  border-color: transparent;
  border-style: solid;
}

.arrow::after { content: " " }

&[x-placement^="top"], &[x-placement^="bottom"] {
  .arrow {
    left: 50%;
    margin-right: 3px;

    &::after { margin-left: -6px }
  }
}

&[x-placement^="top"] {
  margin-bottom: 12px;

  .arrow {
    bottom: -6px;
    border-top-color: #ebeef5;
    border-bottom-width: 0;
  }

  .arrow::after {
    bottom: 1px;
    border-top-color: #ffffff;
    border-bottom-width: 0;
  }
}

&[x-placement^="bottom"] {
  margin-top: 12px;
  
  .arrow {
    top: -6px;
    border-top-width: 0;
    border-bottom-color: #ebeef5;
  }

  .arrow::after {
    top: 1px;
    border-top-width: 0;
    border-bottom-color: #ffffff;
  }
}

&[x-placement^="right"], &[x-placement^="left"] {
  .arrow {
    top: 50%;
    margin-bottom: 3px;

    &::after { bottom: -6px }
  }
}

&[x-placement^="right"]{
  margin-left: 12px;

  .arrow {
    left: -6px;
    border-right-color: #ebeef5;
    border-left-width: 0;
  }

  .arrow::after {
    left: 1px;
    border-right-color: #ffffff;
    border-left-width: 0;
  }
}

&[x-placement^="left"] {
  margin-right: 12px;

  .arrow {
    right: -6px;
    border-right-width: 0;
    border-left-color: #ebeef5;
  }

  .arrow::after {
    right: 1px;
    border-right-width: 0;
    border-left-color: #ffffff;
  }
}

</style>
