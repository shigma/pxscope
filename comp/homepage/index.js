module.exports = {
  name: 'homepage',

  activated() {
    if (!$pixiv.auth) this.$root.switchRoute('/user/login')
  },

  render: $render(__dirname, 'index')
}