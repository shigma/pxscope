<template>
  <transition-group name="illusts" tag="div" class="illusts">
    <div class="illust" v-for="(illust, index) in collection.data" :key="index">
      <img :src="illust.image_urls.square_medium" height="180" width="180"
        @click.stop="$card.insertCard('illust-view', { illust })"/>
      <div class="title" v-text="illust.title"
        @click.stop="$card.insertCard('illust-view', { illust })"/>
      <div class="author" v-if="showAuthor"
        @click.stop="$card.insertCard('user-view', { user: illust.author })">
        <img :src="illust.author.user.profile_image_urls.medium" height="17" width="17"/>
        {{ illust.author.user.name }}
      </div>
    </div>
  </transition-group>
</template>

<style lang="scss" scoped>

  & {
    text-align: -webkit-center;
  }

  .illusts-move { transition: 0.3s ease }

  .illust {
    width: 220px;
    margin: 32px 0;
    display: inline-block;
    transition: 0.3s ease;

    > img {
      user-select: none;
      margin: 0 auto;
      display: block;
      border-radius: 4px;
      cursor: pointer;
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

      > img {
        border-radius: 17px;
        vertical-align: -2px;
        padding-right: 2px;
      }
    }
  }
  
</style>
