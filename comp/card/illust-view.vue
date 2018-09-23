<script>

module.exports = {
  extends: require('./card'),

  components: {
    pxIllust: require('./px-illust.vue'),
    pxCaption: require('./px-caption.vue'),
    pxIllusts: require('./px-illusts.vue'),
  },
  
  data: () => ({
    illust: null,
  }),

  computed: {
    imageMaxHeight() {
      return this.card.height
    }
  },

  created() {
    if (this.card.data.illust) {
      this.illust = this.card.data.illust
      this.meta.title = this.illust.title
    } else {
      this.meta.loading = true
      this.meta.title = this.card.data.id
      $pixiv.search('illust', this.card.data.id, 'detail').then((result) => {
        this.meta.loading = false
        this.meta.title = result.title
        this.illust = result
      })
    }
  },
}

</script>

<template>
  <px-card :card="card" :dragged="dragged">
    <div slot="menu">
      菜单
    </div>
    <template v-if="illust">
      <px-illust v-if="illust.page_count === 1" class="image-view"
        :max-width="card.width" :max-height="imageMaxHeight" :width="illust.width" :height="illust.height"
        :large-url="illust.image_urls.large" :original-url="illust.meta_single_page.original_image_url"/>
      <div v-else class="manga-view">
        <px-illust v-for="(page, index) in illust.meta_pages" :key="index"
          :max-width="card.width" :max-height="imageMaxHeight"
          :large-url="page.image_urls.large" :original-url="illust.image_urls.original"/>
      </div>
      <px-caption :node="illust.caption"/>
      <div>view: {{ illust.total_view }}</div>
      <div>bookmark: {{ illust.total_bookmarks }}</div>
      <ul class="tags">
        <li v-for="(tag, index) in illust.tags" :key="index" v-text="'#' + tag.name"
          @click="insertCard('search-view', { type: 'word', category: 'illust', key: tag.name })"/>
      </ul>
    </template>
  </px-card>
</template>

<style lang="scss" scoped>

.manga-view {
  overflow-y: hidden;
  white-space: nowrap;
}

.tags {
  list-style: none;
  padding: 0;
  margin: 12px 0;

  li {
    display: inline;
    margin: 0 6px;
    cursor: pointer;

    &:first-child { margin-left: 0 }
  }
}
  
</style>
