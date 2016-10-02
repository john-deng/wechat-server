var signature = require('wx_jsapi_sign');
var express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var OAuth = require('wechat-oauth');
var request = require('request');
var sha1 = require('sha1');
var path = require('path');
var config = require('../config.js');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(cookieParser());
router.use(express.static('public'));

var allowCrossDomain = function(req, res, next) {
    if ('OPTIONS' == req.method) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
      res.send(200);
    }
    else {
      next();
    }
};

router.use(allowCrossDomain);

console.log('signature');

router.post('/getSignature', function(req, res){
  var url = req.body.url;
  console.log(url);

  var cfg = {
    appId: config.appid,
    appSecret: config.appsecret,
    appToken: config.token,
    cache_json_file: '/tmp'
  }
  console.log(cfg);

  signature.getSignature(cfg)(url, function(error, result) {
        if (error) {
            console.log('getSignature failed');
            res.json({
                'error': error
            });
        } else {
            console.log('getSignature sucess');
            result.status = 0;
            res.json(result);
        }
    });
});

module.exports = router;

