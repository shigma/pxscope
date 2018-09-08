<script>

module.exports = {
  extends: require('./card'),

  components: {
    pxCaption: require('./px-caption.vue'),
    pxIllusts: require('./px-illusts.vue'),
  },

  data: () => ({
    user: null,
  }),

  created() {
    if (this.data.id) {
      this.meta.loading = true
      $pixiv.search('user', this.data.id, 'detail').then(this.onDetail)
    } else {
      this.user = this.data.user
      this.user.detail().then(this.onDetail)
    }
  },

  methods: {
    onDetail(result) {
      this.meta.loading = false
      this.meta.title = result.user.name
      this.user = result
      this.user.illusts()
    },
  }
}

</script>

<template>
  <div>
    <px-collapse :open="showMenu" class="menu">
      菜单
    </px-collapse>
    <template v-if="user">
      <px-caption :node="user.user.comment"/>
      <px-illusts :collection="user._illusts" :show-author="false"/>
    </template>
  </div>
</template>

<style lang="scss" scoped>
  
</style>
