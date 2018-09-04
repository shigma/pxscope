<script>

module.exports = {
  inject: ['$card'],
  props: {
    user: { required: true },
    exclude: { default: null },
  },

  data: () => ({
    state: 'loading',
  }),

  computed: {
    illusts() {
      return this.user._illusts.data
        .filter(illust => illust.id !== this.exclude)
        .slice(0, 2)
    }
  },

  created() {
    this.user.illusts()
      .then(() => this.state = 'loaded')
      .catch(() => this.state = 'failed')
  },
}

</script>

<template>
  <px-popper :width="270" ref="popper" tag="div">
    <div v-if="state === 'loaded'">
      <div class="image" v-for="(illust, index) in illusts" :key="index"
        @click.stop="$card.insertCard('illust-view', { illust })">
        <img :src="illust.image_urls.square_medium" height="135" width="135"
          @load="illust.loaded = true"/>
        <i class="icon-spinner" v-if="!illust.loaded"/>
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

.message {
  text-align: -webkit-center;
  font-size: 16px;
}

</style>
