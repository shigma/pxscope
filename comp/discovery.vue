<script>

const { randomID } = require('./utils/utils')

const MIN_WIDTH = 240
const DEFAULT_WIDTH = 480

module.exports = {
  props: ['height', 'width'],

  components: {
    draggable: require('vuedraggable'),
    newCard: require('./card/new-card.vue'),
    userView: require('./card/user-view.vue'),
    illustView: require('./card/illust-view.vue'),
    searchView: require('./card/search-view.vue'),
  },

  data: () => ({
    cards: [],
    draggingCard: false,
    draggingBorder: null,
    cardHeight: 0,
  }),

  watch: {
    height() {
      this.updateCardHeight()
    }
  },

  created() {
    this.handleClass = 'handler-' + randomID()
  },

  mounted() {
    this.updateCardHeight()
    this.viewScroll = this.$neatScroll(this.$el, { vertical: false })

    addEventListener('resize', () => {
      this.updateCardHeight()
    })

    addEventListener('mouseup', () => {
      this.draggingBorder = null
    }, { passive: true })

    addEventListener('mousemove', (event) => {
      if (this.draggingBorder) {
        this.getCard(this.draggingBorder.id, card => {
          // Drag card border.
          event.stopPropagation()
          card.width += event.clientX - this.draggingBorder.deltaX
          this.draggingBorder.deltaX = event.clientX
          // Set minimal card width.
          if (card.width < MIN_WIDTH) {
            this.draggingBorder.deltaX += MIN_WIDTH - card.width
            card.width = MIN_WIDTH
          }
        })
      }
    })
  },

  activated() {
    if (!$pixiv.account()) {
      this.$root.switchRoute('user')
      this.$message.error(this.$t('messages.loginFirst'))
    }
  },

  updated() {
    this.updateCardHeight()
  },

  methods: {
    updateCardHeight() {
      this.cardHeight = this.height - 12 * (this.$el.scrollWidth - this.$el.offsetWidth > 0) - 40
    },
    getCard(id, resolve, reject) {
      const index = this.cards.findIndex(card => card.id === id)
      if (index >= 0) {
        resolve && resolve(this.cards[index], index, this)
      } else {
        reject && reject(this)
      }
      return this.cards[index]
    },
    insertCard(type = 'new-card', data = {}, index = Infinity) {
      if (type === 'new-card') {
        // Prevent duplicate new cards
        const card = this.cards.find(card => card.type === 'new-card')
        if (card) {
          this.navigateTo(card)
          return
        }
      }
      this.cards.splice(index, 0, {
        type,
        data,
        title: '',
        menu: false,
        loading: false,
        maximized: false,
        width: DEFAULT_WIDTH,
        id: Math.floor(Math.random() * 1e9),
      })
    },
    removeCard(id) {
      this.getCard(id, (card, index) => this.cards.splice(index, 1))
    },
    maximizeCard(id) {
      this.getCard(id, card => card.maximized = true)
    },
    toggleMenu(id) {
      this.getCard(id, card => card.vm.showMenu = !card.vm.showMenu)
    },
    navigateTo() {},
    hideContextMenus() {},
    startDrag(id, deltaX) {
      this.hideContextMenus()
      this.draggingBorder = { id, deltaX }
    },

    // Tranision Hooks
    beforeTransition(el) {
      el.style.left = el.offsetLeft - this.$refs.cards.$el.scrollLeft + 'px'
      el.style.position = 'absolute'
    },
    afterTransition(el) {
      el.style.left = null
      el.style.position = 'relative'
    },
  }
}

</script>

<template>
  <div @mousewheel.prevent.stop="viewScroll.scrollByDelta($event.deltaY)">
    <transition name="logo">
      <div v-if="!cards.length" class="empty">
        <i class="icon-discovery" @click.stop="insertCard()"/>
      </div>
    </transition>
    <draggable :list="cards" @start="draggingCard = true" @end="draggingCard = false"
      :options="{ animation: 150, ghostClass: 'drag-ghost', handle: '.' + handleClass }">
      <transition-group class="cards" tag="div" name="card" ref="cards"
        :move-class="draggingCard ? 'no-transition' : ''" @beforeLeave="beforeTransition"
        @beforeEnter="beforeTransition" @afterEnter="afterTransition">
        <div v-for="card in cards" :key="card.id" :style="{ width: card.width + 'px' }"
          :class="['card', { 'no-transition': draggingBorder }]">
          <div class="header" :class="handleClass"
            @mousedown.middle.stop="removeCard(card.id)"
            @dblclick.prevent.stop="maximizeCard(card.id)">
            <i class="icon-menu" @click.stop="toggleMenu(card.id)"/>
            <i class="icon-close" @click.stop="removeCard(card.id)"/>
            <div v-text="card.title"/>
          </div>
          <component :is="card.type" class="content" :class="card.type"
            :width="card.width" :height="cardHeight" :id="card.id"
            :data="card.data" :style="{ height: cardHeight + 'px' }"/>
          <div class="border" @mousedown.prevent.stop="startDrag(card.id, $event.clientX)"/>
          <px-loading v-show="card.loading"/>
        </div>
      </transition-group>
    </draggable>
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
  background-color: #fbfcfe;

  ::-webkit-scrollbar { width: 6px }
  ::-webkit-scrollbar-thumb { border-radius: 2px }

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
    background-color: #e5e5e5;

    &:hover { background-color: #c0c4cc }
  }

  &:last-child > .border { display: none }
}

.card-enter { opacity: 0; transform: translateX(-100%) }
.card-leave-to { opacity: 0; transform: translateY(-100%) }
.card-enter-active, .card-leave-active { transition: 0.5s ease }

</style>

