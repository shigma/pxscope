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
      if (isBoolean(this.open)) this.isOpen = value
    }
  },

  methods: {
    onClick() {
      this.$emit('update:open', !this.isOpen)
    },
  }
}
</script>

<template>
  <div class="px-collapse">
    <div class="header" tabindex="0" @click.stop.prevent="onClick">
      <slot name="header"/>
    </div>
    <collapse-transition>
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
  }
}

</style>
