'use strict'

const Crawler = require('crawler');
const _ = require('lodash');

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

  normalize(link) {
    return link
  }

  findLinks($) {
    _.each($('a'), (link) => {
      if(link = this.normalize(link.attribs.href)) {
        this.links.push(link)
        this.update(link)
      }
    })
  }
}

module.exports = CrawlController
