<script>

module.exports = {
  inject: ['$card'],
  props: {
    type: String,
    title: String
  },

  components: {
    pxIllust: require('./px-illust.vue'),
  },

  data: () => ({
    data: $pixiv.getCollection('illust'),
    loading: true,
  }),

  computed: {
    illusts() {
      return this.data.data.slice(0, Math.floor(this.$card.width / 135))
    },
  },

  created() {
    $pixiv.search('get_illusts', null, this.type).then((result) => {
      this.loading = false
      this.data = result
    })
  },
}

</script>

<template>
  <div class="new-card-illusts">
    <div class="title" v-text="title"/>
    <px-illust v-for="(illust, index) in illusts" :key="index"
      :illust="illust" :size="135" :show-mask="false" :radius="0"/>
  </div>
</template>

<style lang="scss" scoped>

</style>
