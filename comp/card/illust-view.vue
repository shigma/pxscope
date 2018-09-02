<template>
  <div><template v-if="illust">
    <pixiv-image v-if="illust.page_count === 1" class="image-view"
      :max-width="imageMaxWidth" :max-height="imageMaxHeight"
      :large-url="illust.image_urls.large" :original-url="illust.meta_single_page.original_image_url"/>
    <div v-else class="manga-view">
      <pixiv-image v-for="(page, index) in illust.meta_pages" :key="index"
        :max-width="imageMaxWidth" :max-height="imageMaxHeight"
        :large-url="page.image_urls.large" :original-url="illust.image_urls.original"/>
    </div>
    <pixiv-caption :node="illust.caption"/>
    <div>view: {{illust.total_view}}</div>
    <div>bookmark: {{illust.total_bookmarks}}</div>
    <ul class="tags">
      <li v-for="(tag, index) in illust.tags" :key="index" v-text="'#' + tag.name"
        @click="insertCard('illust-list', { type: 'illust', category: 'word', key: tag.name })"/>
    </ul>
  </template></div>
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

<script>

module.exports = {
  extends: require('./card'),

  components: {
    pixivCaption: require('./pixiv-caption.vue'),
    pixivImage: require('./pixiv-image.vue'),
  },
  
  data: () => ({
    illust: null,
    imageMaxWidth: 0,
  }),

  computed: {
    imageMaxHeight() {
      return this.height
    }
  },

  created() {
    if (this.data.illust) {
      this.illust = this.data.illust
      this.getCard(card => card.title = this.illust.title)
    } else {
      this.getCard(card => {
        card.title = this.data.id
        card.loading = true
        $pixiv.search('illust', this.data.id, 'detail').then((result) => {
          card.loading = false
          card.title = result.title
          this.illust = result
        })
      })
    }
  },

  mounted() {
    this.setWidth()
  },

  updated() {
    this.setWidth()
  },

  methods: {
    setWidth() {
      this.$nextTick(() => {
        this.imageMaxWidth = this.width - 6 * (this.$el.scrollHeight - this.$el.offsetHeight > 0)
      })
    },
  }
}

</script>