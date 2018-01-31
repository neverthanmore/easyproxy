/**
 * Created by Wangjiawei 20170322
 */
"use strict"
const http = require('http')
const https = require('https')
const constants = require('constants')
const url = require('url')
const utils = require('../utils')
const log = require('../log')
const Buffer = require('buffer').Buffer
const timeOut = require('../../config/index').timeOut * 1000
module.exports = function () {
	return function* forward (next) {
		let res = this.res
		let req = this.req
		let fullUrl = utils.getSpliceUrl(req)
		let bufferArr = []
		
		let options = {
			url: fullUrl,
			method: this.method,
			headers: req.headers,
		}
		if (utils.isContainBodyData(this.method)) {
			req.on('data', (chunk) => {
				bufferArr.push(chunk);
			})
			req.on('end', (chunk) => {
				options.data = Buffer.concat(bufferArr)
				request(options, function (err, data, proxyRes) {
					_handleForwardRequest (err, data, proxyRes, res)
				})
			})
		} else {
			request(options, function (err, data, proxyRes) {
				_handleForwardRequest (err, data, proxyRes, res)
			})
		}
		yield next
	}
}

//http.request 请求
function request (options, callback) {
	let _handleForwardRequest = callback
	let requestMethod = options.method || 'get'
	let requestHeaders = options.headers
	let bufferArr = []
	
	let requestUrl
	try{
		requestUrl = url.parse(options.url)
	}catch(e){
		_handleForwardRequest(new Error('Invalid url'));
      	return;
	}
	let requestOptions = {
		hostname: requestUrl.hostname,
		port: requestUrl.port || (requestUrl.protocol === 'https:' ? 443 : 80),
		method: requestMethod,
		path: requestUrl.path,
		headers: requestHeaders,
		rejectUnauthorized: false,
      	secureOptions: constants.SSL_OP_NO_TLSv1_2 // degrade the SSL version as v0.8.x used
	}

	let sender = requestUrl.protocol === 'https:' ? https : http
	//add 请求超时时间
	let requestTimeOut = setTimeout(() => {
		log.error('Request timeout for ' + options.url);
      	request.abort();
		_handleForwardRequest(new Error('请求超时'))
	}, timeOut)
	let request = sender.request(requestOptions, (res) => {
		clearTimeout(requestTimeOut);
		//add 响应超时时间
		let responseTimeout = setTimeout(() => {
			log.error('Response timeout for ' + options.url);
			request.abort();
			_handleForwardRequest(new Error('响应超时'));
			responseTimeout = null
		}, timeOut);
		res.on('data', (chunk) => {
			bufferArr.push(chunk);
		})
		res.on('end', () => {
			if (responseTimeout) {
				clearTimeout(responseTimeout)
			}
			log.success('Get the response of ' + options.url + ' at ' + new Date());
			_handleForwardRequest(null, Buffer.concat(bufferArr), res)
		})
	})


	if (options.data) {
		request.write(options.data)
	}

	request.on('error', (err) => {
		log.error('fetch ' + options.url + ' errorMsg:' + err.message)
	})

	request.end();
}

//forward 输出
function _handleForwardRequest (err, data, proxyRes, res) {
	if (err) {
		res.writeHead(404)
		res.end()
		return
	}

	res.writeHead(proxyRes.statusCode, proxyRes.headers)
	res.end(data)
}