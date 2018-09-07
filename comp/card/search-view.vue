<script>

module.exports = {
  extends: require('./card'),

  components: {
    pxIllusts: require('./px-illusts.vue'),
    pxProfile: require('./px-profile.vue'),
  },

  data: () => ({
    users: $pixiv.getCollection('user'),
    illusts: $pixiv.getCollection('illust'),
  }),

  created() {
    const { type, category, key, users, illusts } = this.data
    this.category = category

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
      // do something
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
}

</script>

<template>
  <div>
    <transition-group name="collection" tag="div" class="users" v-if="category === 'user'">
      <div class="user" v-for="(user, index) in users.data" :key="index"
        @click.stop="insertCard('user-view', { user })">
        <px-profile :user="user">
          <img :src="user.user.profile_image_urls.medium" height="85" width="85"/>
          <div class="info">
            <div class="name" v-text="user.user.name"/>
            <div class="id" v-text="user.user.id"/>
          </div>
        </px-profile>
      </div>
    </transition-group>
    <px-illusts :collection="illusts" v-else-if="category === 'illust'"/>
  </div>
</template>

<style lang="scss" scoped>

.users, .illusts {
  text-align: -webkit-center;
}

.collection-enter,
.collection-leave-to {
  opacity: 0;
}

.collection-enter-active,
.collection-leave-active,
.collection-move {
  position: absolute;
}

.user {
  width: 200px;
  min-height: 85px;
  margin: 12px 12px;
  position: relative;
  display: inline-block;
  transition: 0.3s ease;
  text-align: -webkit-left;

  img {
    user-select: none;
    margin: 0 auto;
    border-radius: 85px;
    cursor: pointer;
    position: absolute;
  }

  .info {
    padding-left: 12px;
    position: absolute;
    left: 85px;
    top: 50%;
    cursor: pointer;
    transform: translateY(-50%);

    .name {
      font-weight: bold;
      font-size: 16px;
      line-height: 18px;
    }

    .account, .id {
      font-size: 14px;
      line-height: 16px;
    }

    :not(:last-child) {
      padding-bottom: 2px;
    }
  }
}
  
</style>
