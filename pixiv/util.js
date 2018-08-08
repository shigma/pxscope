class Collection {
  constructor(api, array, type, data) {
    this._api = api
    this.next = data.next_url
    this.limit = data.search_span_limit
    this.hasData = !!data
    this.data = array instanceof Array
      ? array.map(item => item instanceof type
        ? item
        : Reflect.construct(type, [item, api]))
      : []
  }

  async extend() {
    if (!this.next) return this.data
    return this._api.authRequest(this.next, {}, (result) => {
      console.log(result)
      return result
    })
  }
}

class PixivUser {
  constructor(data, api) {
    this._api = api
    this.user = data.user
    this.is_muted = data.is_muted
    this.profile = data.profile
    this.profile_publicity = data.profile_publicity
    this.workspace = data.workspace
    this._illusts = new Collection(api, data.illusts, PixivIllust)
    this._novels = new Collection(api, data.novels, PixivNovel)
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
      return this._illusts = new Collection(this._api, data.illusts, PixivIllust, data)
    })
  }

  novels() {
    if (this._novels.hasData) return Promise.resolve(this._novels)
    return this.search('novels', {}, (data) => {
      return this._novels = new Collection(this._api, data.novels, PixivNovel, data)
    })
  }

  followers() {
    if (this._followers) return Promise.resolve(this._followers)
    return this.search('follower', {}, (data) => {
      return this._followers = new Collection(this._api, data.user_previews, PixivUser, data)
    })
  }

  followings() {
    if (this._followings) return Promise.resolve(this._followings)
    return this.search('following', {}, (data) => {
      return this._followings = new Collection(this._api, data.user_previews, PixivUser, data)
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
  constructor(data, api) {
    console.log(data)
    Object.assign(this, data)
    this._api = api
  }

  search(...args) {
    return this._api.search('illust', this.id, ...args)
  }

  author() {
    return Promise.resolve(new PixivUser({user: this.user}, this._api))
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
      return this._comments = new Collection(this._api, data.comments, PixivComment, data)
    })
  }

  related() {
    if (this._related) return Promise.resolve(this._related)
    return this._api.search('illust', this.id, 'related', {}, (data) => {
      return this._related = new Collection(this._api, data.illusts, PixivIllust, data)
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
  constructor(data, api) {
    Object.assign(this, data)
    this._api = api
  }

  search(...args) {
    return this._api.search('novel', this.id, ...args)
  }

  author() {
    return Promise.resolve(new PixivUser({user: this.user}, this._api))
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
  constructor(data, api) {
    Object.assign(this, data)
    this._api = api
  }

  search(...args) {
    return this._api.search('comment', this.id, ...args)
  }

  author() {
    return Promise.resolve(new PixivUser({user: this.user}, this._api))
  }

  replies() {
    if (this._replies) return Promise.resolve(this._replies)
    return this.search('replies', {}, (data) => {
      return this._replies = new Collection(this._api, data.comments, PixivComment, data)
    })
  }
}

PixivIllust.COLLECT_KEY = 'illusts'
PixivNovel.COLLECT_KEY = 'novels'
PixivUser.COLLECT_KEY = 'user_previews'
PixivComment.COLLECT_KEY = 'comments'

module.exports = {
  PixivIllust,
  PixivNovel,
  PixivComment,
  PixivUser,
  collect: type => (data, api) => new Collection(api, data[type.COLLECT_KEY], type, data)
}