'use strict'

const debug = require('debug')

class CrawlController {

  * start(request, response) {
    const url = request.param('url')
    debug(request.all());
    yield response.sendView('welcome', url)
  }

}

module.exports = CrawlController
