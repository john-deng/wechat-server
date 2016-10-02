var express = require('express');
var router = express.Router();

var wechat = require('wechat');
var config = require('../config.js');

console.log("wechat");
//console.log(config);

router.use('/', wechat(config, function (req, res, next) {
    // 微信输入信息都在req.weixin上
    var message = req.weixin;
    console.log(message);    
    if (message.FromUserName === 'diaosi') {
        // 回复屌丝(普通回复)
        res.reply('hehe');
    } else if (message.MsgType === 'text') {
        //你也可以这样回复text类型的信息
        if (message.Content === '首页') {
          // 回复高富帅(图文回复)
          res.reply([
            {
                title: '全员推广',
                description: '全员推广测试前端首页图文链接',
                picurl: 'http://appdev.mochasoft.com.cn/common/api/fs/group1/M00/00/00/wKhkSVfo5f6AGYDEAAHm3E-lgKQ369.jpg',
                url: 'http://cmostest.vpclub.cn/qytg/wechat/homePage?openid=' + message.FromUserName
            }
          ]);
        } else if (message.Content === 'oauth') {
          // 回复高富帅(图文回复)
          res.reply([
            {
                title: '全员推广',
                description: '全员推广测试后台微信授权获取用户信息之跳转图文链接',
                picurl: 'http://appdev.mochasoft.com.cn/common/api/fs/group1/M00/00/00/wKhkSVfo5f6AGYDEAAHm3E-lgKQ369.jpg',
                url: 'http://master.k8s.vpclub.cn/qytg/api/oauth/authorize'
                //url: 'http://cmostest.vpclub.cn/qytg/api/security/toIndex?id=' + message.FromUserName
            }
          ]);
        } else if (message.Content === '全员推广' ) {
          // 回复高富帅(图文回复)
          res.reply([
            {
                title: '全员推广',
                description: '全员推广测试阿里云后台跳转图文链接',
                picurl: 'http://appdev.mochasoft.com.cn/common/api/fs/group1/M00/00/00/wKhkSVfo5f6AGYDEAAHm3E-lgKQ369.jpg',
                url: 'http://cmostest.vpclub.cn/qytg/api/security/toIndex'
            }
          ]);
        } else {
          res.reply({
            content: 'text object: ' + message.Content,
            type: 'text'
          });
        }
    } else if (message.MsgType === 'voice') {
        // 回复一段音乐
        res.reply({
            type: "music",
            content: {
                title: "Play Music",
                description: "Music File Test",
                musicUrl: "https://ia802508.us.archive.org/5/items/testmp3testfile/mpthreetest.mp3",
                hqMusicUrl: "https://ia802508.us.archive.org/5/items/testmp3testfile/mpthreetest.ogg",
                thumbMediaId: "thisThumbMediaId"
            }
        });
    } else {
        console.log('unhandled message ...');
    }
}));

module.exports = router;

