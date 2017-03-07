'use strict'

const Crawler = require('crawler')
const _ = require('lodash')

const FOLLOW_INTERNAL_EXTERNAL_LINKS = false
const SAVE_ANCHORS = false
const DEFAULT_PROTOCOL = 'http://'
const DEPTH_MAX = 10

class CrawlController {
  constructor(socket, request) {

    this.socket = socket
    this.request = request
    this.maxConnections = 10
    this.url = null
    this.baseUrl = null
    this.links = []
    this.linksCrawled = []
    this.depth = 0
    this.pause = false

    socket.on('start', (url) => {
      var link = {
        'url': url,
        'internal': true,
        'depth': this.depth
      }

      this.links = []
      this.linksCrawled = []
      this.url = url
      this.baseUrl = url
      this.links.push(link)

      //   this.disable(true)
      this.recursive(link)
    })

    socket.on('pause', () => {
      this.pause = !this.pause

      if(!this.pause) this.continue()
    })
  }

  continue() {
    var toCrawl = _.difference(this.links, this.linksCrawled)

    if (toCrawl) {
      this.recursive(toCrawl[0])
    }
  }


  recursive(link) {
    if(this.pause) return

    this.crawler().queue(link.url)
    this.linksCrawled.push(link)
  }

  crawler() {
    return new Crawler({
      maxConnections: this.maxConnections,
      // This will be called for each crawled page
      callback: (error, res, done) => {
        error ? console.error(error) : this.findLinks(res.$)
        // this.disable(false)
        this.continue()
        done()
      }
    })
  }

  update(item) {
    this.socket.toEveryone().emit('update', item)
  }

  results(list) {
    this.socket.toEveryone().emit('results', list)
  }

  disable(value) {
    this.socket.toEveryone().emit('disable', value)
  }

  find($) {
    console.log($('title').text())
  }

  normalize(href) {
    var link = {}
    var pattern = null
    // early return if href is not a string
    if (href === undefined) return
    // check in advance if link is internal
    if (href.substring(0, this.url.length) === this.url) {
      link.internal = true
    }
    // link is alreay normalized
    pattern = /^\w+:\/\//
    if (href.match(pattern)) {
      link.url = href
      return link
    }
    // link has no protocoll
    pattern = /^\/\//;
    if (href.match(pattern)) {
      link.url = href.replace(pattern, DEFAULT_PROTOCOL)
      return link
    }
    // internal link
    pattern = /^\/\w+/
    if (href.match(pattern)) {
      link.url = this.url + href
      link.internal = true
      return link
    }
    // internal link without trailing slash
    pattern = /^(\w\-*\_*)+\//
    if (href.match(pattern)) {
      link.url = this.url + href
      link.internal = true
      return link
    }
    // internal link with parameters
    pattern = /^\?/
    if (href.match(pattern)) {
      link.url = this.url + href
      link.internal = true
      return link
    }
    // only return a link, if passed any of the conditionals above
    return null
  }

  findLinks($) {
    if(!$) return

    _.each($('a'), (anchor) => {
      var link = this.normalize(anchor.attribs.href)

      if (link) {
        console.log('checking if link exists', link.url)
        if (_.includes(this.links, link)) {
          console.log('--> already existing')
          return
        }

        this.links.push(link)
        this.update(link)
      }
    })
  }
}

module.exports = CrawlController
