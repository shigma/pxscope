<script>

module.exports = {
  inject: ['$card'],
  props: {
    user: { required: true },
    exclude: { default: null },
  },

  components: {
    pxIllust: require('./px-illust.vue'),
  },

  data: () => ({
    state: 'loading',
  }),

  computed: {
    illusts() {
      return this.user._illusts.data
        .filter(illust => illust.id !== this.exclude)
        .slice(0, 3)
    }
  },

  created() {
    Promise.all([this.user.illusts(), this.user.detail()])
      .then(() => this.state = 'loaded')
      .catch(() => this.state = 'failed')
  },
}

</script>

<template>
  <px-popper ref="popper" tag="div" :padding="0">
    <div v-if="state === 'loaded'" class="profile">
      <px-illust v-for="(illust, index) in illusts" :key="index"
        :illust="illust" :size="135" :show-mask="false" :radius="0"/>
      <div class="user">
        <img :src="user.user.profile_image_urls.medium" height="45" width="45"/>
        <div class="intro">
          <div class="name">
            {{ user.user.name }}
            <span class="id" v-text="user.user.id"/>
          </div>
          <div class="comment" v-text="user.user.comment"/>
        </div>
        <button>
          <div v-if="user.user.is_followed" v-text="$t('discovery.button.unfollow')"/>
          <div v-else v-text="$t('discovery.button.follow')"/>
        </button>
      </div>
    </div>
    <div v-else-if="state === 'loading'" class="message" v-text="$t('discovery.isLoading')"/>
    <div v-else class="message" v-text="$t('discovery.loadingFailed')"/>
    <div slot="reference" @click.stop="$card.insertCard('user-view', { user })">
      <slot/>
    </div>
  </px-popper>
</template>

<style lang="scss" ref-slot="popper">

& {
  border: none;
  box-shadow: 0px 0px 6px 2px rgba(0, 0, 0, 0.4);
}

.profile {
  width: 405px;
  height: 200px;
  border-radius: 4px;
  overflow: hidden;

  .user {
    top: 135px;
    bottom: 0;
    position: absolute;
    display: inline-flex;

    img {
      display: inline-block;
      border-radius: 45px;
      margin: 11px 12px;
    }

    .intro {
      display: inline-block;
      width: 240px;

      .name, .comment {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 1em;
      }

      .name {
        font-size: 16px;
        padding: 13px 2px 5px 4px;
        font-weight: bold;

        .id {
          font-weight: normal;
          font-size: 14px;
          line-height: 1em;
          padding-left: 4px;
        }
      }

      .comment {
        font-size: 13px;
        padding: 4px 2px 13px 4px;
      }
    }

    button {
      display: inline-block;
      margin: 16px 12px;
      border-radius: 6px;
      padding: 6px;

      div {
        width: 60px;
        font-size: 14px;
        line-height: 1em;
      }
    }
  }
}

.message {
  width: 240px;
  text-align: -webkit-center;
  font-size: 16px;
  padding: 12px;
}

</style>
