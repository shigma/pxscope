<template>
  <div>
    <transition-group name="illusts" tag="div" class="illusts">
      <div class="illust" v-for="(illust, index) in collection.data" :key="index">
        <img :src="illust.image_urls.square_medium" height="180" width="180"
          @click.stop="insertCard('illust-view', { illust })"/>
        <div class="title" v-text="illust.title"/>
        <div class="author">
          {{ illust.user.name }}
        </div>
      </div>
    </transition-group>
  </div>
</template>

<style lang="scss" scoped>

  .illusts {
    text-align: -webkit-center;
  }

  .illusts-move { transition: 0.3s ease }

  .illust {
    width: 220px;
    margin: 32px 0;
    display: inline-block;
    transition: 0.3s ease;

    &:first-child { margin-top: 32px }
    &:last-child { margin-bottom: 32px }

    img {
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
    }

    .author {
      font-size: 14px;
      line-height: 1em;
      padding-top: 4px;
    }
  }
  
</style>
