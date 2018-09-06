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
    <div class="header">
      <div class="title" tabindex="0" @click.stop.prevent="onClick">
        <slot name="header"/>
      </div>
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
/*
@include b(collapse-item) {
  @include e(header) {
    border-bottom: 1px solid $--collapse-border-color;
    font-size: $--collapse-header-size;
    font-weight: 500;
    transition: border-bottom-color .3s;
    outline: none;
    @include e(arrow) {
      margin-right: 8px;
      transition: transform .3s;
      float: right;
      line-height: 48px;
      font-weight: 300;
      @include when(open) {
        transform: rotate(90deg);
      }
    }
    @include when(open) {
      border-bottom-color: transparent;
    }
  }

  @include e(wrap) {
    will-change: height;
    background-color: $--collapse-content-fill;
    overflow: hidden;
    box-sizing: border-box;
    border-bottom: 1px solid $--collapse-border-color;
  }

  @include e(content) {
    padding-bottom: 25px;
    font-size: $--collapse-content-size;
    color: $--collapse-content-color;
    line-height: 1.769230769230769;
  }

  &:last-child {
    margin-bottom: -1px;
  }
}
*/
</style>
