module.exports = {
  name: 'user',

  props: ['height', 'width'],

  data: () => ({}),

  beforeCreate() {
    if (!$pixiv.auth) {
      this.$root.switchRoute('login')
    }
  },

  render: $render(__dirname, 'index')
}