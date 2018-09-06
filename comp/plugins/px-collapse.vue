<script>

const collapseTransition = require('./transitions/collapse.vue')

module.exports = {
  components: { collapseTransition },

  props: {
    appearOpen: { default: true },
  },

  data: () => ({
    contentWrapStyle: {
      height: 'auto',
      display: 'block'
    },
    contentHeight: 0,
    focusing: false,
    isClick: false,
    isActive: true,
  }),

  created() {
    this.isActive = this.appearOpen
  },

  methods: {
    handleFocus() {
      setTimeout(() => {
        if (!this.isClick) {
          this.focusing = true
        } else {
          this.isClick = false
        }
      }, 50)
    },
    handleHeaderClick() {
      this.focusing = false
      this.isClick = true
    },
  }
}
</script>

<template>
  <div class="px-collapse">
    <div class="header">
      <div
        class="title"
        @click="handleHeaderClick"
        tabindex="0"
        @keyup.space.enter.stop="handleEnterClick"
        :class="{
          'focusing': focusing,
          'is-active': isActive
        }"
        @focus="handleFocus"
        @blur="focusing = false"
      >
        <i class="icon-arrow-up" :class="{ isActive }"/>
        <slot name="header"/>
      </div>
    </div>
    <collapse-transition>
      <div class="wrapper" v-show="isActive">
        <div class="el-collapse-item__content">
          <slot/>
        </div>
      </div>
    </collapse-transition>
  </div>
</template>

<style lang="scss" scoped>

& {
  height: 48px;
  line-height: 48px;
}
/*
@include b(collapse-item) {
  @include e(header) {
    height: $--collapse-header-height;
    line-height: $--collapse-header-height;
    background-color: $--collapse-header-fill;
    color: $--collapse-header-color;
    cursor: pointer;
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
      @include when(active) {
        transform: rotate(90deg);
      }
    }
    &.focusing:focus:not(:hover){
      color: $--color-primary;
    }
    @include when(active) {
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
