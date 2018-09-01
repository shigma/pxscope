import fetch from 'node-fetch'
import * as packet from 'dns-packet'
import * as qs from 'querystring'
import * as path from 'path'
import * as fs from 'fs'

const DNS_FORMAT = 'application/dns-udpwireformat'
const HOST_PATH = path.join(__dirname, '../dist/hosts.json')

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

function getHosts(url?: string): Promise<StringMap<string>> {
  const hosts: StringMap<string> = {}
  return Promise.all(serverNames.map((name) => {
    return lookup(name, url).then(result => hosts[name] = result)
  })).then(() => {
    fs.writeFileSync(HOST_PATH, JSON.stringify({
      version: '1.0',
      time: Date.now(),
      hosts
    }))
    return hosts
  })
}

interface UpdateOptions {
  url?: string
  interval?: number
}

const defaultOptions: UpdateOptions = {
  url: 'https://cloudflare-dns.com/dns-query',
  interval: 1000 * 3600,
}

export type HostData = StringMap<string>

export class Hosts {
  data: HostData = {}

  constructor(data?: string | HostData) {
    if (typeof data === 'string') {
      data.match(/^\d.+$/gm).forEach((line) => {
        const match = line.match(/(\S+)\s+(\S+)/)
        if (match) this.data[match[2]] = match[1]
      })
    } else if (typeof data === 'object') {
      this.data = data
    } else {
      this.data = JSON.parse(fs.readFileSync(HOST_PATH).toString()).hosts
    }
  }

  getHostName(serverName: string): string {
    return this.data[serverName] || serverName
  }

  static async update(options: UpdateOptions): Promise<Hosts> {
    options = Object.assign(defaultOptions, options)
    try {
      const data = JSON.parse(fs.readFileSync(HOST_PATH).toString())
      if (Date.now() - data.time > options.interval) {
        return new Hosts(await getHosts(options.url))
      } else {
        return new Hosts(data.hosts)
      }
    } catch (error) {
      return new Hosts(await getHosts(options.url))
    }
  }
}
