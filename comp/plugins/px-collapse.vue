<script>

function isBoolean(value) {
  return value === true || value === false
}

module.exports = {
  props: {
    open: Boolean,
    initial: String,
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
  <div class="px-collapse" :class="{ 'has-header': $slots.header }">
    <div class="slot-header" tabindex="0" @click="onClickHeader" v-if="$slots.header">
      <slot name="header"/>
    </div>
    <collapse-transition
      @after-enter="$emit('after-update', $event)"
      @before-enter="$emit('before-update', $event)"
      @after-leave="$emit('after-update', $event)"
      @before-leave="$emit('before-update', $event)">
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
  width: -webkit-fill-available;
  border-bottom: 1px solid rgb(235, 238, 245);

  &:not(.has-header) { top: -1px }
  &.has-header:hover { background-color: #f5f7fa }

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
