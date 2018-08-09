const QS = require('querystring')
const URL = require('url').URL
const https = require('https')
const Events = require('events')
const Hosts = require('./hosts.js')
const searchData = require('./search')
const util = require('./util')

const BASE_URL = 'https://app-api.pixiv.net'
const CLIENT_ID = 'KzEZED7aC0vird8jWyHM38mXjNTY'
const CLIENT_SECRET = 'W9JZoJe00qPvJsiyCGT3CCtC6ZUtdpKpzMbNlUGP'

function catcher(error) {
  if (error.response) {
    throw error.response.data
  } else {
    throw error.message
  }
}

/**
 * Transform camel case into kebab case.
 * @param {string} source source string
 */
function toKebab(source) {
  if (typeof source === 'string') {
    return source.replace(/-/g, '_')
      .replace(/[A-Z]/g, char => '_' + char.toLowerCase())
  } else {
    const result = {}
    for (const key in source) {
      result[toKebab(key)] = toKebab(source[key])
    }
    return result
  }
}

class PixivAPI {
  constructor({
    hosts = Hosts.default,
    timeout = 20000,
    language = 'en-US',
  } = {}) {
    /** Host map */
    this.hosts = new Hosts(hosts)
    /** Default headers */
    this.headers = {
      'App-OS': 'ios',
      'App-OS-Version': '9.3.3',
      'App-Version': '7.1.11',
      'User-Agent': 'PixivIOSApp/7.1.11 (iOS 9.0; iPhone8,2)',
    }
    /** Socket timeout */
    this.timeout = timeout
    /** Set language */
    this.language = language
    /** Event emitter */
    this.events = new Events()
  }

  get user() {
    return Object.assign({}, this.auth.user)
  }

  get language() {
    return this.headers['Accept-Language']
  }

  set language(value) {
    this.headers['Accept-Language'] = value
  }

  authorize(auth) {
    this.auth = auth
    this.headers.Authorization = `Bearer ${auth.access_token}`
  }

  on(event, listener) {
    this.events.on(event, listener)
  }

  once(event, listener) {
    this.events.once(event, listener)
  }

  request({url, method, headers, postdata}) {
    if (!(url instanceof URL)) url = new URL(url, BASE_URL)
    return new Promise((resolve, reject) => {
      let data = ''
      const request = https.request({
        method: method || 'GET',
        headers: Object.assign({
          Host: url.hostname
        }, this.headers, headers),
        hostname: this.hosts.getHostName(url.hostname),
        servername: url.hostname,
        path: url.pathname + url.search,
      }, (response) => {
        response.on('data', chunk => data += chunk)
        response.on('end', () => {
          try {
            return resolve(JSON.parse(data))
          } catch (err) {
            return reject(new Error(`An error is encounted in ${data}\n${err}`))
          }
        })
      })
      request.on('error', error => reject(error))
      if (postdata instanceof Object) {
        request.write(QS.stringify(postdata))
      } else if (typeof postdata === 'string') {
        request.write(postdata)
      }
      request.end()
      setTimeout(() => {
        request.abort()
      }, this.timeout)
    }).then((result) => {
      if (result.error) {
        throw result.error
      } else {
        return result
      }
    })
  }

  login(username, password) {
    if (!username) return Promise.reject(new TypeError('username required'))
    if (!password) return Promise.reject(new TypeError('password required'))
    return this.request({
      url: 'https://oauth.secure.pixiv.net/auth/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      postdata: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        get_secure_url: 1,
        grant_type: 'password',
        username,
        password,
      }
    }).then((data) => {
      if (data.response) {
        this.events.emit('auth', data.response)
        this.authorize(data.response)
        return data.response
      } else if (data.has_error) {
        throw data.errors.system
      } else {
        console.error('An unknown error was encounted.')
        throw data
      }
    }).catch(catcher)
  }

  logout() {
    this.auth = null
    this.username = null
    this.password = null
    this._user_state = null
    delete this.headers.Authorization
  }

  refreshAccessToken() {
    if (!this.auth) return Promise.reject(new Error('Authorization required'))
    return this.request({
      url: 'https://oauth.secure.pixiv.net/auth/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      postdata: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        get_secure_url: 1,
        grant_type: 'refresh_token',
        refresh_token: this.auth.refresh_token,
      }
    }).then((data) => {
      this.authorize(data.response)
      this.events.emit('auth', data.response)
      return data.response
    }).catch(catcher)
  }

  createProvisionalAccount(nickname) {
    if (!nickname) return Promise.reject(new TypeError('nickname required'))
    return this.request({
      url: 'https://accounts.pixiv.net/api/provisional-accounts/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Bearer WHDWCGnwWA2C8PRfQSdXJxjXp0G6ULRaRkkd6t5B6h8',
      },
      postdata: {
        ref: 'pixiv_ios_app_provisional_account',
        user_name: nickname,
      }
    }).then(data => data.body).catch(catcher)
  }

  authRequest(url, options = {}, callback = arg => arg) {
    if (!url) return Promise.reject(new TypeError('Url cannot be empty'))
    if (!this.auth) return Promise.reject(new Error('Authorization required'))
    options.url = url
    options.headers = options.headers || {}
    return this.request(options).then(
      (result) => callback(result, this),
      () => this.refreshAccessToken().then(() => {
        return this.request(options).then(result => callback(result, this))
      })
    )
  }

  postRequest(url, postdata) {
    return this.authRequest(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      postdata,
    })
  }

  userState() {
    if (this._user_state) return Promise.resolve(this._user_state)
    return this.authRequest('/v1/user/me/state').then((data) => {
      if (data.user_state) {
        this._user_state = data.user_state
        return data.user_state
      } else {
        throw data
      }
    })
  }

  editUserAccount(info) {
    if (!info) return Promise.reject(new TypeError('info required'))
    const postdata = {}
    if (info.password) postdata.current_password = info.password
    if (info.pixivId) postdata.new_user_account = info.pixivId
    if (info.newPassword) postdata.new_password = info.newPassword
    if (info.email) postdata.new_mail_address = info.email
    return this.postRequest('https://accounts.pixiv.net/api/account/edit', postdata)
  }

  sendAccountVerificationEmail() {
    return this.postRequest('/v1/mail-authentication/send')
  }

  search(category, key, type, options, callback) {
    if (!searchData[category][type]) {
      return Promise.reject(new RangeError(`"${type}" is not a supported type.`))
    } else {
      const search = searchData[category][type]
      const query = {filter: 'for_ios'}
      if (searchData[category]._key) {
        if (!key) return Promise.reject(new TypeError('key required'))
        query[searchData[category]._key] = key
      }
      if (search.options instanceof Function) {
        Object.assign(query, search.options.call(this))
      } else if (search.options instanceof Object) {
        Object.assign(query, search.options)
      }
      return this.authRequest(`${search.url}?${
        QS.stringify(Object.assign(query, toKebab(options)))
      }`, {}, callback || search.then)
    }
  }

  createCollection(type) {
    return new util.Collection(this, util[type])
  }
}

module.exports = PixivAPI