<script>

module.exports = {
  props: ['illust', 'showMask', 'size', 'radius'],
  inject: ['$card'],

  data: () => ({
    hover: false,
    loading: true,
  }),

  computed: {
    spinnerStyle() {
      return {
        'font-size': this.size / 3 + 'px',
        'margin-top': - this.size / 6 + 'px',
      }
    },
  },
}

</script>

<template>
  <div :style="{ height: size + 'px', width: size + 'px' }"
    @mouseenter="hover = true" @mouseleave="hover = false"
    @click.stop="$card.insertCard('illust-view', { illust })">
    <img :src="illust.image_urls.square_medium" @load="loading = false"
      :height="size" :width="size" :style="{ 'border-radius': radius + 'px' }"/>
    <i class="icon-spinner" v-show="loading" :style="spinnerStyle"/>
    <transition name="mask">
      <div v-show="hover && showMask" class="mask">
        <div><i class="icon-view"/>{{ illust.total_view }}</div>
        <div><i class="icon-bookmark"/>{{ illust.total_bookmarks }}</div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>

& {
  margin: 0 auto;
  display: inline-block;
  position: relative;
  text-align: center;
  overflow: hidden;
  cursor: pointer;

  > img {
    top: 0;
    left: 0;
    user-select: none;
    position: absolute;
  }

  > i.icon-spinner {
    color: #409eff;
    top: 50%;
    left: 0;
    width: 100%;
    position: absolute;
    animation: rotating 2s linear infinite;
  }

  .mask {
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 4px;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;

    div {
      font-size: 20px;
      line-height: 1em;
      font-weight: bold;
      color: #409eff;
      margin: 8px 0;

      i {
        font-size: 18px;
        padding-right: 6px;
      }
    }
  }

  .mask-enter, .mask-leave-to { transform: translateY(100%) }
  .mask-enter-active, .mask-leave-active { transition: 0.3s ease }
}
  
</style>
