<script>

module.exports = {
  inject: ['$card'],
  props: {
    user: { required: true },
    exclude: { default: null },
  },

  data: () => ({
    userLoaded: false,
  }),

  computed: {
    illusts() {
      return this.user._illusts.data
        .filter(illust => illust.id !== this.exclude)
        .slice(0, 2)
    }
  },

  created() {
    this.user.illusts().then(() => this.userLoaded = true)
  },
}

</script>

<template>
  <px-popover trigger="hover" :width="270" ref="popper">
    <div v-if="userLoaded" class="illusts">
      <div class="image" v-for="(illust, index) in illusts" :key="index"
        @click.stop="$card.insertCard('illust-view', { illust })">
        <img :src="illust.image_urls.square_medium" height="135" width="135"
          @load="illust.loaded = true"/>
        <i class="icon-spinner" v-show="!illust.loaded"/>
      </div>
    </div>
    <div v-else v-text="$t('discovery.loading') + ' ...'"/>
    <div slot="reference" @click.stop="$card.insertCard('user-view', { user })">
      <slot/>
    </div>
  </px-popover>
</template>

<style lang="scss" ref-slot="popper">

.image {
  width: 135px;
  height: 135px;
  margin: 0 auto;
  display: block;
  position: relative;
  text-align: center;
  overflow: hidden;
  display: inline-block;

  > img {
    top: 0;
    left: 0;
    user-select: none;
    border-radius: 4px;
    position: absolute;
    cursor: pointer !important;
  }

  > i.icon-spinner {
    font-size: 36px;
    color: #409eff;
    top: 50%;
    left: 0;
    width: 100%;
    margin-top: -18px;
    position: absolute;
    animation: rotating 2s linear infinite;
  }
}

</style>
