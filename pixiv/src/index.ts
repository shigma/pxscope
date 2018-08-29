import * as qs from 'querystring'
import * as Events from 'events'
import * as https from 'https'
import { URL } from 'url'
import { Hosts, HostData } from './hosts'

const BASE_URL = 'https://app-api.pixiv.net'
const CLIENT_ID = 'KzEZED7aC0vird8jWyHM38mXjNTY'
const CLIENT_SECRET = 'W9JZoJe00qPvJsiyCGT3CCtC6ZUtdpKpzMbNlUGP'
const CONTENT_TYPE = 'application/x-www-form-urlencoded'

function catcher(error) {
  if (error.response) {
    throw error.response.data
  } else {
    throw error.message
  }
}

function toKebab(source: StringRecursive): StringRecursive {
  if (typeof source === 'string') {
    return source.replace(/-/g, '_')
      .replace(/[A-Z]/g, char => '_' + char.toLowerCase())
  } else {
    const result: StringRecursive = {}
    for (const key in source) {
      result[<string> toKebab(key)] = toKebab(source[key])
    }
    return result
  }
}

interface NativeConfig {
  username?: string
  password?: string
  state?: Pixiv.State
  auth: Pixiv.Auth
  timeout: number
  hosts: Hosts
  events: Events
  headers: StringMap<string>
}

const _config: NativeConfig = {
  auth: null,
  timeout: 20000,
  hosts: new Hosts(),
  events: new Events(),
  headers: {
    'App-OS': 'ios',
    'App-OS-Version': '9.3.3',
    'App-Version': '7.1.11',
    'Accept-Language': 'en-US',
    'User-Agent': 'PixivIOSApp/7.1.11 (iOS 9.0; iPhone8,2)',
  },
}

interface PixivConfig {
  hosts: HostData
  timeout: number
  language: string
}

export const config: PixivConfig = Object.defineProperties({}, {
  hosts: {
    get() {
      return _config.hosts.data
    },
    set(value) {
      _config.hosts = value instanceof Hosts ? value : new Hosts(value)
    }
  },
  language: {
    get() {
      return _config.headers['Accept-Language']
    },
    set(value) {
      _config.headers['Accept-Language'] = value
    }
  },
  timeout: {
    get() {
      return _config.timeout
    },
    set(value) {
      _config.timeout = value
    }
  }
})

interface RequestOptions {
  url?: string | URL
  method?: 'POST' | 'GET'
  headers?: StringMap<string>
  body?: any
}

function request(options: RequestOptions): Promise<any> {
  const url = options.url instanceof URL ? options.url : new URL(options.url, BASE_URL)
  return new Promise((resolve, reject) => {
    let data = ''
    const timeout = setTimeout(() => request.abort(), _config.timeout)
    const headers = Object.assign({ Host: url.hostname }, _config.headers)
    if (options.method === 'POST') headers['Content-Type'] = CONTENT_TYPE
    const request = https.request({
      method: options.method || 'GET',
      headers: Object.assign(headers, options.headers),
      hostname: _config.hosts.getHostName(url.hostname),
      servername: url.hostname,
      path: url.pathname + url.search,
    }, (response) => {
      response.on('data', chunk => data += chunk)
      response.on('end', () => {
        clearTimeout(timeout)
        try {
          return resolve(JSON.parse(data))
        } catch (err) {
          return reject(new Error(`An error is encounted in ${data}\n${err}`))
        }
      })
    })
    request.on('error', (error) => {
      clearTimeout(timeout)
      reject(error)
    })
    if (options.body instanceof Object) {
      request.write(qs.stringify(options.body))
    } else if (typeof options.body === 'string') {
      request.write(options.body)
    }
    request.end()
  }).then((result: any) => {
    if ('error' in result) {
      throw result.error
    } else {
      return result
    }
  })
}

export function getUser(): Pixiv.User.Self {
  return {..._config.auth.user}
}

interface AuthEvent { auth: Pixiv.Auth }
interface PixivEvents { auth: AuthEvent }

export function on<K extends keyof PixivEvents>(event: K, listener: (event: PixivEvents[K]) => any) {
  _config.events.on(event, listener)
}

export function once<K extends keyof PixivEvents>(event: K, listener: (event: PixivEvents[K]) => any) {
  _config.events.once(event, listener)
}

export function authorize(auth: Pixiv.Auth) {
  _config.auth = auth
  _config.headers.Authorization = `Bearer ${auth.access_token}`
}

on('auth', ({auth}) => authorize(auth))

export function login(username, password): Promise<Pixiv.Auth> {
  if (!username) return Promise.reject(new TypeError('username required'))
  if (!password) return Promise.reject(new TypeError('password required'))
  return request({
    url: 'https://oauth.secure.pixiv.net/auth/token',
    method: 'POST',
    body: {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      get_secure_url: 1,
      grant_type: 'password',
      username,
      password,
    }
  }).then((data) => {
    if (data.response) {
      _config.events.emit('auth', { auth: data.response })
      return data.response
    } else if (data.has_error) {
      throw data.errors.system
    } else {
      console.error('An unknown error was encounted.')
      throw data
    }
  }).catch(catcher)
}

export function logout(): void {
  _config.auth = null
  _config.username = null
  _config.password = null
  _config.state = null
  delete _config.headers.Authorization
}

export function refreshAccessToken(): Promise<Pixiv.Auth> {
  if (!_config.auth) return Promise.reject(new Error('Authorization required'))
  return request({
    url: 'https://oauth.secure.pixiv.net/auth/token',
    method: 'POST',
    body: {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      get_secure_url: 1,
      grant_type: 'refresh_token',
      refresh_token: _config.auth.refresh_token,
    }
  }).then((data) => {
    _config.events.emit('auth', { auth: data.response })
    return data.response
  }).catch(catcher)
}

export function createProvisionalAccount(nickname): Promise<any> {
  if (!nickname) return Promise.reject(new TypeError('nickname required'))
  return request({
    url: 'https://accounts.pixiv.net/api/provisional-accounts/create',
    method: 'POST',
    headers: {
      Authorization: 'Bearer WHDWCGnwWA2C8PRfQSdXJxjXp0G6ULRaRkkd6t5B6h8',
    },
    body: {
      ref: 'pixiv_ios_app_provisional_account',
      user_name: nickname,
    }
  }).then(data => data.body).catch(catcher)
}

function authRequest(
  url: string | URL,
  options: RequestOptions = {},
  callback: (arg: any) => any = (arg) => arg
): Promise<any> {
  if (!url) return Promise.reject(new TypeError('Url cannot be empty'))
  if (!_config.auth) return Promise.reject(new Error('Authorization required'))
  options.url = url
  options.headers = options.headers || {}
  return request(options).then(
    callback,
    () => refreshAccessToken().then(() => request(options).then(callback))
  )
}

export function userState() {
  if (_config.state) return Promise.resolve(_config.state)
  return authRequest('/v1/user/me/state').then((data) => {
    if (data.user_state) {
      return data.user_state = data.user_state
    } else {
      throw data
    }
  })
}

interface EditOptions {
  password?: string
  pixivId?: string
  newPassword?: string
  email?: string
}

export function editUserAccount(info: EditOptions): Promise<any> {
  if (!info) return Promise.reject(new TypeError('info required'))
  const body: StringMap<string> = {}
  if (info.password) body.current_password = info.password
  if (info.pixivId) body.new_user_account = info.pixivId
  if (info.newPassword) body.new_password = info.newPassword
  if (info.email) body.new_mail_address = info.email
  return authRequest('https://accounts.pixiv.net/api/account/edit', { method: 'POST', body })
}

export function sendAccountVerificationEmail() {
  return authRequest('/v1/mail-authentication/send', { method: 'POST' })
}

class PixivUser {
  static COLLECT_KEY = 'user_previews'

  is_muted: boolean
  user: Pixiv.User.Other
  profile: Pixiv.User.Profile
  profile_publicity: Pixiv.User.Publicity
  workspace: Pixiv.User.Workspace
  _illusts: Collection<'illust'>
  _novels: Collection<'novel'>
  _followers: Collection<'user'> | null
  _followings: Collection<'user'> | null

  constructor(data) {
    this.user = data.user
    this.is_muted = data.is_muted
    this.profile = data.profile
    this.profile_publicity = data.profile_publicity
    this.workspace = data.workspace
    this._illusts = new Collection('illust', data)
    this._novels = new Collection('novel', data)
  }

  get id() {
    return this.user.id
  }

  search(...args) {
    return search('user', this.id, ...args)
  }

  detail() {
    if (this.profile) return Promise.resolve(this)
    return this.search('detail', {}, (data) => {
      return Object.assign(this, data)
    })
  }

  illusts() {
    if (this._illusts.hasData) return Promise.resolve(this._illusts)
    return this.search('illusts', {}, (data) => {
      return this._illusts = new Collection('illust', data)
    })
  }

  novels() {
    if (this._novels.hasData) return Promise.resolve(this._novels)
    return this.search('novels', {}, (data) => {
      return this._novels = new Collection('novel', data)
    })
  }

  followers() {
    if (this._followers) return Promise.resolve(this._followers)
    return this.search('follower', {}, (data) => {
      return this._followers = new Collection('user', data)
    })
  }

  followings() {
    if (this._followings) return Promise.resolve(this._followings)
    return this.search('following', {}, (data) => {
      return this._followings = new Collection('user', data)
    })
  }

  follow(restrict: Pixiv.RestrictTypes = 'public') {
    return authRequest('/v1/user/follow/add', {
      method: 'POST',
      body: {
        user_id: this.id,
        restrict,
      }
    })
  }

  unfollow() {
    return authRequest('/v1/user/follow/delete', {
      method: 'POST',
      body: {
        user_id: this.id,
      }
    })
  }
}

class PixivIllust {
  static COLLECT_KEY = 'illusts'

  id: number
  title: string
  type: string
  caption: string
  restrict: 0 | 1 | 2
  user: Pixiv.User.Other
  author: PixivUser
  tags: Pixiv.Tag[]
  tools: Array<any>
  create_date: string
  page_count: string
  width: number
  height: number
  sanity_level: number
  total_view: number
  total_bookmarks: number
  total_comments: number
  is_bookmarked: boolean
  is_muted: boolean
  visible: boolean
  series: any // FIXME: any
  image_urls: Pixiv.ImageURLs
  meta_single_page: {
    original_image_url: string
  }
  meta_pages: Array<any> // FIXME: any
  _bookmark: any
  _comments: Collection<'comment'> | null
  _related: Collection<'illust'> | null

  constructor(data) {
    Object.assign(this, data)
    this.author = new PixivUser({ user: this.user })
  }

  search(...args) {
    return search('illust', this.id, ...args)
  }

  detail() {
    return this.search('detail', {}, (data) => {
      return Object.assign(this, data)
    })
  }

  bookmark() {
    if (this._bookmark) return Promise.resolve(this._bookmark)
    return this.search('bookmarkDetail', {}, (data) => {
      return this._bookmark = data
    })
  }

  comments() {
    if (this._comments) return Promise.resolve(this._comments)
    return this.search('comments', {}, (data) => {
      return this._comments = new Collection('comment', data)
    })
  }

  related() {
    if (this._related) return Promise.resolve(this._related)
    return this.search('related', {}, (data) => {
      return this._related = new Collection('illust', data)
    })
  }

  addComment(comment) {
    if (!comment) return Promise.reject(new TypeError('comment required'))
    return authRequest('/v1/illust/comment/add', {
      method: 'POST',
      body: {
        illust_id: this.id,
        comment,
      }
    })
  }

  addBookmark(tags = [], restrict = 'public') {
    if (!(tags instanceof Array)) return Promise.reject(new TypeError('invalid tags'))
    return authRequest('/v2/illust/bookmark/add', {
      method: 'POST',
      body: {
        illust_id: this.id,
        restrict,
        tags,
      }
    })
  }

  deleteBookmark() {
    return authRequest('/v1/illust/bookmark/delete', {
      method: 'POST',
      body: {
        illust_id: this.id,
      }
    })
  }
}

class PixivNovel {
  static COLLECT_KEY = 'novels'

  id: number
  title: string
  caption: string
  restrict: 0 | 1 | 2
  user: Pixiv.User.Other
  author: PixivUser
  tags: Pixiv.Tag[]
  image_urls: Pixiv.ImageURLs
  create_date: string
  page_count: number
  text_length: number
  series: any // FIXME: any
  visible: boolean
  is_bookmarked: boolean
  is_muted: boolean
  total_bookmarks: number
  total_view: number
  total_comments: number

  constructor(data) {
    Object.assign(this, data)
    this.author = new PixivUser({ user: this.user })
  }

  search(...args) {
    return search('novel', this.id, ...args)
  }

  addComment(comment) {
    if (!comment) return Promise.reject(new TypeError('comment required'))
    return authRequest('/v1/novel/comment/add', {
      method: 'POST',
      body: {
        novel_id: this.id,
        comment,
      }
    })
  }

  addBookmark(tags = [], restrict = 'public') {
    if (!(tags instanceof Array)) return Promise.reject(new TypeError('invalid tags'))
    return authRequest('/v2/novel/bookmark/add', {
      method: 'POST',
      body: {
        novel_id: this.id,
        restrict,
        tags,
      }
    })
  }

  deleteBookmark() {
    return authRequest('/v1/novel/bookmark/delete', {
      method: 'POST',
      body: {
        novel_id: this.id,
      }
    })
  }
}

class PixivComment {
  static COLLECT_KEY = 'comments'

  id: number
  comment: string
  date: string
  user: Pixiv.User.Other
  author: PixivUser
  has_replies: boolean
  _replies: Collection<'comment'> | null

  constructor(data) {
    Object.assign(this, data)
    this.author = new PixivUser({ user: this.user })
  }

  search(...args) {
    return search('comment', this.id, ...args)
  }

  replies() {
    if (this._replies) return Promise.resolve(this._replies)
    return this.search('replies', {}, (data) => {
      return this._replies = new Collection('comment', data)
    })
  }
}

const PixivObjectMap = {
  user: PixivUser,
  illust: PixivIllust,
  novel: PixivNovel,
  comment: PixivComment,
}

class Collection<K extends keyof typeof PixivObjectMap> {
  private _type: typeof PixivObjectMap[K]

  data: Array<K>
  next?: string
  limit?: number
  hasData?: boolean

  constructor(type: K, data = {}) {
    this._type = <any> type
    this.data = []
    if (data[this._type.COLLECT_KEY]) {
      this.hasData = true
      this._pushResult(data)
    } else {
      this.hasData = false
    }
  }

  _pushResult(result): void {
    this.data.push(...result[this._type.COLLECT_KEY].map(item => {
      return item instanceof this._type ? item : Reflect.construct(this._type, [item])
    }))
    this.next = result.next_url
    this.limit = result.search_span_limit
  }

  extend(): Promise<any> {
    if (!this.hasData) return Promise.reject(new Error('Initial data required.'))
    if (!this.next) return Promise.resolve(this.data)
    return authRequest(this.next, {}, result => this._pushResult(result))
  }
}

function collect<K extends keyof typeof PixivObjectMap>(type: K): (data?: any) => Collection<K> {
  return data => new Collection(type, data)
}

export function createCollection<K extends keyof typeof PixivObjectMap>(type: K): Collection<K> {
  return collect(type)()
}

const SearchData =  {
  word: {
    _key: 'word',
    illust: {
      url: '/v1/search/illust',
      options: {
        target: 'partial_match_for_tags',
        sort: 'date_desc',
      },
      then: collect('illust')
    },
    illustPopularPreview: {
      url: '/v1/search/popular-preview/illust',
      options: {
        target: 'partial_match_for_tags',
      },
      then: collect('illust')
    },
    illustBookmarkRanges: {
      url: '/v1/search/bookmark-ranges/illust',
      options: {
        target: 'partial_match_for_tags',
      },
      then: collect('illust')
    },
    novel: {
      url: '/v1/search/novel',
      options: {
        target: 'partial_match_for_tags',
        sort: 'date_desc',
      },
      then: collect('novel')
    },
    novelPopularPreview: {
      url: '/v1/search/popular-preview/novel',
      options: {
        target: 'partial_match_for_tags',
      },
      then: collect('novel')
    },
    novelBookmarkRanges: {
      url: '/v1/search/bookmark-ranges/novel',
      options: {
        target: 'partial_match_for_tags',
      },
      then: collect('novel')
    },
    user: {
      url: '/v1/search/user',
      then: collect('user')
    },
    autoComplete: {
      url: '/v1/search/autocomplete',
      then: data => data.search_auto_complete_keywords
    }
  },
  user: {
    _default: 'detail',
    _key: 'user_id',
    detail: {
      url: '/v1/user/detail',
      then: data => new PixivUser(data)
    },
    illusts: {
      url: '/v1/user/illusts',
      then: collect('illust')
    },
    novels: {
      url: '/v1/user/novels',
      then: collect('novel')
    },
    bookmarkIllusts: {
      url: '/v1/user/bookmarks/illust',
      options: {
        restrict: 'public'
      },
      then: collect('illust')
    },
    bookmarkIllustTags: {
      url: '/v1/user/bookmark-tags/illust',
      options: {
        restrict: 'public'
      }
    },
    bookmarkNovel: {
      url: '/v1/user/bookmarks/novel',
      options: {
        restrict: 'public'
      }
    },
    bookmarkNovelTags: {
      url: '/v1/user/bookmark-tags/novel',
      options: {
        restrict: 'public'
      }
    },
    myPixiv: {
      url: '/v1/user/mypixiv',
      then: collect('user')
    },
    following: {
      url: '/v1/user/following',
      options: {
        restrict: 'public'
      },
      then: collect('user')
    },
    follower: {
      url: '/v1/user/follower',
      then: collect('user')
    },
    followDetail: {
      url: '/v1/user/follow/detail',
      then: data => data.follow_detail
    }
  },
  illust: {
    _default: 'detail',
    _key: 'illust_id',
    detail: {
      url: '/v1/illust/detail',
      then: data => new PixivIllust(data.illust)
    },
    bookmarkDetail: {
      url: '/v2/illust/bookmark/detail',
      then: data => data.bookmark_detail
    },
    comments: {
      url: '/v2/illust/comments',
      then: collect('comment')
    },
    related: {
      url: '/v2/illust/related',
      then: collect('illust')
    },
    metadata: {
      url: '/v1/ugoira/metadata',
      then: (data) => {
        if (data.ugoira_metadata) {
          return data.ugoira_metadata
        } else {
          throw data
        }
      }
    }
  },
  novel: {
    _default: 'detail',
    _key: 'novel_id',
    detail: {
      url: '/v2/novel/detail',
      then: data => new PixivNovel(data.novel)
    },
    text: {
      url: '/v1/novel/text'
    },
    bookmarkDetail: {
      url: '/v2/novel/bookmark/detail',
      then: data => data.bookmark_detail
    },
    comments: {
      url: '/v2/novel/comments',
      then: collect('comment')
    },
    related: {
      url: '/v2/novel/related',
      then: collect('novel')
    },
  },
  comment: {
    _default: 'replies',
    _key: 'comment_id',
    replies: {
      url: '/v1/illust/comment/replies',
      then: collect('comment')
    }
  },
  series: {
    _default: 'detail',
    _key: 'series_id',
    detail: {
      url: '/v1/novel/series',
      then: collect('novel')
    }
  },
  get_users: {
    _default: 'recommended',
    recommended: {
      url: '/v1/user/recommended',
      then: collect('user')
    },
  },
  get_illusts: {
    _default: 'recommended',
    walkthrough: {
      url: '/v1/walkthrough/illusts',
      then: collect('illust')
    },
    new: {
      url: '/v1/illust/new',
      options: {
        content_type: 'illust'
      },
      then: collect('illust')
    },
    follow: {
      url: '/v2/illust/follow',
      options: {
        restrict: 'all'
      },
      then: collect('illust')
    },
    recommended: {
      url: '/v1/illust/recommended',
      options: {
        include_ranking_illusts: true
      },
      then: collect('illust')
    },
    ranking: {
      url: '/v1/illust/ranking',
      options: {
        mode: 'day'
      },
      then: collect('illust')
    },
    myPixiv: {
      url: '/v2/illust/mypixiv',
      then: collect('illust')
    },
    trendingTags: {
      url: '/v1/trending-tags/illust',
      then: data => data.trend_tags
    }
  },
  get_mangas: {
    _default: 'recommended',
    recommended: {
      url: '/v1/manga/recommended',
      options: {
        include_ranking_label: true
      },
      then: collect('illust')
    },
    new: {
      url: '/v1/illust/new',
      options: {
        content_type: 'manga'
      },
      then: collect('illust')
    }
  },
  get_novels: {
    _default: 'recommended',
    new: {
      url: '/v1/novel/new',
      options: {
        content_type: 'illust'
      },
      then: collect('novel')
    },
    follow: {
      url: '/v1/novel/follow',
      options: {
        restrict: 'all'
      },
      then: collect('novel')
    },
    recommended: {
      url: '/v1/novel/recommended',
      options: {
        include_ranking_novels: true
      },
      then: collect('novel')
    },
    ranking: {
      url: '/v1/novel/ranking',
      options: {
        mode: 'day'
      },
      then: collect('novel')
    },
    myPixiv: {
      url: '/v1/novel/mypixiv',
      then: collect('novel')
    },
    trendingTags: {
      url: '/v1/trending-tags/novel',
      then: data => data.trend_tags
    }
  }
}

export function search(
  category: string,
  key?: string | number | null,
  type?: string,
  options?: StringMap<string>,
  callback?: (arg: any) => any
): Promise<any> {
  if (!SearchData[category]) {
    return Promise.reject(new RangeError(`"${category}" is not a supported category.`))
  }
  let search = SearchData[category][type]
  if (!search) {
    if (SearchData[category]._default) {
      search = SearchData[category][SearchData[category]._default]
    } else if (type) {
      return Promise.reject(new RangeError(`"${type}" is not a supported type.`))
    } else {
      return Promise.reject(new RangeError(`Type required.`))
    }
  }
  const query = { filter: 'for_ios' }
  if (SearchData[category]._key) {
    if (!key) return Promise.reject(new TypeError('key required'))
    query[SearchData[category]._key] = key
  }
  return authRequest(`${search.url}?${
    qs.stringify(Object.assign(query, search.options, toKebab(options)))
  }`, {}, callback || search.then)
}
