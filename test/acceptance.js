'use strict';

var expect = require('chai').expect;
var TestServers = require('http-test-servers');

describe('minimal-request', function(){

  var request = require('../');
  var testServers, err, res, details;

  var initialise = function(opts, done){
    var routes = {
      route1: {
        route: '/getData200',
        statusCode: 200,
        response: { ok: 'yes' }
      },
      route2: {
        route: '/getData404',
        statusCode: 404,
        response: []
      },
      route3: {
        route: '/postData200',
        method: 'post',
        statusCode: 200,
        respondWithBody: true
      },
      route4: {
        route: '/postData500',
        method: 'post',
        statusCode: 500,
        respondWithBody: true
      },
      route5: {
        route: '/headerData',
        statusCode: 200,
        response: { ok: true },
        headers: {
          myheader: 1234567890
        }
      }
    };

    var servers = {
      server1: { port: 3006 },
      server2: { port: 3007, delay: 100 }
    };
    
    testServers = new TestServers(routes, servers);
    testServers.start(function(){
      request(opts, done);
    });
  };

  var cleanup = function(done){ testServers.kill(done); };

  var next = function(done){
    return function(e, r, d){
      err = e;
      res = r;
      details = d;
      done();
    };
  };

  describe('when requesting route with json=true and status=200', function(){
    before(function(done){
      initialise({
        url: 'http://localhost:3006/getData200',
        json: true
      }, next(done));
    });

    after(cleanup);

    it('should get parsed response', function(){
      expect(res).to.eql({ok: 'yes'});
    });

    it('should not get any error', function(){
      expect(err).to.be.null;
    });
  });

  describe('when requesting route with json=false and status=200', function(){
    before(function(done){
      initialise({
        url: 'http://localhost:3006/getData200'
      }, next(done));
    });

    after(cleanup);

    it('should get not parsed response', function(){
      expect(JSON.parse(res)).to.eql({ ok: 'yes' });
    });

    it('should not get any error', function(){
      expect(err).to.be.null;
    });
  });

  describe('when requesting route with status!=200', function(){
    before(function(done){
      initialise({
        url: 'http://localhost:3006/getData404',
        json: true
      }, next(done));
    });

    after(cleanup);

    it('should get the status code as an error', function(){
      expect(err).to.be.equal(404);
    });

    it('should provide a response', function(){
      expect(res).to.eql([]);
    });
  });

  describe('when posting to a status=200', function(){
    before(function(done){
      initialise({
        url: 'http://localhost:3006/postData200',
        method: 'post',
        body: { hi: 'name' },
        json: true
      }, next(done));
    });

    after(cleanup);

    it('should get parsed response', function(){
      expect(res).to.eql({hi: 'name'});
    });

    it('should not get any error', function(){
      expect(err).to.be.null;
    });
  });

  describe('when posting to a status=200', function(){
    before(function(done){
      initialise({
        url: 'http://localhost:3006/postData200',
        method: 'POST',
        body: { hi: 'name' },
        json: true
      }, next(done));
    });

    after(cleanup);

    it('should get parsed response', function(){
      expect(res).to.eql({hi: 'name'});
    });

    it('should not get any error', function(){
      expect(err).to.be.null;
    });
  });

  describe('when getting to a route with response headers', function(){
    before(function(done){
      initialise({
        url: 'http://localhost:3006/headerData',
        method: 'GET',
        body: { hi: 'name' },
        json: true
      }, next(done));
    });

    after(cleanup);

    it('should get parsed response', function(){
      expect(res).to.eql({ok: true});
    });

    it('should not get any error', function(){
      expect(err).to.be.null;
    });

    it('should get the extra details', function(){
      expect(details.response.statusCode).to.equal(200);
      expect(details.response.headers.myheader).to.equal('1234567890');
    });
  });

  describe('when posting to a slow route with timeout set', function(){
    before(function(done){
      initialise({
        url: 'http://localhost:3007/getData200',
        json: true,
        timeout: 0.05
      }, next(done));
    });

    after(cleanup);

    it('should get error', function(){
      expect(err).to.eql('timeout');
    });

    it('should not get any response', function(){
      expect(res).to.be.undefined;
    });
  });
});