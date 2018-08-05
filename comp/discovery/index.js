const neatScroll = require('neat-scroll')

const MIN_WIDTH = 200

module.exports = {
  name: 'discovery',

  props: ['height', 'width'],

  components: {
    illustList: require('./illust-list'),
    newCard: require('./new-card'),
  },

  data: () => ({
    cards: [],
    dragStatus: null,
  }),

  provide() {
    const _this = this
    return {
      getCard(callback) {
        _this.getCard(this.id, callback)
      },
      commit(method, ...args) {
        if (_this[method] instanceof Function) _this[method](...args)
      },
    }
  },

  mounted() {
    global.vm = this
    this.viewScroll = neatScroll(this.$el, { vertical: false })

    addEventListener('mouseup', () => {
      this.dragStatus = null
    }, { passive: true })

    addEventListener('mousemove', (event) => {
      if (this.dragStatus) {
        this.getCard(this.dragStatus.id, card => {
          // Drag card border.
          event.stopPropagation()
          card.width += event.clientX - this.dragStatus.deltaX
          this.dragStatus.deltaX = event.clientX
          // Set minimal card width.
          if (card.width < MIN_WIDTH) {
            this.dragStatus.deltaX += MIN_WIDTH - card.width
            card.width = MIN_WIDTH
          }
        })
      }
    })
  },

  activated() {
    if (!$pixiv.auth) {
      this.$root.switchRoute('/user/login')
      this.$message.error(this.$t('messages.loginFirst'))
    }
  },

  methods: {
    addCard(type = 'new-card', options = {}) {
      this.cards.push({
        type,
        options,
        title: '',
        width: 320,
        loading: false,
        id: Math.floor(Math.random() * 1e9),
      })
    },
    getCard(id, callback) {
      const index = this.cards.findIndex(card => card.id === id)
      if (callback && index >= 0) callback(this.cards[index], index)
      return index
    },
    removeCard(id) {
      this.getCard(id, (_, index) => this.cards.splice(index, 1))
    },
    hideContextMenus() {},
    startDrag(id, deltaX) {
      this.hideContextMenus()
      this.dragStatus = { id, deltaX }
    },
  },

  render: $render(__dirname)
}