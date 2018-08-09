module.exports = {
  components: {
    pixivCaption: require('../pixiv-caption'),
    pixivImage: require('../pixiv-image'),
  },

  mixins: [
    require('../card')
  ],

  data: () => ({
    imageMaxWidth: 0,
  }),

  computed: {
    imageMaxHeight() {
      return this.height
    }
  },

  created() {
    this.illust = this.options.illust
    this.getCard(card => {
      card.title = this.illust.title
    })
    console.log(this.illust)
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
    }
  },

  render: $render(__dirname)
}