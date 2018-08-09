const MIN_WIDTH = 220
const DEFAULT_WIDTH = {
  'new-card': 320,
  'illust-list': 480,
  'illust-view': 480,
}

module.exports = {
  name: 'discovery',

  props: ['height', 'width'],

  components: {
    illustList: require('./illust-list'),
    illustView: require('./illust-view'),
    newCard: require('./new-card'),
  },

  data: () => ({
    cards: [],
    dragStatus: null,
    scrollBarHeight: 0,
  }),

  provide() {
    return {
      executeMethod: (method, ...args) => {
        if (this[method] instanceof Function) this[method](...args)
      }
    }
  },

  mounted() {
    global.vm = this
    this.viewScroll = this.$neatScroll(this.$el, { vertical: false })

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

  updated() {
    this.scrollBarHeight = 12 * (this.$el.scrollWidth - this.$el.offsetWidth > 0)
  },

  methods: {
    getCard(id, resolve, reject) {
      const index = this.cards.findIndex(card => card.id === id)
      if (index >= 0) {
        resolve(this.cards[index], index, this)
      } else if (reject instanceof Function) {
        reject(this)
      }
    },
    insertCard(type = 'new-card', options = {}, index = Infinity) {
      this.cards.splice(index, 0, {
        type,
        options,
        title: '',
        loading: false,
        width: DEFAULT_WIDTH[type],
        id: Math.floor(Math.random() * 1e9),
      })
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