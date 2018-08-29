import { escape } from 'querystring'
import * as packet from 'dns-packet'
import fetch from 'node-fetch'

const DNS_FORMAT = 'application/dns-udpwireformat'
const CLOUDFLARE = 'https://cloudflare-dns.com/dns-query'
const LOCAL_PATH = process.env.LOCALAPPDATA

const NAMESPACE = [
  "pixiv.net",
  "www.pixiv.net",
  "i.pximg.net",
  "source.pixiv.net",
  "accounts.pixiv.net",
  "touch.pixiv.net",
  "imgaz.pixiv.net",
  "app-api.pixiv.net", 
  "oauth.secure.pixiv.net",
  "dic.pixiv.net",
  "comic.pixiv.net",
  "factory.pixiv.net",
  "g-client-proxy.pixiv.net", 
  "sketch.pixiv.net",
  "payment.pixiv.net",
  "sensei.pixiv.net",
  "novel.pixiv.net",
  "en-dic.pixiv.net", 
  "i1.pixiv.net",
  "i2.pixiv.net",
  "i3.pixiv.net",
  "i4.pixiv.net",
  "d.pixiv.org",
  "pixiv.pximg.net",
  "fanbox.pixiv.net",
  "s.pximg.net",
]

export async function lookup(name: string, url: string = CLOUDFLARE) {
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
        name: escape(name)
      }],
      additionals: [{
        name: '.',
        type: 'OPT',
        udpPayloadSize: 4096,
        flags: 0
      }]
    })
  })
  return packet.decode(await response.buffer()).answers.map(answer => answer.data)
}