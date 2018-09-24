<script>

const electron = require('electron')
const open = require('opn')

module.exports = {
  props: ['width'],
  inject: ['library'],

  components: {
    settingItem: require('./setting-item.vue'),
  },

  computed: {
    itemWidth() {
      return (this.width > 800 ? this.width / 2 : 400) + 'px'
    },
    timeout: {
      get() {
        return this.$store.state.timeout
      },
      set(value) {
        if (!value.match(/^\d+(\.\d+)?$/)) return
        this.$store.state.timeout = Number(value)
        $pixiv.timeout = Number(value) * 1000
      }
    },
    maxTasks: {
      get() {
        return this.$store.state.max_tasks
      },
      set(value) {
        if (!this.natural(value)) return
        electron.ipcRenderer.send('setting', 'maxTasks', value)
        this.$store.state.max_tasks = value
      }
    }
  },

  methods: {
    positive(value) {
      return Number(value) > 0
    },
    natural(value) {
      const number = Number(value)
      return Number.isInteger(number) && number > 0
    },
    setPersonalFolder() {
      electron.remote.dialog.showOpenDialog({
        properties: [
          'openDirectory',
          'createDirectory',
          'promptToCreate',
        ],
      }, ([ folder ]) => {
        if (!folder) return
        this.$store.state.path = folder
      })
    },
    openPersonalFolder() {
      open(this.$store.state.path)
    },
  }
}

</script>

<template>
  <div :style="{ width: itemWidth }">
    <h2 v-text="$t('settings.basic')"/>
    <div class="setting-group">
      <setting-item :label="$t('settings.language')">
        <el-select v-model="$i18n.locale" size="medium">
          <el-option v-for="(label, key) in library.i18n"
            :key="key" :label="label" :value="key"/>
        </el-select>
      </setting-item>
    </div>
    <h2 v-text="$t('settings.local')"/>
    <div class="setting-group">
      <setting-item :label="$t('settings.folder')" :caption="$store.state.path">
        <px-button-group>
          <px-button @click.stop="setPersonalFolder">{{ $t('settings.change') }}</px-button>
          <px-button @click.stop="openPersonalFolder">{{ $t('settings.open') }}</px-button>
        </px-button-group>
      </setting-item>
      <setting-item :label="$t('settings.maxTasks')">
        <px-input v-model.number="maxTasks" :validate="natural"/>
      </setting-item>
    </div>
    <h2 v-text="$t('settings.network')"/>
    <div class="setting-group">
      <setting-item :label="$t('settings.timeout')">
        <px-input v-model="timeout" :validate="positive">
          <template slot="append">{{ $t('settings.second') }}</template>
        </px-input>
      </setting-item>
    </div>
    <h2 v-text="$t('settings.browse')"/>
    <div class="setting-group">
      <setting-item :label="$t('settings.speed')">
        <px-input v-model.number="$neatScroll.config.speed" :validate="natural"/>
      </setting-item>
      <setting-item :label="$t('settings.smooth')">
        <px-input v-model.number="$neatScroll.config.smooth" :validate="natural"/>
      </setting-item>
    </div>
  </div>
</template>

<style lang="scss" scoped>

@import './colors';

h2 {
  color: $fg2;
  padding: 0 8px;
  margin: 32px 0 16px;
  font-size: 24px;
  line-height: 1em;
  user-select: none;
  cursor: default;
}

.setting-group {
  margin: 8px 0;
  border-radius: 3px;
  box-shadow: 0 1px 2px 1px $fg3;
  
  .px-input {
    font-size: 14px;
    height: 32px;
  }

  .px-button {
    height: 34px;
    padding: 6px 18px;
  }
}

& > :first-child { margin-top: 36px }
& > :last-child { margin-bottom: 36px }

</style>
