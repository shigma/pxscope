<script>

module.exports = {
  props: ['height', 'width'],

  data: () => ({
    info: $pixiv.account(),
    pageMargin: 'auto 0',
    username: '',
    password: '',
    remember: true,
  }),

  computed: {
    tableWidth() {
      return this.info
        ? (this.width > 800 ? this.width / 2 : 400) + 'px'
        : (this.width > 900 ? this.width / 3 : 300) + 'px'
    },
  },

  watch: {
    height() {
      this.updatePageMargin()
    }
  },

  activated() {
    this.info = $pixiv.account()
    if (this.info) {
      this.updatePageMargin()
    }
  },

  updated() {
    if (this.info) {
      this.updatePageMargin()
    }
  },

  methods: {
    editInfo() {
      this.$message.error(this.$t('messages.notSupported'))
    },
    logout() {
      $pixiv.logout()
      localStorage.setItem('auth', null)
      this.info = null
    },
    login() {
      this.$emit('start-load')
      $pixiv.login(this.username, this.password).then(result => {
        this.$store.commit('saveAccount', {
          id: result.user.id,
          account: result.user.account,
          mail: result.user.mail_address,
          password: this.remember ? this.password : null,
        })
        this.info = $pixiv.account()
        this.$emit('finish-load')
      }).catch(error => {
        this.$emit('finish-load')
        if (error.startsWith('103')) {
          this.$message.error(this.$t('messages.wrongPassword'))
        } else if (error.startsWith('connect ETIMEDOUT') || error === 'socket hang up') {
          this.$message.error(this.$t('messages.connectTimeout'))
        } else if (error.startsWith('connect EHOSTUNREACH')) {
          this.$message.error(this.$t('messages.noRouteToHost'))
        } else if (error === 'access_denied') {
          this.$message.error(this.$t('messages.accessDenied'))
        } else {
          this.$message.error(error)
          console.error(error)
          this.$pushError('Unknown error message', error)
        }
      })
    },
    register() {
      this.$message.error(this.$t('messages.notSupported'))
    },
    updatePageMargin() {
      if (this.height >= this.$el.offsetHeight + 48) {
        this.pageMargin = 'auto 0'
      } else {
        this.pageMargin = '36px 0 12px'
      }
    },
  }
}

</script>

<template>
  <!-- display user info if logged in -->
  <div v-if="info" :style="{ margin: pageMargin }" class="user-info">
    <img :src="info.profile_image_urls.px_170x170" width="170" height="170"/>
    <div class="info-table" :style="{ 'min-width': tableWidth }">
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
    <div class="info-buttons">
      <button @click.stop="editInfo">{{ $t('user.editInfo') }}</button>
      <button @click.stop="logout">{{ $t('user.logout') }}</button>
    </div>
  </div>
  <!-- otherwise show login form -->
  <div v-else class="login-form">
    <div class="input" :style="{ width: tableWidth }">
      <div class="label">{{ $t('user.username') }}</div>
      <el-input v-model="username" :placeholder="$t('user.enterUsername')"/>
    </div>
    <div class="input" :style="{ width: tableWidth }">
      <div class="label">{{ $t('user.password') }}</div>
      <el-input v-model="password" :placeholder="$t('user.enterPassword')" type="password"/>
    </div>
    <el-checkbox v-model="remember" size="medium">{{ $t('user.remember') }}</el-checkbox>
    <div class="buttons">
      <button @click.stop="login">{{ $t('user.login') }}</button>
      <button @click.stop="register">{{ $t('user.register') }}</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>

& {
  top: 0;
  bottom: 0;
  height: fit-content;
}

&.user-info {
  > * {
    transform: translateY(-12px);
    transition: 0.5s ease;
  }

  img {
    margin: 0 auto;
    display: block;
    border-radius: 85px;
    user-select: none;
  }

  .info-table {
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

  .info-buttons {
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
}

&.login-form {
  margin: auto;
  display: flex;
  flex-direction: column;
  
  .input {
    display: -webkit-flex;
    margin: 12px auto 0;

    .label {
      font-size: 16px;
      width: 80px;
      flex: 1 1 auto;
      margin: auto 8px;
      text-align: center;

      & + div { flex: 2 1 auto }
    }
  }

  .buttons {
    margin-top: 12px;
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

  .el-checkbox {
    height: 20px;
    margin: 16px auto;
    display: inline-flex;

    .el-checkbox__inner {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      
      &::after {
        border-width: 2px;
        height: 10px;
        left: 3px;
        top: 0;
        width: 5px;
      }
    }

    .el-checkbox__label {
      font-size: 16px;
      line-height: 20px;
      vertical-align: middle;
      transition: 0.5s ease;
    }
  }
}

</style>
