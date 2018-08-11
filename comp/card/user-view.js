module.exports = {
  components: {
    pixivCaption: require('./pixiv-caption.vue'),
    pixivIllusts: require('./pixiv-illusts.vue'),
    pixivName: require('./pixiv-name.vue'),
  },

  mixins: [
    require('./card')
  ],

  data: () => ({
    user: null,
  }),

  created() {
    this.getCard((card) => {
      if (this.data.id) {
        card.loading = true
        $pixiv.search('user', this.data.id, 'detail').then(result => this.onDetail(card, result))
      } else {
        this.user = this.data.user
        this.user.detail().then(result => this.onDetail(card, result))
      }
    })
  },

  methods: {
    onDetail(card, result) {
      card.loading = false
      card.title = result.user.name
      this.user = result
      this.user.illusts()
    },
  }
}