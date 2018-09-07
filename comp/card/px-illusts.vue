<script>

module.exports = {
  inject: ['$card'],

  props: {
    collection: { required: true },
    showAuthor: { default: true },
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

  methods: {
    setMaskTop(value) {
      event.target.__vue__.$slots.default[0].elm.style.top = value
    },
  }
}

</script>

<template>
  <div class="px-illusts">
    <div v-for="(illust, index) in illusts" :key="index" class="illust">
      <px-image :url="illust.image_urls.square_medium" :size="180" :radius="4"
        @mouseenter.native="setMaskTop('0')" @mouseleave.native="setMaskTop('100%')"
        @click.stop.native="$card.insertCard('illust-view', { illust })">
        <transition name="mask">
          <div class="mask">
            <div><i class="icon-view"/>{{ illust.total_view }}</div>
            <div><i class="icon-bookmark"/>{{ illust.total_bookmarks }}</div>
          </div>
        </transition>
      </px-image>
      <div class="title" v-text="illust.title"
        @click.stop="$card.insertCard('illust-view', { illust })"/>
      <px-profile class="author" :user="illust.author" :exclude="illust.id" v-if="showAuthor">
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

    .mask {
      background-color: rgba(0, 0, 0, 0.5);
      border-radius: 4px;
      position: absolute;
      top: 100%;
      height: 100%;
      left: 0;
      right: 0;
      display: flex;
      transition: 0.3s ease;
      flex-direction: column;
      justify-content: center;

      div {
        font-size: 20px;
        line-height: 1em;
        font-weight: bold;
        color: #409eff;
        margin: 8px 0;

        i {
          font-size: 18px;
          padding-right: 6px;
        }
      }
    }

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
