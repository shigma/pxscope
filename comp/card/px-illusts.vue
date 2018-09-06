<script>

module.exports = {
  props: {
    collection: { required: true },
    showAuthor: { default: true },
    showMask: { default: true },
    maxCount: { default: Infinity },
    exclude: { default: null },
  },

  components: {
    pxImage: require('./px-image.vue'),
    pxProfile: require('./px-profile.vue'),
  },
  
  computed: {
    illusts() {
      return this.collection.data
        .filter(illust => illust.id !== this.exclude)
        .slice(0, this.maxCount)
    }
  },
}

</script>

<template>
  <div class="px-illusts">
    <div v-for="(illust, index) in illusts" :key="index" class="illust">
      <px-image :illust="illust" :show-mask="true" :size="180" :radius="4"/>
      <div class="title" v-text="illust.title"
        @click.stop="$card.insertCard('illust-view', { illust })"/>
      <px-profile class="author" :user="illust.author" :exclude="illust.id">
        <img :src="illust.author.user.profile_image_urls.medium" height="17" width="17"/>
        <span>{{ illust.author.user.name }}</span>
      </px-profile>
    </div>
  </div>
</template>

<style lang="scss" scoped>

& {
  text-align: -webkit-center;

  .illust {
    width: 220px;
    margin: 32px 0;
    display: inline-block;
    transition: 0.3s ease;

    .title {
      font-weight: bold;
      font-size: 16px;
      padding-top: 6px;
      line-height: 1em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
    }

    .author {
      font-size: 14px;
      line-height: 22px;
      padding-top: 4px;
      cursor: pointer;

      img {
        border-radius: 17px;
        vertical-align: -2px;
        padding-right: 2px;
      }

      &:hover span {
        text-decoration: underline;
        font-weight: bold;
      }
    }
  }
}

</style>
