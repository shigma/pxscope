<script>

module.exports = {
  props: ['card', 'dragged', 'height'],
  inject: ['$view'],
  
  data: () => ({
    showMenu: false,
  }),
}

</script>

<template>
  <div :style="{ width: card.width + 'px', height: height + 'px' }" :class="{ dragged }">
    <div class="header" :class="$view.handleClass"
      @mousedown.middle.prevent.stop="$view.removeCard(card.id)"
      @dblclick.prevent.stop="$view.maximizeCard(card.id)">
      <i class="icon-menu" @click.stop="showMenu = !showMenu"/>
      <i class="icon-close" @click.stop="$view.removeCard(card.id)"/>
      <div v-text="card.title"/>
    </div>
    <px-collapse :open="showMenu" class="menu">
      <slot name="menu"/>
    </px-collapse>
    <px-scroll ref="content" :class="[ 'body', { empty: !$slots.default } ]"
      :breadth="6" :radius="2" :margin="2">
      <slot/>
    </px-scroll>
    <div class="border" @mousedown.prevent.stop="$view.startDrag(card.id, $event.clientX)"/>
    <px-loading v-show="card.loading"/>
  </div>
</template>

<style lang="scss" scoped>

& {
  top: 0;
  display: flex;
  user-select: none;
  position: relative;
  transition: 0.5s ease;
  flex-direction: column;
  background-color: #fbfcfe;

  > .header {
    text-align: center;
    font-size: 20px;
    line-height: 1em;
    padding: 8px;
    cursor: default;
    background-color: #ebeef5;

    div {
      margin: 0 30px;
      padding: 4px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    i {
      color: #909399;
      cursor: pointer;
      transition: 0.3s ease;
    }

    i:hover { color: #606266 }

    i.icon-menu {
      float: left;
      padding: 4px;
    }

    i.icon-close {
      float: right;
      font-size: 16px;
      padding: 6px;
    }
  }

  // > .body:not(.empty) {
  //   box-shadow: inset 0 4px 4px -4px #ebeef5;
  // }

  > .border {
    position: absolute;
    top: 0;
    right: 0;
    width: 2px;
    height: 100%;
    cursor: ew-resize;
    transition: 0.5s ease;
    background-color: #e5e5e5;

    &:hover { background-color: #c0c4cc }
  }
}

&.dragged {
  transition: none !important;

  > .border { background-color: #c0c4cc }
}

</style>
