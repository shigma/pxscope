module.exports = {
  name: 'discovery',

  activated() {
    if (!$pixiv.auth) {
      this.$root.switchRoute('/user/login')
      this.$message.error(this.$t('messages.loginFirst'))
    }
  },

  render: $render(__dirname, 'index')
}