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

  methods: {
    beforeEnter() {
      this.$emit('before-update')
      this.isClosed = false
    },
    afterEnter() {
      this.$emit('after-update')
    },
    beforeLeave() {
      this.$emit('before-update')
    },
    afterLeave() {
      this.isClosed = true
      this.$emit('after-update')
    },
  }
}

</script>

<template>
  <div class="px-collapse" :class="{ header: $slots.header, closed: isClosed }">
    <div class="slot-header" tabindex="0" @click="onClickHeader" v-if="$slots.header">
      <slot name="header"/>
    </div>
    <collapse-transition
      @before-enter="beforeEnter" @after-enter="afterEnter"
      @before-leave="beforeLeave" @after-leave="afterLeave">
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
  border-bottom: 1px solid #ebeef5;

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
