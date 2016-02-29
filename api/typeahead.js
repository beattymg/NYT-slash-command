var key = require('../utils/key');
var sync = require('synchronize');
var request = require('request');
var _ = require('underscore');


// The Type Ahead API.
module.exports = function(req, res) {
  var term = req.query.text.trim();
  if (!term) {
    res.json([{
      title: '<i>(enter a search term)</i>',
      text: ''
    }]);
    return;
  }

try {
    response = sync.await(request({
      url: 'http://api.nytimes.com/svc/search/v2/articlesearch.json',
      qs: {
        q: term,
        'api-key': key
      },
      timeout: 10 * 1000
    }, sync.defer()));
  } catch (e) {
    res.status(500).send('Error');
    return;
  }

  var parsed_response = JSON.parse(response.body);
  
  if (response.statusCode !== 200 || !response.body || !parsed_response['response']) {
    res.status(500).send('Error');
    return;
  }

  var results = _.chain(parsed_response['response']['docs'])
    .reject(function(article) {
      return !article || !article['headline']['main'] || !article['_id'];
    })
    .map(function(article) {
      return {
        title: article['headline']['main'],
        text: article['_id']
      };
    })
    .value();

  if (results.length === 0) {
    res.json([{
      title: '<i>(no results)</i>',
      text: ''
    }]);
  } else {
    res.json(results);
  }
};
