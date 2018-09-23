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
    isClosed: false,
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
    this.isClosed = !this.isOpen
  },
}

</script>

<template>
  <div class="px-collapse" :class="{ header: $slots.header, closed: isClosed }">
    <div class="slot-header" tabindex="0" @click="onClickHeader" v-if="$slots.header">
      <slot name="header"/>
    </div>
    <collapse-transition @after-leave="isClosed = true" @before-enter="isClosed = false">
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
  transition: background-color 0.3s ease;
  border-bottom: 1px solid rgb(235, 238, 245);

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

&.header:hover { background-color: #f5f7fa }
&.closed:not(.header) { border-bottom: none }

</style>
