module.exports = {
  components: {
    pixivCaption: require('../pixiv-caption'),
  },
  mixins: [require('../card')],

  data: () => ({}),

  created() {
    this.illust = this.options.illust
    this.getCard(card => {
      card.title = this.illust.title
    })
    console.log(this.illust)
  },

  render: $render(__dirname)
}