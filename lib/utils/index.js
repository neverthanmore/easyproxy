/**
 * Created by Wangjiawei 20170322
 */
"use strict"
const url = require('url')
const fs = require('fs')
const path = require('path')
const os = require('os')
let utils = {
	/**
	 * https中的url只有path，所以需要从headers中获取hostname
	 * @param {Object} req
	 * @return {String}
	 */ 
	getSpliceUrl (req) {
		let hostAndPort = req.headers.host.split(':')
		let hostname = hostAndPort[0]
		let port = hostAndPort[1]

		let urlObject = url.parse(req.url, true);
		urlObject.protocol = urlObject.protocol || (req.proxytype + ':')
		urlObject.hostname = urlObject.hostname || hostname
		urlObject.port = !urlObject.port && port ? port : urlObject.port

		return url.format(urlObject)
	},
	/**
	 * 请求方式是否是post or put
	 * @param {String} http method token
	 * @return {Boolean}
	 */
	isContainBodyData (method) {
		if (!method) return false

		let methodList = ['post', 'put']
		return methodList.some((i) => {
			return i === method.toLowerCase()
		})
	},

	getPathByReq (req) {
		if (req.proxytype === 'https') {
			return req.url
		} else {
			return url.parse(req.url).path
		}
	},

	isAbsolutePath (filePath) {
		if(typeof filePath !== 'string'){
			return false;
		}

		if(os.platform && os.platform() === 'win32'){
			return ~filePath.indexOf(':');
		}else{
			return filePath.indexOf(path.sep) === 0;
		}
	},

	getExtName (urlPath) {
		return urlPath.split('.').pop()
	}
}


module.exports = utils