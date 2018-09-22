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
    if (this.card.data.id) {
      this.meta.loading = true
      $pixiv.search('user', this.card.data.id, 'detail').then(this.onDetail)
    } else {
      this.user = this.card.data.user
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
  <px-card :card="card" :dragged="dragged">
    <px-collapse :open="showMenu" class="menu">
      菜单
    </px-collapse>
    <template v-if="user">
      <px-caption :node="user.user.comment"/>
      <px-illusts :collection="user._illusts" :show-author="false"/>
    </template>
  </px-card>
</template>

<style lang="scss" scoped>
  
</style>
