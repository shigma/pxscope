<script>

module.exports = {
  inject: ['$card'],

  props: {
    collection: { required: true },
  },

  components: {
    pxGrid: require('./px-grid.vue'),
    pxImage: require('./px-image.vue'),
    pxProfile: require('./px-profile.vue'),
  },
}

</script>

<template>
  <px-grid class="px-users" :length="collection.data.length"
    :size-x="200" :size-y="85" :margin-x="24" :margin-y="24">
    <div class="user" v-for="user in collection.data" :key="user.user.id"
      @click.stop="insertCard('user-view', { user })">
      <px-profile :user="user">
        <px-image :url="user.user.profile_image_urls.medium" size="85" radius="85"/>
      </px-profile>
      <div class="info">
        <div class="name" v-text="user.user.name"/>
        <div class="id" v-text="user.user.id"/>
      </div>
    </div>
  </px-grid>
</template>

<style lang="scss" scoped>

.user {
  width: 200px;
  height: 85px;
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
