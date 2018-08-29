type StringMap<V> = { [key: string]: V }

const LOCAL_PATH = process.env.LOCALAPPDATA

class Hosts {
  private data: StringMap<string>

  constructor(data) {
    if (typeof data === 'string') {
      this.data = {}
      data.match(/^\d.+$/gm).forEach((line) => {
        const match = line.match(/(\S+)\s+(\S+)/)
        if (match) this.data[match[2]] = match[1]
      })
    } else if (typeof data === 'object') {
      this.data = data
    } else {
      this.data = {}
    }
  }

  getHostName(serverName: string): string {
    if (serverName in this.data) {
      return this.data[serverName]
    } else {
      return serverName
    }
  }
}

module.exports = Hosts