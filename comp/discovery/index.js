const neatScroll = require('neat-scroll')

module.exports = {
  name: 'discovery',

  props: ['height', 'width'],

  components: {
    illustList: require('./illust-list'),
    newCard: require('./new-card'),
  },

  data: () => ({
    cards: [],
  }),

  provide() {
    return {
      commit: (method, ...args) => {
        if (this[method] instanceof Function) this[method](...args)
      }
    }
  },

  mounted() {
    global.vm = this
    this.viewScroll = neatScroll(this.$el, { vertical: false })
  },

  activated() {
    if (!$pixiv.auth) {
      this.$root.switchRoute('/user/login')
      this.$message.error(this.$t('messages.loginFirst'))
    }
  },

  methods: {
    addCard(mode = 'new-card', type) {
      const newCard = {
        mode,
        width: 300,
        loading: mode !== 'new-card',
        id: Math.floor(Math.random() * 1e9),
      }
      switch (mode) {
        case 'new-card':
          newCard.title = this.$t('discovery.newPage')
          break
        case 'illust-list':
          newCard.title = this.$t('discovery.' + type) + this.$t('discovery.illusts')
          newCard.illusts = []
          $pixiv.search('get_illusts', null, type).then(result => {
            newCard.loading = false
            newCard.illusts = result
          })
      }
      this.cards.push(newCard)
    },
    removeCard(id) {
      const index = this.cards.findIndex(card => card.id === id)
      if (index >= 0) this.cards.splice(index, 1)
    },
  },

  render: $render(__dirname)
}