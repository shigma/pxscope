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
