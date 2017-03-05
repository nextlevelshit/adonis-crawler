'use strict'

const Crawler = require('crawler');
const url = require('url');

class TestController {

  * start(request, response) {
    const url = request.input('url')

    var c = new Crawler({
      maxConnections: 10,
      // This will be called for each crawled page
      callback: function (error, res, done) {
        if (error) {
          console.log(error)
        } else {
          var $ = res.$
          // $ is Cheerio by default
          //a lean implementation of core jQuery designed specifically for the server
          console.log($('title').text())
        }
        done()
      }
    })

    c.queue(url)

    console.log(request.only('url'))

    yield response.sendView('welcome', request.only('url'))
  }

}

module.exports = TestController
