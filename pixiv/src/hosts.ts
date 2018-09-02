import fetch from 'node-fetch'
import * as packet from 'dns-packet'
import * as qs from 'querystring'

const DNS_FORMAT = 'application/dns-udpwireformat'

const serverNames = [
  'pixiv.net',
  'www.pixiv.net',
  'i.pximg.net',
  'source.pixiv.net',
  'accounts.pixiv.net',
  'touch.pixiv.net',
  'imgaz.pixiv.net',
  'app-api.pixiv.net',
  'oauth.secure.pixiv.net',
  'dic.pixiv.net',
  'comic.pixiv.net',
  'factory.pixiv.net',
  'g-client-proxy.pixiv.net',
  'sketch.pixiv.net',
  'payment.pixiv.net',
  'sensei.pixiv.net',
  'novel.pixiv.net',
  'en-dic.pixiv.net',
  'i1.pixiv.net',
  'i2.pixiv.net',
  'i3.pixiv.net',
  'i4.pixiv.net',
  'd.pixiv.org',
  'pixiv.pximg.net',
  'fanbox.pixiv.net',
  's.pximg.net',
]

async function lookup(name: string, url?: string): Promise<string> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': DNS_FORMAT,
      'Accept': DNS_FORMAT,
    },
    body: packet.encode({
      type: 'query',
      id: 0,
      flags: packet.RECURSION_DESIRED,
      questions: [{
        type: 'A',
        class: 'IN',
        name: qs.escape(name)
      }],
    })
  })
  const answers = packet.decode(await response.buffer()).answers
  return answers.map(answer => answer.data as string).find(data => /^[\d.]+$/.test(data))
}

export type HostData = StringMap<string>

interface HostOptions {
  url?: string
  load?: () => HostData
  save?: (data: HostData) => void
}

const defaultOptions: HostOptions = {
  url: 'https://cloudflare-dns.com/dns-query',
}

if (typeof window !== 'undefined') {
  // Browser environment, use localStorage as default
  defaultOptions.load = () => {
    try {
      const data = JSON.parse(localStorage.getItem('__PIXIV_HOSTS__'))
      if (Date.now() - data.time <= 3600 * 1000) return data.hosts
    } catch (error) {
      return
    }
  }
  defaultOptions.save = (hosts: HostData) => {
    localStorage.setItem('__PIXIV_HOSTS__', JSON.stringify({
      version: '1.0',
      time: Date.now(),
      hosts,
    }))
  }
}

export class Hosts {
  data: HostData = {}
  options: HostOptions

  constructor(options: HostOptions = {}) {
    this.options = Object.assign(defaultOptions, options)
  }

  load(data?: string | HostData): HostData {
    if (typeof data === 'string') {
      data.match(/^\d.+$/gm).forEach((line) => {
        const match = line.match(/(\S+)\s+(\S+)/)
        if (match) this.data[match[2]] = match[1]
      })
    } else if (typeof data === 'object') {
      Object.assign(this.data, data)
    } else if (this.options.load) {
      Object.assign(this.data, this.options.load())
    }
    return this.data
  }

  getHostName(serverName: string): string {
    return this.data[serverName] || serverName
  }
  
  async update(): Promise<HostData> {
    const data = this.options.load && this.options.load()
    if (data) {
      return this.load(data)
    } else {
      const hosts: HostData = {}
      return Promise.all(serverNames.map((name) => {
        return lookup(name, this.options.url).then(result => hosts[name] = result)
      })).then(() => {
        if (this.options.save) this.options.save(hosts)
        return this.load(hosts)
      })
    }
  }
}
