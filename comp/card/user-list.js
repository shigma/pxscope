module.exports = {
  extends: require('.'),

  components: {
    pixivName: require('./pixiv-name.vue'),
  },

  data: () => ({
    collection: $pixiv.getCollection('user'),
  }),

  created() {
    const type = this.data.type
    this.getCard((card) => {
      card.title = this.$t('discovery.' + type) + this.$t('discovery.users')
      card.loading = true
      $pixiv.search('get_users', null, type).then((result) => {
        card.loading = false
        this.collection = result
        result.data.forEach(item => item.detail())
      })
    })
  },

  methods: {
    renderName(name) {
      return name.replace(/@.+$/, str => `<span class="grey">${str}<span>`)
    },
  }
}