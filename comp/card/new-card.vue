<script>

const { randomID } = require('../utils/utils')

const defaultPanels = [
  { key: 8, open: true, category: "user", type: "recommended" },
  { key: 9, open: true, category: "user", type: "followed" },
  { key: 0, open: true, category: "illust", type: "recommended" },
  { key: 1, open: true, category: "illust", type: "followed" },
  { key: 2, open: true, category: "illust", type: "new" },
  { key: 3, open: true, category: "illust", type: "walkthrough" },
]

const defaultSettings = {
  history: [],
  panels: defaultPanels,
}

module.exports = {
  extends: require('./card'),

  components: {
    draggable: require('vuedraggable'),
    pxPanel: require('./px-panel.vue'),
  },

  data() {
    const storage = this.$loadFromStorage('new-card', defaultSettings)
    defaultPanels.forEach((panel) => {
      const index = storage.panels.findIndex(({ key }) => key === panel.key)
      if (index === -1) storage.panels.push(panel)
    })
    return {
      ...storage,
      word: '',
      wordList: [],
      inputTime: 0,
      isHovering: false,
      hoverIndex: null,
      searchLoading: false,
      showSearchPanel: false,
    }
  },

  computed: {
    inputWidth() {
      return this.card.width - 32 - 28 * Number(this.showSearchPanel) + 'px'
    },
    recent() {
      return this.history.slice(0, 10)
    },
    searchResultHeight() {
      return this.wordList.length ? this.wordList.length * 24 + 16 : 46
    },
    searchHistoryStyle() {
      return this.recent.length ? {
        height: this.recent.length * 24 + 62 + 'px',
        opacity: 1,
      } : {
        height: 0,
        opacity: 0,
      }
    },
    wordBackgroundStyle() {
      return {
        top: (this.hoverIndex >= 10
          ? this.searchResultHeight + (this.hoverIndex - 10) * 24 + 46
          : this.hoverIndex * 24) + 'px',
        opacity: Number(this.isHovering),
      }
    },
  },

  created() {
    this.meta.title = this.$t('discovery.newPage')
    this.handleClass = 'handler-' + randomID()
  },

  mounted() {
    addEventListener('beforeunload', () => {
      localStorage.setItem('new-card', JSON.stringify({
        panels: this.panels,
        history: this.history.slice(0, 10),
      }))
    })
  },

  methods: {
    searchAutoComplete(word) {
      if (!word) return
      this.searchLoading = true
      const inputTime = Date.now()
      $pixiv.search('word', word, 'autoComplete').then((list) => {
        if (this.inputTime < inputTime) {
          this.searchLoading = false
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
      const index = this.history.indexOf(word)
      if (index >= 0) this.history.splice(index, 1)
      this.history.unshift(word)
      this.insertCard('search-view', {
        category: 'general',
        key: word,
      })
    },
  }
}

</script>

<template>
  <px-card :card="card" :dragged="dragged" :height="height"
    @click.native="showSearchPanel = false">
    <px-collapse :open="showMenu" class="menu">
      菜单
    </px-collapse>
    <px-collapse :open="showSearchPanel" class="search" @click.native.stop>
      <px-input v-model="word" prefix-icon="search" :suffix-icon="searchLoading ? 'loading' : ''"
        :placeholder="$t('discovery.enterKeyword')" slot="header"
        :style="{ width: inputWidth }" :round="true" @enter="searchWord(word)"
        @focus="showSearchPanel = true" @input="searchAutoComplete"/>
      <i slot="header" class="icon-down" :style="{ opacity: Number(showSearchPanel) }"
        @click.stop="showSearchPanel = false"/>
      <div class="word-background" :style="wordBackgroundStyle"/>
      <div :style="{ height: searchResultHeight + 'px' }" class="search-result">
        <transition name="search-result">
          <div v-if="wordList.length">
            <transition-group tag="div" name="word" class="word-list"
              @mouseleave.native="isHovering = false" :style="{ height: wordList.length * 24 + 'px' }">
              <div v-for="(word, index) in wordList" :key="word" class="word"
                @mouseenter="hoverWord(index)" @click.stop="searchWord(word)">
                {{ word }}
                <i class="icon-arrow-right"/>
              </div>
            </transition-group>
          </div>
          <p v-else class="message"
            v-text="$t('discovery.' + (searchLoading ? 'searching' : 'noSearchResult'))"/>
        </transition>
      </div>
      <div :style="searchHistoryStyle" class="search-history">
        <p class="title" v-if="recent.length">
          {{ $t('discovery.searchHistory') }}
          <span v-text="$t('discovery.clear')" @click.stop="history = []"/>
        </p>
        <transition-group tag="div" name="word" class="word-list" v-if="recent.length"
          @mouseleave.native="isHovering = false" :style="{ height: recent.length * 24 + 'px' }">
          <div v-for="(word, index) in recent" :key="word" class="word"
            @mouseenter="hoverWord(index + 10)" @click.stop="searchWord(word)">
            {{ word }}
            <i class="icon-arrow-right"/>
          </div>
        </transition-group>
      </div>
    </px-collapse>
    <draggable v-model="panels"
      :options="{ animation: 150, ghostClass: 'drag-ghost', handle: '.' + handleClass }">
      <transition-group tag="div">
        <px-panel v-for="panel in panels" :key="panel.key" :title="getTitle(panel)"
          :type="panel.type" :category="panel.category" :open.sync="panel.open"
          :handle-class="handleClass"/>
      </transition-group>
    </draggable>
  </px-card>
</template>

<style lang="scss" scoped>

.px-collapse.search {
  font-size: 16px;

  &:hover { background-color: inherit }

  .slot-header {
    cursor: default;
    padding: 16px 16px;

    i.icon-loading { color: #909399 }

    i.icon-down {
      font-size: 32px;
      transition: 0.3s ease;
      position: absolute;
      top: 8px;
      right: -2px;
      color: #c0c4cc;

      &:hover { color: #909399 }
    }
  }

  .search-result, .search-history {
    position: relative;
    transition: 0.3s all ease;

    > * { width: -webkit-fill-available }

    p {
      font-size: 18px;
      cursor: default;
      line-height: 30px;
    }
  }

  .search-result {
    > * {
      position: absolute;
      transition: 0.3s opacity ease;
    }

    .message {
      color: #909399;
      margin: 0 24px 16px;
      text-align: -webkit-center;
    }
  }

  .search-history {
    .title {
      color: #606266;
      margin: 0 16px 12px;
      padding: 0 8px 2px;
      border-bottom: 2px solid #c0c4cc;
      text-align: -webkit-left;

      span {
        color: #909399;
        float: right;
        font-size: 16px;
      }

      span:hover {
        color: #606266;
        cursor: pointer;
      }
    }
  }

  .search-result-enter,
  .search-result-leave-to {
    opacity: 0
  }

  .word-background {
    height: 24px;
    margin: 0 16px;
    padding: 0 8px;
    border-radius: 4px;
    position: absolute;
    background-color: #ebeef5;
    transition: 0.3s ease-in-out;
    width: -webkit-fill-available;
  }

  .word-list {
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
}

</style>
