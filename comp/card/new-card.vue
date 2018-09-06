<script>

const { randomID } = require('../utils/utils')

module.exports = {
  extends: require('./card'),

  data: () => ({
    word: '',
    loading: false,
    wordList: [],
    panels: [],
    inputTime: 0,
    showPanel: false,
    draggingPanel: false,
  }),

  components: {
    draggable: require('vuedraggable'),
    pxPanel: require('./px-panel.vue'),
  },

  created() {
    this.getCard(card => card.title = this.$t('discovery.newPage'))
    this.handleClass = 'handler-' + randomID()
    this.panels = this.$store.state.settings.panels
  },

  methods: {
    onUpdate() {
      this.$store.commit('setSettings', { panels: this.panels })
    },
    search(word) {
      if (!word) return
      this.loading = true
      const inputTime = Date.now()
      $pixiv.search('word', word, 'autoComplete').then((list) => {
        if (this.inputTime < inputTime) {
          this.loading = false
          this.wordList = list
          this.inputTime = inputTime
        }
      })
    },
    beforeEnter(element) {
      element.style.opacity = 0
      element.style.height = 0
    },
    enter(element, complete) {
      this.animate(element, complete, { opacity: 1, height: '1.6em' })
    },
    leave(element, complete) {
      this.animate(element, complete, { opacity: 0, height: 0 })
    },
    animate(element, complete, style) {
      setTimeout(() => {
        element.velocity(style, { complete })
      }, element.dataset.index * 50)
    },
  }
}

</script>

<template>
  <div>
    <!-- <px-input v-model="word" prefix-icon="search" :round="true" @input="search"
      :style="{ width: width - 32 + 'px' }" @focus="showPanel = true"
      :suffix-icon="loading ? 'loading' : ''"/>
    <transition name="search-panel">
      <div class="search-panel" v-show="showPanel" @click.stop.prevent="showPanel = false">
        <transition-group tag="ul" :css="false"
          @before-enter="beforeEnter" @enter="enter" @leave="leave">
          <li v-for="(word, index) in wordList" :key="word" :data-index="index" v-text="word"/>
        </transition-group>
      </div>
    </transition> -->
    <draggable v-model="panels" @update="onUpdate"
      :options="{ animation: 150, ghostClass: 'drag-ghost', handle: '.' + handleClass }">
      <transition-group tag="div">
        <px-panel v-for="panel in panels" :key="panel.type + panel.category"
          :type="panel.type" :category="panel.category" @update="onUpdate"
          :open.sync="panel.open" :handle-class="handleClass"/>
      </transition-group>
    </draggable>
  </div>
</template>

<style lang="scss" scoped>

.px-input {
  margin: 20px 16px 8px;
}

.search-panel {
  top: 60px;
  left: 0;
  bottom: 0;
  width: 100%;
  opacity: 1;
  overflow: hidden;
  position: absolute;
  background: #fafbfc;
  transition: 0.5s opacity;
}

.search-panel-enter, .search-panel-leave-to { opacity: 0 }
.search-panel-leave-active { transition: 0.5s opacity }

button.menu {
  width: 100%;
  font-size: 16px;
  text-align: left;
  padding: 12px 16px;
  line-height: 1em;
}

ul {
  li {
    transition: all 0.3s;
  }
}

.px-panel {
  transition: 0.3 ease;
}

</style>
