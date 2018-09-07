<script>

const collapseTransition = require('./transitions/collapse-transition.vue')

function isBoolean(value) {
  return value === true || value === false
}

module.exports = {
  components: { collapseTransition },

  props: {
    open: Boolean,
    initial: String,
    duration: { default: 0.3 },
    timingFunction: { default: 'ease-in-out' },
  },

  data: () => ({
    isOpen: true,
  }),

  created() {
    if (this.initial) {
      this.isOpen = this.initial === 'open'
      this.onClickHeader = () => this.isOpen = !this.isOpen
    } else {
      this.isOpen = this.open
      this.onClickHeader = () => this.$emit('toggle', event)
      this.$watch('open', (value) => {
        if (isBoolean(value) && value ^ this.isOpen) this.isOpen = value
      })
    }
  },
}

</script>

<template>
  <div class="px-collapse">
    <div class="slot-header" tabindex="0" @click="onClickHeader">
      <slot name="header"/>
    </div>
    <collapse-transition :duration="duration" :timing-function="timingFunction"
      @after-update="$emit('after-update', $event)"
      @before-update="$emit('before-update', $event)">
      <div class="content" v-show="isOpen">
        <slot/>
      </div>
    </collapse-transition>
  </div>
</template>

<style lang="scss" scoped>

& {
  position: relative;
  background-color: transparent;
  border-bottom: 1px solid rgb(235, 238, 245);

  &:hover { background-color: #f5f7fa }

  > .slot-header {
    color: #303133;
    padding: 8px 16px;
    font-size: 20px;
    line-height: 1.5em;
    font-weight: bold;
    border: none;
    outline: none;
    cursor: pointer;
    position: relative;
    transition: 0.3s ease;
  }

  > .content {
    position: relative;
    transition: 0.3s ease;
  }
}

</style>
