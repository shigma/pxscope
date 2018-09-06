<script>

function throttle(delay, callback) {
  let timeoutID
  let lastExec = 0
  return function(...args) {
    let elapsed = Date.now() - lastExec
    clearTimeout(timeoutID)
    if (elapsed > delay) {
      lastExec = Date.now()
      callback.apply(this, args)
    }
  }
}

module.exports = {
  extends: require('./card'),

  data: () => ({
    word: '',
    loading: false,
    wordList: [],
    inputTime: 0,
    showPanel: false,
  }),

  components: {
    pxPanel: require('./px-panel.vue'),
  },

  created() {
    this.getCard(card => card.title = this.$t('discovery.newPage'))
  },

  methods: {
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
    <px-panel type="recommended"
      :title="$t('discovery.recommended') + $t('discovery.illusts')"/>
    <px-panel type="new"
      :title="$t('discovery.new') + $t('discovery.illusts')"/>
    <px-panel type="follow"
      :title="$t('discovery.follow') + $t('discovery.illusts')"/>
    <!-- <button class="menu" v-text="$t('discovery.recommended') + $t('discovery.illusts')"
      @click.stop="insertCard('illust-list', { type: 'recommended', category: 'get_illusts' })"/>
    <button class="menu" v-text="$t('discovery.new') + $t('discovery.illusts')"
      @click.stop="insertCard('illust-list', { type: 'new', category: 'get_illusts' })"/>
    <button class="menu" v-text="$t('discovery.follow') + $t('discovery.illusts')"
      @click.stop="insertCard('illust-list', { type: 'follow', category: 'get_illusts' })"/>
    <button class="menu" v-text="$t('discovery.recommended') + $t('discovery.users')"
      @click.stop="insertCard('user-list', { type: 'recommended', category: 'get_users' })"/> -->
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
  
</style>
