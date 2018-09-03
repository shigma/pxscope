<script>

module.exports = {
  props: [ 'illust', 'showAuthor' ],
  inject: [ '$card' ],

  data: () => ({
    loading: true,
    hover: false,
  }),
}

</script>

<template>
  <div>
    <div class="image"
      @click.stop="$card.insertCard('illust-view', { illust })"
      @mouseenter="hover = true" @mouseleave="hover = false">
      <img :src="illust.image_urls.square_medium" height="180" width="180" @load="loading = false"/>
      <i class="icon-spinner" v-show="loading"/>
      <transition name="mask">
        <div class="mask" v-show="hover && !loading">
          <div><i class="icon-view"/>{{ illust.total_view }}</div>
          <div><i class="icon-bookmark"/>{{ illust.total_bookmarks }}</div>
        </div>
      </transition>
    </div>
    <div class="title" v-text="illust.title"
      @click.stop="$card.insertCard('illust-view', { illust })"/>
    <div class="author" v-if="showAuthor"
      @click.stop="$card.insertCard('user-view', { user: illust.author })">
      <img :src="illust.author.user.profile_image_urls.medium" height="17" width="17"/>
      <span>{{ illust.author.user.name }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>

& {
  width: 220px;
  margin: 32px 0;
  display: inline-block;
  transition: 0.3s ease;

  .image {
    width: 180px;
    height: 180px;
    margin: 0 auto;
    display: block;
    position: relative;
    text-align: center;
    overflow: hidden;
    cursor: pointer;

    > img {
      top: 0;
      left: 0;
      user-select: none;
      border-radius: 4px;
      position: absolute;
    }

    > i.icon-spinner {
      font-size: 48px;
      color: #409eff;
      top: 50%;
      left: 0;
      width: 100%;
      margin-top: -24px;
      position: absolute;
      animation: rotating 2s linear infinite;
    }

    > .mask {
      background-color: rgba(0, 0, 0, 0.5);
      border-radius: 4px;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
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

    .mask-enter, .mask-leave-to { transform: translateY(100%) }
    .mask-enter-active, .mask-leave-active { transition: 0.3s ease }
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

    &:hover span {
      text-decoration: underline;
      font-weight: bold;
    }
  }
}
  
</style>
