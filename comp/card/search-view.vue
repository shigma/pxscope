<script>

module.exports = {
  extends: require('./card'),

  components: {
    pxGrid: require('./px-grid.vue'),
    pxUsers: require('./px-users.vue'),
    pxIllusts: require('./px-illusts.vue'),
    pxProfile: require('./px-profile.vue'),
  },

  data: () => ({
    user: null,
    illust: null,
    users: $pixiv.getCollection('user'),
    illusts: $pixiv.getCollection('illust'),
  }),

  created() {
    const { type, category, key, users, illusts } = this.data

    this.meta.loading = true
    this.meta.title = category === 'general' || type === 'word'
      ? this.$t('discovery.search') + ': ' + key
      : this.$t('discovery.type.' + type) + this.$t('discovery.category.' + category)

    if (users) {
      this.users = users
      this.meta.loading = false
    }

    if (illusts) {
      this.illusts = illusts
      this.meta.loading = false
    }

    if (category === 'general') {
      // Search for user and illust id
      if (/^[1-9]\d{1,7}$/.test(key)) {
        $pixiv.search('user', key).then(result => this.user = result).catch()
        $pixiv.search('illust', key).then(result => this.illust = result).catch()
      }
      $pixiv.search('word', key, 'user').then((result) => {
        this.meta.loading = false
        this.users = result
      })
      $pixiv.search('word', key, 'illust').then((result) => {
        this.meta.loading = false
        this.illusts = result
      })
    } else if (this.meta.loading) {
      $pixiv.search(...(type === 'word'
        ? [ 'word', key, category ]
        : [ `get_${category}s`, key, type ]
      )).then((result) => {
        this.meta.loading = false
        this[category + 's'] = result
        if (category === 'user') result.data.forEach(item => item.detail())
      }).catch((error) => {
        console.error(error)
      })
    }
  },

  mounted() {
    global.illusts = this.illusts.data
  }
}

</script>

<template>
  <div>
    <px-collapse v-if="user" initial="open">
      <div slot="header">id 为 {{ data.key }} 的用户：</div>
      <div class="user">
        <img :src="user.user.profile_image_urls.medium" height="45" width="45"/>
        <div class="intro" :style="{ width: '200px' }">
          <div class="name">
            {{ user.user.name }}
            <span class="id" v-text="user.user.id"/>
          </div>
          <div class="comment" v-text="user.user.comment"/>
        </div>
      </div>
    </px-collapse>
    <px-collapse v-if="illust" initial="open">
      <div slot="header">id 为 {{ data.key }} 的作品：</div>
      <px-caption :node="illust.caption"/>
      <div>view: {{ illust.total_view }}</div>
      <div>bookmark: {{ illust.total_bookmarks }}</div>
      <ul class="tags">
        <li v-for="(tag, index) in illust.tags" :key="index" v-text="'#' + tag.name"
          @click="insertCard('search-view', { type: 'word', category: 'illust', key: tag.name })"/>
      </ul>
    </px-collapse>
    <px-collapse v-if="users.hasData" initial="open">
      <div slot="header" v-text="'Users'"/>
      <px-users :collection="users" v-if="users.data.length"/>
      <p v-else class="message" v-text="$t('discovery.noSearchResult')"/>
    </px-collapse>
    <px-collapse v-if="illusts.hasData" initial="open">
      <div slot="header" v-text="'Illusts'"/>
      <px-illusts :collection="illusts" v-if="illusts.data.length"/>
      <p v-else class="message" v-text="$t('discovery.noSearchResult')"/>
    </px-collapse>
  </div>
</template>

<style lang="scss" scoped>

.message {
  font-size: 18px;
  color: #909399;
  cursor: default;
  line-height: 30px;
  margin: 0 24px 16px;
  text-align: -webkit-center;
}

.px-users, .px-illusts {
  margin: 12px 0;
}

</style>
