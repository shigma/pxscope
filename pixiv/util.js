class Collection {
  constructor(api, type, data = {}) {
    this._api = api
    this._type = type
    this.data = []
    if (data[type.COLLECT_KEY]) {
      this.hasData = true
      this._pushResult(data)
    } else {
      this.hasData = false
    }
  }

  _pushResult(result) {
    this.data.push(...result[this._type.COLLECT_KEY].map(item => {
      return item instanceof this._type ? item : Reflect.construct(this._type, [this._api, item])
    }))
    this.next = result.next_url
    this.limit = result.search_span_limit
  }

  extend() {
    if (!this.hasData) return Promise.reject(new Error('Initial data required.'))
    if (!this.next) return Promise.resolve(this.data)
    return this._api.authRequest(this.next, {}, result => this._pushResult(result))
  }
}

class PixivUser {
  constructor(api, data) {
    this._api = api
    this.user = data.user
    this.is_muted = data.is_muted
    this.profile = data.profile
    this.profile_publicity = data.profile_publicity
    this.workspace = data.workspace
    this._illusts = new Collection(api, PixivIllust, data)
    this._novels = new Collection(api, PixivNovel, data)
  }

  get id() {
    return this.user.id
  }

  search(...args) {
    return this._api.search('user', this.id, ...args)
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
      return this._illusts = new Collection(this._api, PixivIllust, data)
    })
  }

  novels() {
    if (this._novels.hasData) return Promise.resolve(this._novels)
    return this.search('novels', {}, (data) => {
      return this._novels = new Collection(this._api, PixivNovel, data)
    })
  }

  followers() {
    if (this._followers) return Promise.resolve(this._followers)
    return this.search('follower', {}, (data) => {
      return this._followers = new Collection(this._api, PixivUser, data)
    })
  }

  followings() {
    if (this._followings) return Promise.resolve(this._followings)
    return this.search('following', {}, (data) => {
      return this._followings = new Collection(this._api, PixivUser, data)
    })
  }

  follow(restrict = 'public') {
    return this._api.postRequest('/v1/user/follow/add', {
      user_id: this.id,
      restrict,
    })
  }

  unfollow() {
    return this._api.postRequest('/v1/user/follow/delete', {
      user_id: this.id
    })
  }
}

class PixivIllust {
  constructor(api, data) {
    Object.assign(this, data)
    this._api = api
    this.author = new PixivUser(api, { user: this.user })
  }

  search(...args) {
    return this._api.search('illust', this.id, ...args)
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
      return this._comments = new Collection(this._api, PixivComment, data)
    })
  }

  related() {
    if (this._related) return Promise.resolve(this._related)
    return this._api.search('illust', this.id, 'related', {}, (data) => {
      return this._related = new Collection(this._api, PixivIllust, data)
    })
  }

  addComment(comment) {
    if (!comment) return Promise.reject(new TypeError('comment required'))
    return this._api.postRequest('/v1/illust/comment/add', {
      illust_id: this.id,
      comment,
    })
  }

  addBookmark(tags = [], restrict = 'public') {
    if (!(tags instanceof Array)) return Promise.reject(new TypeError('invalid tags'))
    return this._api.postRequest('/v2/illust/bookmark/add', {
      illust_id: this.id,
      restrict,
      tags,
    })
  }

  deleteBookmark() {
    return this._api.postRequest('/v1/illust/bookmark/delete', {
      illust_id: this.id
    })
  }
}

class PixivNovel {
  constructor(api, data) {
    Object.assign(this, data)
    this._api = api
    this.author = new PixivUser(api, { user: this.user })
  }

  search(...args) {
    return this._api.search('novel', this.id, ...args)
  }

  addComment(comment) {
    if (!comment) return Promise.reject(new TypeError('comment required'))
    return this._api.postRequest('/v1/novel/comment/add', {
      novel_id: this.id,
      comment,
    })
  }

  addBookmark(tags = [], restrict = 'public') {
    if (!(tags instanceof Array)) return Promise.reject(new TypeError('invalid tags'))
    return this._api.postRequest('/v2/novel/bookmark/add', {
      novel_id: this.id,
      restrict,
      tags,
    })
  }

  deleteBookmark() {
    return this._api.postRequest('/v1/novel/bookmark/delete', {
      novel_id: this.id,
    })
  }
}

class PixivComment {
  constructor(api, data) {
    Object.assign(this, data)
    this._api = api
    this.author = new PixivUser(api, { user: this.user })
  }

  search(...args) {
    return this._api.search('comment', this.id, ...args)
  }

  replies() {
    if (this._replies) return Promise.resolve(this._replies)
    return this.search('replies', {}, (data) => {
      return this._replies = new Collection(this._api, PixivComment, data)
    })
  }
}

PixivIllust.COLLECT_KEY = 'illusts'
PixivNovel.COLLECT_KEY = 'novels'
PixivUser.COLLECT_KEY = 'user_previews'
PixivComment.COLLECT_KEY = 'comments'

module.exports = {
  Illust: PixivIllust,
  Novel: PixivNovel,
  Comment: PixivComment,
  User: PixivUser,
  Collection,
}