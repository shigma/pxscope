<template>
  <div>200</div>
</template>

<style lang="scss" scoped>

</style>

<script>

module.exports = {
  activated() {
    if (!$pixiv.account()) {
      this.$root.switchRoute('/user/login')
      this.$message.error(this.$t('messages.loginFirst'))
    }
  }
}

</script>