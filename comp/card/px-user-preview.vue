<script>

module.exports = {
  inject: ['$card'],
  props: {
    user: { required: true },
    exclude: { default: null },
  },

  components: {
    pxIllustsItem: require('./px-illusts-item.vue'),
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
      <px-illusts-item v-for="(illust, index) in illusts" :key="index"
        :illust="illust" :size="135" :show-mask="false" :radius="0"/>
    </div>
    <div v-else-if="state === 'loading'" class="message" v-text="$t('discovery.isLoading')"/>
    <div v-else class="message" v-text="$t('discovery.loadingFailed')"/>
    <div slot="reference" @click.stop="$card.insertCard('user-view', { user })">
      <slot/>
    </div>
  </px-popper>
</template>

<style lang="scss" ref-slot="popper">

.message {
  text-align: -webkit-center;
  font-size: 16px;
}

</style>
