'use strict';

var _ = {
  each: function(obj, fn){
    if(_.isArray(obj)){
      for(var i = 0; i < obj.length; i++){
        fn(obj[i], i, obj);
      }
    } else {
      for(var el in obj){
        if(_.has(obj, el)){
          fn(obj[el], el, obj);
        }
      }
    }
  },
  has: function(obj, key){
    return !!obj && obj.hasOwnProperty(key);
  },
  isArray: function(input){
    return Object.prototype.toString.call(input) === '[object Array]';
  }
};

module.exports = _;