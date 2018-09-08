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
      return this.height
    }
  },

  created() {
    if (this.data.illust) {
      this.illust = this.data.illust
      this.meta.title = this.illust.title
    } else {
      this.meta.loading = true
      this.meta.title = this.data.id
      $pixiv.search('illust', this.data.id, 'detail').then((result) => {
        this.meta.loading = false
        this.meta.title = result.title
        this.illust = result
      })
    }
  },
}

</script>

<template>
  <div>
    <px-collapse :open="showMenu" class="menu">
      菜单
    </px-collapse>
    <template v-if="illust">
      <px-illust v-if="illust.page_count === 1" class="image-view"
        :max-width="contentWidth" :max-height="imageMaxHeight"
        :large-url="illust.image_urls.large" :original-url="illust.meta_single_page.original_image_url"/>
      <div v-else class="manga-view">
        <px-illust v-for="(page, index) in illust.meta_pages" :key="index"
          :max-width="contentWidth" :max-height="imageMaxHeight"
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
  </div>
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
