<template>
  <div @mousewheel.prevent.stop="viewScroll.scrollByDelta($event.deltaY)">
    <transition name="logo">
      <div v-if="!cards.length" class="empty">
        <i class="icon-discovery" @click.stop="insertCard()"/>
      </div>
    </transition>
    <transition-group class="cards" tag="div" name="card">
      <div v-for="card in cards" :key="card.id"
        :style="{ width: card.width + 'px' }" :class="['card', { dragged: dragStatus }]">
        <div class="title" v-text="card.title"
          @mousedown.middle.prevent.stop="removeCard(card.id)"
          @dblclick.prevent.stop="maximizeCard(card.id)"/>
        <component :is="card.type" class="content" :class="card.type"
          :width="card.width" :height="cardHeight" :id="card.id"
          :data="card.data" :style="{ height: cardHeight + 'px' }"/>
        <div class="border" @mousedown="startDrag(card.id, $event.clientX)"/>
        <loading v-show="card.loading"/>
      </div>
    </transition-group>
  </div>
</template>

<style lang="scss" scoped>

  & {
    margin: auto;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .empty {
    margin: auto;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    transition: 0.5s ease;
    font-size: 240px;
    position: absolute;
    height: fit-content;
    width: fit-content;
  }

  .logo-enter-active, .logo-leave-active { transition: 0.5s ease }
  .logo-enter, .logo-leave-to { opacity: 0 }

  .cards {
    float: left;
    top: 0px;
    height: 100%;
    display: flex;
    transition: 0.5s ease;
  }

  .card {
    top: 0;
    user-select: none;
    position: relative;
    display: inline-block;
    transition: 0.5s ease;

    &.dragged { transition: none !important }

    ::-webkit-scrollbar { width: 6px }
    ::-webkit-scrollbar-thumb { border-radius: 2px }

    > .title {
      text-align: center;
      font-size: 20px;
      line-height: 1em;
      padding: 10px;
      cursor: default;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    > .content {
      position: relative;
      left: 0;
      top: 0;
      width: 100%;
      overflow-x: hidden;
      overflow-y: auto;
    }

    > .border {
      position: absolute;
      top: 0;
      right: 0;
      width: 2px;
      height: 100%;
      cursor: ew-resize;
      transition: 0.5s ease;
    }

    &:last-child > .border { display: none }
  }

  .card-enter { opacity: 0; transform: translateY(100%) }
  .card-leave-to { opacity: 0; transform: translateY(-100%) }
  .card-enter-active, .card-leave-active, .card-move { transition: 0.5s ease }

</style>
