<script>

module.exports = {
  inject: ['$card'],
  props: {
    type: String,
    title: String
  },

  components: {
    pxImage: require('./px-image.vue'),
  },

  data: () => ({
    data: null,
    loaded: false,
  }),

  computed: {
    illusts() {
      return this.data
        ? this.data.data.slice(0, Math.floor(this.$card.width / 135))
        : []
    },
  },

  created() {
    $pixiv.search('get_illusts', null, this.type).then((result) => {
      this.loaded = true
      this.data = result
    })
  },

  methods: {
    insert() {
      this.$card.insertCard('illust-list', {
        type: this.type,
        data: this.data,
        category: 'get_illusts',
      })
    },
  }
}

</script>

<template>
  <px-collapse class="px-panel">
    <div slot="header" ref="header">
      <i class="icon-handle"/>
      <span class="title" v-text="title"/>
      <i class="icon-arrow-right" @click.stop.prevent="insert"/>
    </div>
    <div class="images">
      <span v-if="!loaded">Loading</span>
      <px-image v-else v-for="(illust, index) in illusts" :key="index"
        :illust="illust" :size="135" :show-mask="false" :radius="4"/>
    </div>
  </px-collapse>
</template>

<style lang="scss" ref="header">

& {
  color: #24292e;
  padding: 8px;
  font-size: 20px;
  transition: 0.3s ease;
  line-height: 1.5em;

  i { color: #606266 }

  i.icon-handle {
    font-size: 24px;
    margin-right: 8px;
    vertical-align: sub;
  }

  .title { font-weight: bold }

  i.icon-arrow-right {
    float: right;
    line-height: 1.5em;
    margin-right: 4px;
    color: #909399;
    &:hover { color: #606266 }
  }
}

</style>

<style lang="scss" scoped>

.images {
  text-align: -webkit-center;

  .px-image {
    margin: 0 8px;
  }
}

</style>
