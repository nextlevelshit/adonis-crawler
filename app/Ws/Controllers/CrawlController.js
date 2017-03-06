'use strict'

const Crawler = require('crawler');
const _ = require('lodash');

class CrawlController {

  constructor(socket, request) {
    this.socket = socket
    this.request = request
    this.maxConnections = 10
    this.url = null

    socket.on('start', (url) => {
      this.url = url

      // console.log(`starting to crawl ${url}`)
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

  disable(value) {
    this.socket.toEveryone().emit('disable', value)
  }

  find($) {
    console.log($('title').text())
  }

  findLinks($) {
    _.each($('a'), (link) => {
      console.log(link.attribs.href)
    })
  }
}

module.exports = CrawlController
