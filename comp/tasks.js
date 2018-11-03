const { randomID } = require('./utils/utils')

class DownloadTasks {
  constructor() {
    this.id = randomID()
    this.data = []
  }

  get birth() {
    return this.data
  }

  get state() {
    if (this.data.every(task => task.state === 'waiting')) return 'waiting'
    if (this.data.find(task => task.state === 'progressing')) return 'progressing'
    return 'completed'
  }

  push(...tasks) {
    this.data.push(...tasks)
  }
}

module.exports = DownloadTasks
