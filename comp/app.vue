<template>
  <div :class="settings.theme">
    <div class="navbar">
      <div class="title" v-t="'title.' + currentRoute.slice(1).replace(/\//g, '-')"/>
      <div class="top-right">
        <button @click="browser.minimize()" class="minimize">
          <i class="icon-window-minimize"/>
        </button>
        <button @click="toggleMaximize()" class="maximize">
          <i v-if="maximize" class="icon-window-restore"/>
          <i v-else class="icon-window-maximize"/>
        </button>
        <button @click="browser.close()" class="close">
          <i class="icon-window-close"/>
        </button>
      </div>
    </div>
    <div class="sidebar">
      <el-tooltip v-for="root in roots" :key="root" :hide-after="1000"
        :content="$t('title.' + root)" placement="right" :enterable="false">
        <button @click="switchRoute(rootMap[root])"
          :class="{active: root === currentRoute.match(/^\/(\w+)/)[1]}">
          <i :class="'icon-' + root"/>
        </button>
      </el-tooltip>
      <div class="current-route" :style="{ transform: `
        translateY(-50%)
        translateY(${(currentRootIndex - (roots.length - 1) / 2) * 72}px)
      ` }"/>
    </div>
    <div ref="view" :class="['view', { switching }]" :style="{ 'overflow-y': scrollBarStyle }"
      @mousewheel.prevent.stop="viewScroll.scrollByDelta($event.deltaY)">
      <transition name="view" @before-enter="updateScrollBar(true)" @after-enter="updateScrollBar(false)"
        :leave-to-class="'transform-to-' + leaveDirection"
        :enter-class="'transform-to-' + enterDirection">
        <keep-alive>
          <component :is="currentRoute.replace(/\//g, '-').slice(1)"
            :height="height" :width="width" :class="currentRoute.replace(/\//g, '-').slice(1)"
            @start-load="loading = true" @finish-load="loading = false"/>
        </keep-alive>
      </transition>
      <loading v-show="loading"/>
    </div>
    <div class="top-border"/>
    <div class="bottom-border"/>
    <div class="left-border"/>
    <div class="right-border"/>
  </div>
</template>

<style lang="scss" scoped>

  $left-width: 64px;
  $top-height: 48px;

  .navbar, .sidebar, .view {
    position: absolute;
    overflow: hidden;
    transition: 0.5s ease;
  }

  .navbar, .sidebar {
    -webkit-app-region: drag;
    user-select: none;
  }

  button {
    text-align: center;
    border: none;
    outline: none;
    cursor: pointer;
    transition: 0.5s ease;
    -webkit-app-region: no-drag;
  }

  .navbar {
    top: 0;
    left: $left-width;
    height: $top-height;
    right: 0;

    button {
      top: 0;
      height: 100%;
      position: absolute;
    }
    
    div.title {
      top: 0;
      height: 28px;
      padding: 10px 16px;
      text-align: -webkit-left;
      font-size: 20px;
      transition: 0.5s ease;
    }
    
    div.top-right {
      position: absolute;
      top: 4px;
      bottom: 4px;
      right: 4px;
      float: right;

      button {
        width: 40px;
        padding: 8px 0;
        &.minimize { right: 80px }
        &.maximize { right: 40px }
        &.close { right: 0 }
      }
    }
  }

  .sidebar {
    top: 0;
    left: 0;
    bottom: 0;
    width: $left-width;
    display: flex;
    flex-direction: column;
    justify-content: center;

    button {
      width: 64px;
      height: 64px;
      margin: 4px 0;

      i {
        font-size: 28px;
        padding: 4px;
      }
    }

    .current-route {
      top: 50%;
      left: 60px;
      width: 4px;
      height: 64px;
      transition: 0.5s ease;
      position: absolute;
    }
  }

  .view {
    top: $top-height;
    left: $left-width;
    bottom: 0;
    right: 0;
    display: flex;
    justify-content: center;
    overflow-x: hidden;
    overflow-y: auto;
    
    > div { position: absolute }
  }

  div[class$="-border"] {
    position: absolute;
    -webkit-app-region: no-drag;
  }

  .top-border { top: 0; left: 0; height: 2px; width: 100% }
  .bottom-border { bottom: 0; left: 0; height: 2px; width: 100% }
  .left-border { top: 0; left: 0; height: 100%; width: 2px }
  .right-border { top: 0; right: 0; height: 100%; width: 2px }

  .transform-to-none { opacity: 0 }
  .transform-to-top { transform: translateY(-100%); opacity: 0 }
  .transform-to-bottom { transform: translateY(100%); opacity: 0 }
  .view-enter-active, .view-leave-active { transition: 0.5s, opacity 0.5s ease }

</style>
