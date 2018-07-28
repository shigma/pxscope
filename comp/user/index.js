module.exports = {
  name: 'user',

  props: ['height', 'width'],

  data: () => ({}),

  activated() {
    if (!$pixiv.auth) this.$root.switchRoute('login')
  },

  render: $render(__dirname, 'index')
}