var key = require('../utils/key');
var sync = require('synchronize');
var request = require('request');
var _ = require('underscore');


// The API that returns the in-email representation.
module.exports = function(req, res) {
  var term = req.query.text.trim();

  var response;
  try {
    response = sync.await(request({
      url: 'http://api.nytimes.com/svc/search/v2/articlesearch.json',
      qs: {
        'fq': '_id:' + term,
        'api-key': key
      },
      timeout: 10 * 1000
    }, sync.defer()));
  } catch (e) {
    res.status(500).send('Error');
    return;
  }

  var parsed_response = JSON.parse(response.body);
  var web_url = parsed_response['response']['docs'][0]['web_url'];
  var headline = parsed_response['response']['docs'][0]['headline']['main'];
  var lead_paragraph = parsed_response['response']['docs'][0]['lead_paragraph'];

  if (parsed_response['response']['docs'][0]['multimedia'][0]) {
    var image_url = 'http://www.nytimes.com/' + parsed_response['response']['docs'][0]['multimedia'][0]['url'];
    var image_width = parsed_response['response']['docs'][0]['multimedia'][0]['width'];
    var width = image_width > 600 ? 600 : image_width;
    var html = '<a href="' + web_url + '" style="text-decoration:none;"><img style="max-width:100%;" src="' +
                image_url + '" width="' + width + '"/></a>' +'<a href="' + web_url + 
                '" style="text-decoration:none; color:black;"><p style="max-width:' + image_width + 
                'px;"><font face="Georgia, Garamond, Times New Roman, serif">' + headline +
                '<br/> <i>' + lead_paragraph + '</i>' + '</font></a></p>';
    res.json({
      body: html
    });
  }
  else {
    var html = '<a href="' + web_url + '"style="text-decoration:none; color:black;"><p style="max-width:'+ 
                200 + 'px;"><font face="Georgia, Garamond, Times New Roman, serif">' + headline +
                '<br/> <i>' + lead_paragraph + '</i>' + '</font></p></a>';

    res.json({
      body: html
    });
  }  
};
