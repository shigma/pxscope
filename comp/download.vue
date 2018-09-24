<script>

const { ipcRenderer } = require('electron')
const tasks = []

Vue.prototype.$download = function(url, path) {
  ipcRenderer.send('download', url, path)
}

function handleDownload(event, task) {
  const origin = tasks.find(({ id }) => task.id === id)
  if (origin) {
    Object.assign(origin, task)
  } else {
    tasks.push(task)
  }
}

ipcRenderer.on('dl-started', handleDownload)
ipcRenderer.on('dl-interrupted', handleDownload)
ipcRenderer.on('dl-paused', handleDownload)
ipcRenderer.on('dl-updated', handleDownload)
ipcRenderer.on('dl-completed', handleDownload)
ipcRenderer.on('dl-failed', handleDownload)

module.exports = {
  data: () => ({
    tasks,
  }),

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
  }
}

</script>

<template>
  <div>
    <div v-for="task in tasks" :key="task.id">{{task.name + task.state}}</div>
  </div>
</template>

<style lang="scss" scoped>

</style>
