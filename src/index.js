'use strict';

var url = require('url');
var zlib = require('zlib');

var _ = require('./helpers');

module.exports = function(options, callback){

  var callbackDone = false,
      httpProtocol = options.url.indexOf('https') === 0 ? 'https' : 'http',
      requestData = url.parse(options.url),
      method = options.method || 'get',
      isJson = options.json || false,
      headers = options.headers || {},
      isPost = method === 'post',
      postBody = isPost ? JSON.stringify(options.body) : null,
      contentLength = !!postBody ? Buffer.byteLength(postBody) : null,
      timeout = options.timeout || 5,
      setHeader = function(v, k){ requestData.headers[k] = v; };

  var respond = function(statusCode, body){
    body = body.toString('utf-8');

    var error = statusCode !== 200 ? statusCode : null,
        response;

    if(isJson){
      try {
        callback(error, JSON.parse(body));
      } catch(e){
        return callback('json parsing error');
      }
    } else {
      callback(error, body);
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

    response.on('data', function(chunk){
      body.push(chunk);
    }).on('end', function(){
      body = Buffer.concat(body);
      if(!callbackDone){
        callbackDone = true;

        if(response.headers['content-encoding'] === 'gzip'){
          zlib.gunzip(body, function(err, dezipped) {
            if(!!err){ return callback(err); }
            respond(response.statusCode, dezipped);
          });
        } else {
          respond(response.statusCode, body);
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
