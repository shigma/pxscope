<template>
  <div :style="{margin: pageMargin}">
    <img :src="info.profile_image_urls.px_170x170" width="170" height="170"/>
    <div class="info" :style="{ 'min-width': tableWidth }">
      <div class="item">
        <div class="label">{{ $t('user.nickname') }}</div>
        <div class="value" v-text="info.name"/>
      </div>
      <div class="item">
        <div class="label">{{ $t('user.account') }}</div>
        <div class="value" v-text="info.account"/>
      </div>
      <div class="item">
        <div class="label">{{ $t('user.id') }}</div>
        <div class="value" v-text="info.id"/>
      </div>
      <div class="item">
        <div class="label">{{ $t('user.mail') }}</div>
        <div class="value" v-text="info.mail_address"/>
      </div>
    </div>
    <div class="buttons">
      <button @click.stop="editInfo">{{ $t('user.editInfo') }}</button>
      <button @click.stop="logout">{{ $t('user.logout') }}</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>

& {
  top: 0;
  bottom: 0;
  height: fit-content;
  
  > * {
    transform: translateY(-12px);
    transition: 0.5s ease;
  }
}

img {
  margin: 0 auto;
  display: block;
  border-radius: 85px;
  user-select: none;
}

.info {
  margin: 20px auto;

  .item {
    padding: 0;
    display: -webkit-flex;
    border-top: 2px solid;
    &:last-child { border-bottom: 2px solid }

    .label {
      flex: 1 1 auto;
      text-decoration: none;
      padding: 0.8em 1em;
      line-height: 1.1em;
      background: none;
      font-size: 16px;
      display: inline-block;
      box-sizing: border-box;
      margin: auto;
    }

    .value {
      max-width: 228px;
      display: inline-block;
      padding: 0.8em 1em;
      line-height: 1.1em;
      font-size: 16px;
      text-align: right;
      margin: auto;
    }
  }
}

.buttons {
  user-select: none;
  margin: 0 auto;
  display: flex;
  justify-content: center;

  button {
    display: inline-flex;
    margin: 0 8px;
    line-height: 1;
    cursor: pointer;
    -webkit-appearance: none;
    text-align: center;
    box-sizing: border-box;
    outline: 0;
    transition: 0.5s;
    padding: 10px 20px;
    font-size: 14px;
    border-radius: 4px;
  }
}

</style>

<script>

module.exports = {
  props: ['height', 'width'],

  beforeCreate() {
    if (!$pixiv.account()) global.PX_VM.switchRoute('login')
  },

  data: () => ({
    info: $pixiv.account(),
    pageMargin: 'auto 0',
  }),

  activated() {
    const user = $pixiv.account()
    if (!user) {
      this.$root.switchRoute('login')
    } else {
      this.info = user
      this.updatePageMargin()
    }
  },

  computed: {
    tableWidth() {
      return (this.width > 800 ? this.width / 2 : 400) + 'px'
    },
  },

  mounted() {
    this.$watch(
      () => this.height - this.$el.offsetHeight,
      this.updatePageMargin
    )
  },

  methods: {
    editInfo() {
      this.$message.error(this.$t('messages.notSupported'))
    },
    logout() {
      $pixiv.logout()
      localStorage.setItem('auth', null)
      this.$root.switchRoute('login')
    },
    updatePageMargin() {
      if (this.height >= this.$el.offsetHeight + 48) {
        this.pageMargin = 'auto 0'
      } else {
        this.pageMargin = '36px 0 12px'
      }
    }
  }
}

</script>