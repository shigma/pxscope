const { Illust, Novel, User, Comment, Collection } = require('./util')
const collect = type => (data, api) => new Collection(api, type, data)

module.exports = {
  word: {
    _key: 'word',
    illust: {
      url: '/v1/search/illust',
      options() {
        return {
          target: 'partial_match_for_tags',
          sort: this.auth.user.is_preminum ? 'popular_desc' : 'date_desc'
        }
      },
      then: collect(Illust)
    },
    illustPopularPreview: {
      url: '/v1/search/popular-preview/illust',
      options: {
        target: 'partial_match_for_tags',
      },
      then: collect(Illust)
    },
    illustBookmarkRanges: {
      url: '/v1/search/bookmark-ranges/illust',
      options: {
        target: 'partial_match_for_tags',
      },
      then: collect(Illust)
    },
    novel: {
      url: '/v1/search/novel',
      options() {
        return {
          target: 'partial_match_for_tags',
          sort: this.auth.user.is_preminum ? 'popular_desc' : 'date_desc'
        }
      },
      then: collect(Novel)
    },
    novelPopularPreview: {
      url: '/v1/search/popular-preview/novel',
      options: {
        target: 'partial_match_for_tags',
      },
      then: collect(Novel)
    },
    novelBookmarkRanges: {
      url: '/v1/search/bookmark-ranges/novel',
      options: {
        target: 'partial_match_for_tags',
      },
      then: collect(Novel)
    },
    user: {
      url: '/v1/search/user',
      then: collect(User)
    },
    autoComplete: {
      url: '/v1/search/autocomplete',
      then: data => data.search_auto_complete_keywords
    }
  },
  user: {
    _key: 'user_id',
    detail: {
      url: '/v1/user/detail',
      then: (data, api) => new User(api, data)
    },
    illusts: {
      url: '/v1/user/illusts',
      then: collect(Illust)
    },
    novels: {
      url: '/v1/user/novels',
      then: collect(Novel)
    },
    bookmarkIllusts: {
      url: '/v1/user/bookmarks/illust',
      options: {
        restrict: 'public'
      },
      then: collect(Illust)
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
      then: collect(User)
    },
    following: {
      url: '/v1/user/following',
      options: {
        restrict: 'public'
      },
      then: collect(User)
    },
    follower: {
      url: '/v1/user/follower',
      then: collect(User)
    },
    followDetail: {
      url: '/v1/user/follow/detail',
      then: data => data.follow_detail
    }
  },
  illust: {
    _key: 'illust_id',
    detail: {
      url: '/v1/illust/detail',
      then: (data, api) => new Illust(api, data.illust)
    },
    bookmarkDetail: {
      url: '/v2/illust/bookmark/detail',
      then: data => data.bookmark_detail
    },
    comments: {
      url: '/v2/illust/comments',
      then: collect(Comment)
    },
    related: {
      url: '/v2/illust/related',
      then: collect(Illust)
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
    _key: 'novel_id',
    detail: {
      url: '/v2/novel/detail',
      then: (data, api) => new Novel(api, data.novel)
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
      then: collect(Comment)
    },
    related: {
      url: '/v2/novel/related',
      then: collect(Novel)
    },
  },
  comment: {
    _key: 'comment_id',
    replies: {
      url: '/v1/illust/comment/replies',
      then: collect(Comment)
    }
  },
  series: {
    _key: 'series_id',
    detail: {
      url: '/v1/novel/series',
      then: collect(Novel)
    }
  },
  get_users: {
    recommended: {
      url: '/v1/user/recommended',
      then: collect(User)
    },
  },
  get_illusts: {
    walkthrough: {
      url: '/v1/walkthrough/illusts',
      then: collect(Illust)
    },
    new: {
      url: '/v1/illust/new',
      options: {
        content_type: 'illust'
      },
      then: collect(Illust)
    },
    follow: {
      url: '/v2/illust/follow',
      options: {
        restrict: 'all'
      },
      then: collect(Illust)
    },
    recommended: {
      url: '/v1/illust/recommended',
      options: {
        include_ranking_illusts: true
      },
      then: collect(Illust)
    },
    ranking: {
      url: '/v1/illust/ranking',
      options: {
        mode: 'day'
      },
      then: collect(Illust)
    },
    myPixiv: {
      url: '/v2/illust/mypixiv',
      then: collect(Illust)
    },
    trendingTags: {
      url: '/v1/trending-tags/illust',
      then: data => data.trend_tags
    }
  },
  get_mangas: {
    recommended: {
      url: '/v1/manga/recommended',
      options: {
        include_ranking_label: true
      },
      then: collect(Illust)
    },
    new: {
      url: '/v1/illust/new',
      options: {
        content_type: 'manga'
      },
      then: collect(Illust)
    }
  },
  get_novels: {
    new: {
      url: '/v1/novel/new',
      options: {
        content_type: 'illust'
      },
      then: collect(Novel)
    },
    follow: {
      url: '/v1/novel/follow',
      options: {
        restrict: 'all'
      },
      then: collect(Novel)
    },
    recommended: {
      url: '/v1/novel/recommended',
      options: {
        include_ranking_novels: true
      },
      then: collect(Novel)
    },
    ranking: {
      url: '/v1/novel/ranking',
      options: {
        mode: 'day'
      },
      then: collect(Novel)
    },
    myPixiv: {
      url: '/v1/novel/mypixiv',
      then: collect(Novel)
    },
    trendingTags: {
      url: '/v1/trending-tags/novel',
      then: data => data.trend_tags
    }
  }
}
