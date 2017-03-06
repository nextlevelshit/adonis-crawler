'use strict'

const Crawler = require('crawler')
const _ = require('lodash')

const FOLLOW_INTERNAL_EXTERNAL_LINKS = false
const SAVE_ANCHORS = false
const DEFAULT_PROTOCOL = 'http://'

class CrawlController {
  constructor(socket, request) {

    this.socket = socket
    this.request = request
    this.maxConnections = 10
    this.url = null
    this.links = []

    socket.on('start', (url) => {
      this.url = url

      console.log(`[starting to crawl ${url}]`)
      this.disable(true)
      this.crawler().queue(url)
    })
  }

  crawler() {
    return new Crawler({
      maxConnections: this.maxConnections,
      // This will be called for each crawled page
      callback: (error, res, done) => {
        error ? console.error(error) : this.findLinks(res.$)
        this.disable(false)
        done()
      }
    })
  }

  update(item) {
    this.socket.toEveryone().emit('update', item)
  }

  results(list) {
    console.log(`[sending results to front end]`)
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
    _.each($('a'), (anchor) => {

      var link = this.normalize(anchor.attribs.href)

      if (link) {
        this.links.push(link)
        this.update(link)
      }
    })
  }
}

module.exports = CrawlController
