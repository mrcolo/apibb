'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _nodeMetainspector = require('node-metainspector');

var _nodeMetainspector2 = _interopRequireDefault(_nodeMetainspector);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const routes = (0, _express.Router)();
//function to return an array with all the indexes where toSearch appears in str.
function allIndexOf(str, toSearch) {
  var indices = [];
  for (var pos = str.indexOf(toSearch); pos !== -1; pos = str.indexOf(toSearch, pos + 1)) {
    indices.push(pos);
  }
  return indices;
}

routes.get('/newbackground', (req, res) => {
  console.log("ciao");
  (0, _request2.default)('https://api.unsplash.com/search/photos?page=1&query=politics&client_id=973a11bf6f7bd816ef86e6248d6e87a727fc592b3512b6ea86f6dbb4b96eff81', function (error, response, body) {
    //parse body of response into JSON
    let result = JSON.parse(response.body);
    //generate random number and get a random result which will translate into a random image for the background of the app.
    let randomimg = Math.floor(Math.random() * result.results.length);
    //redirect me to the url of that random image.
    res.redirect(result.results[randomimg].urls.regular);
  });
});

routes.get('/retrieveData', (req, res) => {
  //get query q into variable url

  const url = req.query.q;
  //initialize metainspector
  const client = new _nodeMetainspector2.default(url, { timeout: 5000 });

  const options = {
    uri: url,
    transform: function (body) {
      return _cheerio2.default.load(body);
    }
  };

  client.on("fetch", function () {
    //when fetching, create a request-promise to a web-crawler which will load the body into the variable $.
    (0, _requestPromise2.default)(options).then($ => {
      //after the promise is returned, assign the body to a variable called textplain.
      let textplain = $("body").text();

      //get rid of html tags as they could confuse our machine learning algorithm.
      let junkHTMLfirst = allIndexOf(textplain, '<');
      let junkHTMLlast = allIndexOf(textplain, '>');
      for (var i = 0; i < junkHTMLfirst.length; i++) {
        textplain = textplain.replace(textplain.substring(junkHTMLfirst[i], junkHTMLlast[i] + 1), " ");
      }
      //start creating the result object
      let result = {
        source: url.substr(url.indexOf("www.") + 4, url.indexOf('.com') - 12),
        headline: client.title,
        author: client.author,
        text: textplain
        //generate the options for request to python server
      };let clientServerOptions = {
        uri: 'https://apybb.herokuapp.com/retrieveInfo',
        body: JSON.stringify(result),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
        //POST request to python server.
      };(0, _request2.default)(clientServerOptions, function (error, response) {
        res.end(response.body);
      });
    }).catch(err => {
      console.log(err);
      res.end("ERR");
    });
  });

  client.on("error", function (err) {
    console.log(err);
  });
  //fetch data using web-crawler.
  client.fetch();
});

exports.default = routes;
//# sourceMappingURL=routes.js.map