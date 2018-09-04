<script>

module.exports = {
  extends: require('./card'),

  data: () => ({
    collection: $pixiv.getCollection('user'),
  }),

  created() {
    const { type, category, key } = this.data
    this.getCard((card) => {
      card.title = category === 'get_users'
        ? this.$t('discovery.' + type) + this.$t('discovery.users')
        : this.$t('discovery.search') + ': ' + key
      card.loading = true
      $pixiv.search(category, key, type).then((result) => {
        card.loading = false
        this.collection = result
        result.data.forEach(item => item.detail())
      })
    })
  },

  methods: {
    renderName(name) {
      return name.replace(/@.+$/, str => `<span class="grey">${str}<span>`)
    },
  }
}

</script>

<template>
  <div>
    <transition-group name="users" tag="div" class="users">
      <div class="user" v-for="(user, index) in collection.data" :key="index"
        @click.stop="insertCard('user-view', { user })">
        <img :src="user.user.profile_image_urls.medium" height="85" width="85"/>
        <div class="info">
          <div class="name" v-text="user.user.name"/>
          <div class="account" v-text="user.user.account"/>
          <div class="id" v-text="user.user.id"/>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<style lang="scss" scoped>

.users {
  text-align: -webkit-center;
}

.users-move { transition: 0.3s ease }

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
