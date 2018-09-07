<script>

const collapseTransition = require('./transitions/collapse.vue')

function isBoolean(value) {
  return value === true || value === false
}

module.exports = {
  components: { collapseTransition },

  props: {
    open: Boolean,
    initial: { default: 'open' },
  },

  data: () => ({
    isOpen: true,
  }),

  created() {
    if (isBoolean(this.open)) {
      this.isOpen = this.open
    } else {
      this.isOpen = this.initial === 'open'
    }
  },

  watch: {
    open(value) {
      if (isBoolean(value) && value ^ this.isOpen) {
        this.isOpen = value
      }
    },
  },
}
</script>

<template>
  <div class="px-collapse">
    <div class="header" tabindex="0" @click="$emit('click', $event)">
      <slot name="header"/>
    </div>
    <collapse-transition
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

  > .header {
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
