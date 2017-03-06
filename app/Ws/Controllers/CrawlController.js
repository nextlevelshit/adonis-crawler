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

      console.log(`starting to crawl ${url}`)
      this.crawler().queue(url)
    })
  }

  crawler() {
    return new Crawler({
      maxConnections: this.maxConnections,
      // This will be called for each crawled page
      callback: (error, res, done) => {
        error ? console.error(error) : this.findLinks(res.$)

        done()
      }
    })
  }

  find($) {
    console.log($('title').text())
  }

  findLinks($) {
    // console.log($('a'))
    _.each($('a'), (link) => {
      console.log(this.url + link.attribs.href)
    })
  }
}

module.exports = CrawlController
