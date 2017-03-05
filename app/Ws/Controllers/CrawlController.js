'use strict'

class CrawlController {

  constructor (socket, request) {
    this.socket = socket
    this.request = request

    socket.on('message', (message) => {
      console.log(message)
    })

    socket.on('start', (url) => {
      console.log(`starting to crawl ${url}`)
    })
  }
}

module.exports = CrawlController
