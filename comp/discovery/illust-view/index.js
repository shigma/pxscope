module.exports = {
  components: {
    pixivCaption: require('../pixiv-caption'),
    pixivImage: require('../pixiv-image'),
  },

  mixins: [
    require('../card')
  ],

  data: () => ({
    illust: null,
    imageMaxWidth: 0,
  }),

  computed: {
    imageMaxHeight() {
      return this.height
    }
  },

  created() {
    if (this.options.illust) {
      this.illust = this.options.illust
      this.getCard(card => card.title = this.options.illust.title)
    } else {
      this.getCard(card => {
        card.title = this.options.id
        card.loading = true
        $pixiv.search('illust', this.options.id, 'detail').then((result) => {
          card.loading = false
          card.title = result.title
          this.illust = result
        })
      })
    }
  },

  mounted() {
    this.setWidth()
  },

  updated() {
    this.setWidth()
  },

  methods: {
    setWidth() {
      this.$nextTick(() => {
        this.imageMaxWidth = this.width - 6 * (this.$el.scrollHeight - this.$el.offsetHeight > 0)
      })
    },
  },

  render: $render(__dirname)
}