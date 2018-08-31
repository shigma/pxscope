module.exports = {
  extends: require('.'),

  components: {
    pixivName: require('./pixiv-name.vue'),
  },

  data: () => ({
    collection: $pixiv.getCollection('user'),
  }),

  created() {
    const { type, category, key } = this.data
    this.getCard((card) => {
      card.title = category === 'get_users'
        ? this.$t('discovery.' + type) + this.$t('discovery.users')
        : this.$t('discovery.search') + ': ' + key
      card.loading = true
      $pixiv.search(category, key, type).then((result) => {
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