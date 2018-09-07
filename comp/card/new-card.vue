<script>

const { randomID } = require('../utils/utils')

module.exports = {
  extends: require('./card'),

  components: {
    draggable: require('vuedraggable'),
    pxPanel: require('./px-panel.vue'),
  },

  data: () => ({
    word: '',
    loading: false,
    wordList: [],
    panels: [],
    inputTime: 0,
    isHovering: false,
    hoverIndex: null,
    focusInput: false,
    draggingPanel: false,
    showSearchPanel: false,
  }),

  computed: {
    inputWidth() {
      return this.contentWidth - 32 - 28 * Number(this.showSearchPanel) + 'px'
    },
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
    searchAutoComplete(word) {
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
    hoverWord(index) {
      this.hoverIndex = index
      this.isHovering = true
    },
    searchWord(word) {
      if (!word) return
      this.insertCard('search-view', {
        category: 'general',
        key: word,
      })
    },
  }
}

</script>

<template>
  <div @click="showSearchPanel = false">
    <px-collapse :open="showSearchPanel" class="search" @after-update="updateWidth" @click.native.stop>
      <px-input v-model="word" prefix-icon="search" :suffix-icon="loading ? 'loading' : ''"
        :placeholder="$t('discovery.enterKeyword')" slot="header"
        :style="{ width: inputWidth }" :round="true" @enter="searchWord(word)"
        @focus="showSearchPanel = true" @input="searchAutoComplete"/>
      <i slot="header" class="icon-down" :style="{ opacity: Number(showSearchPanel) }"
        @click.stop="showSearchPanel = false"/>
      <div :style="{ height: wordList.length ? wordList.length * 24 + 16 + 'px' : '46px' }"
        class="search-result"><transition name="search-result">
        <div v-if="wordList.length">
          <div class="auto-complete-background"
            :style="{ top: hoverIndex * 24 + 'px', opacity: Number(isHovering) }"/>
          <transition-group tag="div" name="word" class="auto-complete"
            @mouseleave.native="isHovering = false" :style="{ height: wordList.length * 24 + 'px' }">
            <div v-for="(word, index) in wordList" :key="word" class="word"
              @mouseenter="hoverWord(index)" @click.stop="searchWord(word)">
              {{ word }}
              <i class="icon-arrow-right"/>
            </div>
          </transition-group>
        </div>
        <p v-else class="message" v-text="$t('discovery.' + (loading ? 'searching' : 'noSearchResult'))"/>
      </transition></div>
    </px-collapse>
    <draggable v-model="panels" @update="onUpdate"
      :options="{ animation: 150, ghostClass: 'drag-ghost', handle: '.' + handleClass }">
      <transition-group tag="div">
        <px-panel v-for="panel in panels" :key="panel.type + panel.category"
          :type="panel.type" :category="panel.category" @update="onUpdate"
          :open.sync="panel.open" :handle-class="handleClass" @after-update="updateWidth"/>
      </transition-group>
    </draggable>
  </div>
</template>

<style lang="scss" scoped>

.px-collapse.search {
  font-size: 16px;

  &:hover { background-color: inherit }

  .header {
    margin: 16px;
    cursor: default;

    i.icon-loading { color: #909399 }

    i.icon-down {
      font-size: 32px;
      transition: 0.3s ease;
      position: absolute;
      bottom: 6px;
      right: -18px;
      color: #c0c4cc;

      &:hover { color: #909399 }
    }
  }

  .search-result {
    position: relative;
    transition: 0.3s height ease;

    > * {
      position: absolute;
      transition: 0.3s opacity ease;
      width: -webkit-fill-available;
    }
  }

  .search-result-enter,
  .search-result-leave-to {
    opacity: 0;
  }

  .auto-complete-background {
    height: 24px;
    margin: 0 16px;
    padding: 0 8px;
    border-radius: 4px;
    position: absolute;
    background-color: #ebeef5;
    transition: 0.3s ease-in-out;
    width: -webkit-fill-available;
  }

  .auto-complete {
    position: relative;
    margin-bottom: 16px;

    .word {
      color: #303133;
      margin: 0 16px;
      padding: 0 8px;
      line-height: 1.5em;
      border-radius: 4px;
      transition: 0.5s ease;
      cursor: pointer;

      i {
        opacity: 0;
        color: #c0c4cc;
        float: right;
        line-height: 1.5em;
        transition: 0.2s ease 0.15s opacity, 0.2s ease color;

        &:hover { color: #606266 }
      }

      &:hover i { opacity: 1 }
    }

    .word-enter, .word-leave-to {
      opacity: 0;
      transform: translateX(-100%);
    }

    .word-leave-active {
      position: absolute;
    }
  }

  .message {
    font-size: 18px;
    color: #909399;
    cursor: default;
    line-height: 30px;
    margin: 0 24px 16px;
    text-align: -webkit-center;
  }
}

</style>
