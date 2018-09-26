<script>

const { ipcRenderer } = require('electron')

Vue.prototype.$download = function(url, path) {
  ipcRenderer.send('download', url, path)
}

module.exports = {
  props: ['height', 'width'],

  data: () => ({
    tasks: [],
    query: '',
  }),

  computed: {
    inputWidth() {
      return this.width - 32 + 'px'
    },
  },

  created() {
    ipcRenderer.on('dl-started', this.handleDownload)
    ipcRenderer.on('dl-interrupted', this.handleDownload)
    ipcRenderer.on('dl-paused', this.handleDownload)
    ipcRenderer.on('dl-updated', this.handleDownload)
    ipcRenderer.on('dl-completed', this.handleDownload)
    ipcRenderer.on('dl-failed', this.handleDownload)
  },

  activated() {
    if (!$pixiv.account()) {
      this.$root.switchRoute('user')
      this.$message.error(this.$t('messages.loginFirst'))
    }
  },

  methods: {
    getProgress(task) {
      return task.bytes / task.size
    },
    formatRemain(task) {
      const progress = this.getProgress(task)
      if (!progress) return '--:--:--'
      return this.formatTime((Date.now() / 1000 - task.birth) / progress * (1 - progress))
    },
    formatTime(seconds) {
      return seconds
    },
    download() {
      const list = this.query.split(/[,，] */g)
      list.forEach((item) => {
        if (/^[1-9]\d{1,7}$/.test(item)) {
          $pixiv.search('illust', item)
            .then((result) => {
              if (result.page_count === 1) {
                this.$download(result.meta_single_page.original_image_url)
              } else {
                result.meta_pages.forEach((page) => {
                  this.$download(page.image_urls.original)
                })
              }
            })
            .catch()
        }
      })
    },
    handleDownload(event, task) {
      const origin = this.tasks.find(({ id }) => task.id === id)
      if (origin) {
        Object.assign(origin, task)
      } else {
        this.tasks.push(task)
      }
    },
  }
}

</script>

<template>
  <div>
    <px-input v-model="query" :round="true" :style="{ width: inputWidth }"
      :placeholder="$t('download.enterQuery')" @enter="download"/>
    <div v-for="task in tasks" :key="task.id">{{task.name}}{{task.state}}</div>
  </div>
</template>

<style lang="scss" scoped>

.px-input {
  font-size: 16px;
  padding: 16px 0;
}

</style>
