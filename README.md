minimal-request [![Build Status](https://secure.travis-ci.org/matteofigus/minimal-request.png?branch=master)](http://travis-ci.org/matteofigus/minimal-request)
===============

[![NPM](https://nodei.co/npm/minimal-request.png?downloads=true)](https://npmjs.org/package/minimal-request)

A minimal opinionated dependency-free request client for node.js. 

* It supports just GET and POST
* It asks for gzip by default
* When response status is not 200, it returns an error with the status code. If not, it just gives you back the response
* Default timeout is 5 seconds. When request timesout, error is 'timeout'

```js
var request = require('minimal-request');

request({
  url: 'https://hello.com/blabla',
  method: 'post',
  body: { hi: 'hello' },
  json: true,
  headers: { 'accept-language': 'en-GB' },
  timeout: 5 // seconds
}, function(err, res){
  console.log(err);
  // -> something like 404 or null

  console.log(res);
  // -> Something like {hi: 1234}
});
```

# License
MIT