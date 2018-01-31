/**
 * Created by Wangjiawei 20170322
 */
"use strict"
const replaceRules = require('./replace')
const getLocalIp = require('../lib/localIp')
module.exports = {
    port: 3001,
    replace: replaceRules,
    localIp: getLocalIp(),
    timeOut: 10,                  //请求转发超时时间，防止页面有pending被挂起
    basePath: '/Users/wangjiawei/Sites/web_branch'
}