module.exports = {
  name: 'discovery',

  pros: ['height', 'width'],

  components: {
    illustList: require('./illust-list'),
  },

  data: () => ({
    tabs: [],
  }),

  activated() {
    if (!$pixiv.auth) {
      this.$root.switchRoute('/user/login')
      this.$message.error(this.$t('messages.loginFirst'))
    }
  },

  render: $render(__dirname)
}