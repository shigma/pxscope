<script>

const collapseTransition = require('./transitions/collapse.vue')

module.exports = {
  components: { collapseTransition },

  props: {
    initial: { default: 'open' },
  },

  data: () => ({
    open: true,
  }),

  created() {
    this.open = this.initial === 'open'
  },

  methods: {
    onClick(event) {
      this.open = !this.open
      this.$emit('click', event)
    },
    toggle() {
      this.open = !this.open
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
      <div class="content" v-show="open">
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
