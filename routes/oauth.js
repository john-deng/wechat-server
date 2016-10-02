var express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var OAuth = require('wechat-oauth');
var request = require('request');
var sha1 = require('sha1');
var path = require('path');
var config = require('../config.js');

//var app = express();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(cookieParser());
router.use(express.static('public'));


var appid = config.appid;
var appsecret = config.appsecret;

console.log('oauth');

//首先拼接url
router.use('/authorize',function(req,res){
    var wxUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize';
    // note that the domain of redirect_uri must be specified under 授权回调页面域名
    // here i used nginx proxy to forward api.supay.vpclub.cn to the oauth callback 
    var redirect_uri = 'http://api.supay.vpclub.cn/qytg/api/oauth/callback'; 
        redirect_uri = encodeURIComponent(redirect_uri);
        console.log('redirect_uri: ' + redirect_uri);

    var oauthUrl = 
        wxUrl + 
        '?appid=' + appid + 
        '&redirect_uri=' + redirect_uri +
        '&response_type=code' +
        '&scope=snsapi_userinfo' +
        '&state=STATE' +
        '#wechat_redirect';

    console.log('oauthUrl: ' + oauthUrl);
    res.redirect(oauthUrl);
});

//四步请求打法;
//第一步:获得code;
router.get('/callback',function(req,res){
    var code  = req.query.code;
    var url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + appid + '&secret=' + appsecret + '&code=' + code + '&grant_type=authorization_code';
    console.log('1. getting code, url: ' + url);
    console.log('   got code: ' + code);
    //第二步:获得token
    request.get(url,function(err,response,body) {
        var json = JSON.parse(body);
        var refreshUrl = 'https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=' + appid + '&grant_type=refresh_token&refresh_token=' + json.refresh_token;
        console.log('2. getting access_token, url: ' + refreshUrl); 
        //第三步:获得refreshtoken和openId;
        request.get(refreshUrl,function (err,response,refresh) {
            var json = JSON.parse(refresh);
            var infoUrl = 'https://api.weixin.qq.com/sns/userinfo?access_token=' + json.access_token + '&openid=' + json.openid + '&lang=zh_CN';
            console.log('    got access_token: ' + json.access_token);
            console.log('3. getting refreshtoken and openId, url: ' + infoUrl);
            //第四步:通过上一步刷新得来的refresh和openId请求用户信息;
            request.get(infoUrl,function(err,response,info) {
                var info = JSON.parse(info);
                console.log('4. finally got user info: ');
                console.log(info);
                res.send(info);
            });
        });
    });
});


router.get('/getUserInfo',function(req, res){
    console.log('getUserInfo() code: ' + req.query.code);    
    //console.log(req);

    var accountId = req.query.accountId;
    var code  = req.query.code;
    var url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + appid + '&secret=' + appsecret + '&code=' + code + '&grant_type=authorization_code';
    console.log('1. getting code, url: ' + url);
    console.log('   got code: ' + code);
    //第二步:获得token
    request.get(url,function(err,response,body) {
        var json = JSON.parse(body);
        var refreshUrl = 'https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=' + appid + '&grant_type=refresh_token&refresh_token=' + json.refresh_token;
        console.log('2. getting access_token, url: ' + refreshUrl);
        //第三步:获得refreshtoken和openId;
        request.get(refreshUrl,function (err,response,refresh) {
            var json = JSON.parse(refresh);
            var infoUrl = 'https://api.weixin.qq.com/sns/userinfo?access_token=' + json.access_token + '&openid=' + json.openid + '&lang=zh_CN';
            console.log('    got access_token: ' + json.access_token);
            console.log('3. getting refreshtoken and openId, url: ' + infoUrl);
            //第四步:通过上一步刷新得来的refresh和openId请求用户信息;
            request.get(infoUrl,function(err,response,info) {
                var userInfo = JSON.parse(info);
                console.log('4. finally got user info: ');
                console.log(userInfo);
                if ( null == info.errcode ) {
                var retVal = {
                    status: '1000',
                    returnCode: '1000',
                    message: 'success',
                    nickname: userInfo.nickname,
                    headimgurl: userInfo.headimgurl,
                    openid: userInfo.openid,
                    telnum: '13530908119'
                };
                console.log(retVal);
                retVal = JSON.stringify(retVal);
                console.log(retVal);
                res.send(retVal);
              }
            });
        });
    });
});


//1、设置api接口,使前端通过ajax可以获取jsapi-sdk;
router.get('/wechat/ticket',function (req, res) {
    var page = req.query.page;
    var t = {};
    var url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+appid+'&secret='+appsecret;
    //2、获取access_token;
    request.get(url,function(err, response, body) {
        var token = JSON.parse(body);
        var ticketUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + token.access_token + '&type=jsapi';
        //3、获取ticket并且生成随机字符串,时间戳,签名
        request.get(ticketUrl, function(err, response, ticket) {
            var data = JSON.parse(ticket);
            var timestamp = parseInt(new Date().getTime() / 1000);
            t.ticket = data.ticket;
            t.noncestr = sha1(new Date());
            t.timestamp = timestamp;
            var string = 'jsapi_ticket=' + t.ticket + '&noncestr=' + t.noncestr + '&timestamp=' + timestamp + '&url=' + page;
            t.signature = sha1(string);
            res.json(t);
        });
    });
});

module.exports = router;


