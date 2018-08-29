module.exports = {
  activated() {
    if (!$pixiv.account()) {
      this.$root.switchRoute('/user/login')
      this.$message.error(this.$t('messages.loginFirst'))
    }
  }
}