<template>
  <div><template v-if="user">
    <px-caption :node="user.user.comment"/>
    <px-illusts :collection="user._illusts" :show-author="false"/>
  </template></div>
</template>

<style lang="scss" scoped>
  
</style>

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
    this.getCard((card) => {
      if (this.data.id) {
        card.loading = true
        $pixiv.search('user', this.data.id, 'detail').then(result => this.onDetail(card, result))
      } else {
        this.user = this.data.user
        this.user.detail().then(result => this.onDetail(card, result))
      }
    })
  },

  methods: {
    onDetail(card, result) {
      card.loading = false
      card.title = result.user.name
      this.user = result
      this.user.illusts()
    },
    renderCaption(text) {
      return text.replace(/https?:\S+/g, str => `<a herf="${str}">${str}</a>`)
    },
  }
}

</script>