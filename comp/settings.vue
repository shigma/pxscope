<template>
  <div :style="{ width: itemWidth }">
    <h2 v-text="$t('settings.basic')"/>
    <div class="setting-group">
      <div class="setting-item">
        <div class="label" v-text="$t('settings.theme')"/>
        <div class="control">
          <el-select v-model="settings.theme" size="medium">
            <el-option v-for="(item, index) in library.themes"
              :key="index" :label="$t('themes.' + item)" :value="item"/>
          </el-select>
        </div>
      </div>
      <div class="setting-item">
        <div class="label" v-text="$t('settings.language')"/>
        <div class="control">
          <el-select v-model="$i18n.locale" size="medium">
            <el-option v-for="(label, key) in library.i18n"
              :key="key" :label="label" :value="key"/>
          </el-select>
        </div>
      </div>
    </div>
    <h2 v-text="$t('settings.network')"/>
    <div class="setting-group">
      <div class="setting-item">
        <div class="label" v-text="$t('settings.timeout')"/>
        <div class="control">
          <el-input v-model="timeout" size="medium">
            <template slot="append">{{ $t('settings.second') }}</template>
          </el-input>
        </div>
      </div>
    </div>
    <h2 v-text="$t('settings.browse')"/>
    <div class="setting-group">
      <div class="setting-item">
        <div class="label" v-text="$t('settings.speed')"/>
        <div class="control">
          <el-input v-model.number="$neatScroll.config.speed" size="medium"/>
        </div>
      </div>
      <div class="setting-item">
        <div class="label" v-text="$t('settings.smooth')"/>
        <div class="control">
          <el-input v-model.number="$neatScroll.config.smooth" size="medium"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

h2 {
  margin: 36px 0 20px;
  font-size: 28px;
}

.setting-group {
  margin: 20px 0;

  .setting-item {
    padding: 0;
    -webkit-user-select: none;
    display: -webkit-flex;
    cursor: default;
    &:not(:last-child) { border-bottom: 1px solid }

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

    .control {
      max-width: 200px;
      display: inline-block;
      padding: 0.8em 1em;
      line-height: 1.1em;
      font-size: 12px;
      text-align: right;
    }
  }
}

& > :first-child { margin-top: 36px }
& > :last-child { margin-bottom: 36px }

</style>

<script>

module.exports = {
  props: ['width'],
  inject: ['library'],

  computed: {
    settings() {
      return this.$store.state.settings
    },
    itemWidth() {
      return (this.width > 800 ? this.width / 2 : 400) + 'px'
    },
    timeout: {
      get() {
        return this.settings.timeout
      },
      set(value) {
        if (!value.match(/^\d+(\.\d+)?$/)) return
        this.settings.timeout = Number(value)
        $pixiv.timeout = Number(value) * 1000
      }
    },
  }
}

</script>