const neatScroll = require('neat-scroll')

module.exports = {
  name: 'discovery',

  pros: ['height', 'width'],

  components: {
    illustList: require('./illust-list'),
    newCard: require('./new-card'),
  },

  data: () => ({
    cards: [],
  }),

  mounted() {
    this.viewScroll = neatScroll(this.$el, { vertical: false })
  },

  activated() {
    if (!$pixiv.auth) {
      this.$root.switchRoute('/user/login')
      this.$message.error(this.$t('messages.loginFirst'))
    }
  },

  methods: {
    addCard(type = 'new-card') {
      const id = Math.floor(Math.random() * 1e9)
      const title = this.$t('discovery.newPage')
      this.cards.push({ type, id, title, width: 300 })
    },
  },

  render: $render(__dirname)
}