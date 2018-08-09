<template>
  <div>
    <transition-group name="users" tag="div" class="users">
      <div class="user" v-for="(user, index) in collection.data" :key="index">
        <img :src="user.user.profile_image_urls.medium" height="85" width="85"/>
        <div class="account" v-text="user.user.account"/>
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
    width: 220px;
    margin: 32px 0;
    display: inline-block;
    transition: 0.3s ease;

    &:first-child { margin-top: 32px }
    &:last-child { margin-bottom: 32px }

    img {
      user-select: none;
      margin: 0 auto;
      display: inline-block;
      border-radius: 4px;
      cursor: pointer;
    }

    .account {
      font-weight: bold;
      font-size: 16px;
      padding-top: 6px;
      line-height: 1em;
      display: inline-block;
    }
  }
  
</style>
