'use strict';

var url = require('url');
var zlib = require('zlib');

var _ = require('./helpers');

module.exports = function(options, callback){

  var callbackDone = false,
      httpProtocol = options.url.indexOf('https') === 0 ? 'https' : 'http',
      requestData = url.parse(options.url),
      method = (options.method || 'get').toLowerCase(),
      isJson = options.json || false,
      headers = options.headers || {},
      isPost = method === 'post',
      postBody = isPost ? JSON.stringify(options.body) : null,
      contentLength = !!postBody ? Buffer.byteLength(postBody) : null,
      timeout = options.timeout || 5,
      setHeader = function(v, k){ requestData.headers[k] = v; };

  var respond = function(body, details){
    body = body.toString('utf-8');

    var error = details.response.statusCode !== 200 ? details.response.statusCode : null,
        response;

    if(isJson){
      try {
        callback(error, JSON.parse(body), details);
      } catch(e){
        return callback('json parsing error', null, details);
      }
    } else {
      callback(error, body, details);
    }
  };

  requestData.headers = {};
  requestData.method = method;

  _.each(headers, setHeader);
  setHeader('gzip', 'accept-encoding');

  if(isPost){
    setHeader(contentLength, 'content-length');
    setHeader('application/json', 'content-type');
  }

  var req = require(httpProtocol).request(requestData).on('response', function(response) {

    var body = [];
    var details = {
      response: {
        headers: response.headers,
        statusCode: response.statusCode
      }
    };

    response.on('data', function(chunk){
      body.push(chunk);
    }).on('end', function(){
      body = Buffer.concat(body);
      if(!callbackDone){
        callbackDone = true;

        if(response.headers['content-encoding'] === 'gzip'){
          zlib.gunzip(body, function(err, dezipped) {
            if(!!err){ return callback(err); }
            respond(dezipped, details);
          });
        } else {
          respond(body, details);
        }
      }
    });
  }).on('error', function(e){
    if(!callbackDone){
      callbackDone = true;
      callback(e);
    }
  });

  req.setTimeout(1000 * timeout, function(){
    if(!callbackDone){
      callbackDone = true;
      callback('timeout');
    }
  });

  if(isPost){
    req.write(postBody);
  }

  req.end();
};
