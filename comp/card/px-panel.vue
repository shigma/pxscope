<script>

module.exports = {
  inject: ['$card'],
  
  props: {
    open: Boolean,
    type: String,
    category: String,
    handleClass: String,
  },

  components: {
    pxImage: require('./px-image.vue'),
  },

  data: () => ({
    data: null,
    state: 'loading',
  }),

  computed: {
    images() {
      if (!this.data) return []
      return this.category === 'user'
        ? this.data.data.slice(0, Math.floor((this.$card.width - 24) / 80) * 2)
        : this.data.data.slice(0, Math.floor((this.$card.width - 24) / 147) * 2)
    },
    title() {
      return this.$t('discovery.type.' + this.type)
        + this.$t('discovery.category.' + this.category)
    },
  },

  created() {
    $pixiv.search(`get_${this.category}s`, null, this.type).then((result) => {
      this.state = 'loaded'
      this.data = result
    }).catch((error) => {
      this.state = 'failed'
      console.error(error)
    })
  },

  methods: {
    onClickArrow() {
      this.$card.insertCard('search-view', {
        type: this.type,
        category: this.category,
        [this.category + 's']: this.data,
      })
    },
    onClickHeader(event) {
      if (event.target.classList.contains('icon-handle')) return
      this.$emit('update:open', !this.open)
      this.$emit('update')
      return true
    },
  }
}

</script>

<template>
  <px-collapse class="px-panel" :open="open" @toggle="onClickHeader"
    @after-update="$emit('after-update', $event)">
    <i slot="header" class="icon-handle" :class="handleClass"/>
    <span slot="header" v-text="title"/>
    <i slot="header" class="icon-loading" v-if="!open && state === 'loading'"/>
    <i slot="header" class="icon-arrow-right" @click.stop="onClickArrow"/>
    <div class="message" v-if="state === 'loading'" v-text="$t('discovery.isLoading')"/>
    <div class="message" v-else-if="state === 'failed'" v-text="$t('discovery.loadingFailed')"/>
    <div class="images illusts" v-else-if="category === 'illust'">
      <px-image v-for="(illust, index) in images" :key="index"
        :url="illust.image_urls.square_medium" :size="135" :radius="4"
        @click.stop.native="$card.insertCard('illust-view', { illust })"/>
    </div>
    <div class="images users" v-else>
      <px-image v-for="(user, index) in images" :key="index"
        :url="user.user.profile_image_urls.medium" :size="68" :radius="68"
        @click.stop.native="$card.insertCard('user-view', { user })"/>
    </div>
  </px-collapse>
</template>

<style lang="scss" scoped>

&.px-collapse > .slot-header {
  padding: 8px 8px;

  i { color: #606266 }

  i.icon-loading {
    margin-left: 12px;
    line-height: 1.5em;
    position: absolute;
  }

  i.icon-handle {
    font-size: 24px;
    margin-right: 4px;
    vertical-align: sub;
    cursor: -webkit-grab;
  }

  i.icon-arrow-right {
    float: right;
    line-height: 1.5em;
    margin-right: 4px;
    color: #909399;

    &:hover { color: #606266 }
  }
}

.images {
  line-height: 0;
  margin: 0 12px 8px;
  text-align: -webkit-center;

  .px-image { margin: 0 6px 12px }
}

.message {
  text-align: -webkit-center;
  padding: 0px 24px 8px;
  font-size: 18px;
  color: #909399;
  line-height: 30px;
}

</style>
