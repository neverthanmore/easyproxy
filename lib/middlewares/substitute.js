/**
 * Created by Wangjiawei 20170322
 */
"use strict"
const fs = require('fs')
const path = require('path')
const mime = require('mime')
const utils = require('../utils')
const log = require('../log')
const basePath = require('../../config').basePath
module.exports = function (replaceRules) {
	return function* substitute (next) {
		let data = ''
		let req = this.req
		let res = this.res
		let regPath = utils.getPathByReq(req)
		let fullUrl = utils.getSpliceUrl(req).split('?')[0]
		let extName = utils.getExtName(utils.getSpliceUrl(req).split('?')[0])
		let fakePath = 'a.' + extName
		let testFlag = false
		// 验证basePath是否是绝对路径
		if ( !utils.isAbsolutePath(basePath) ) {
			log.error('basePath need to be absolute path')
			yield next
			return
		}
		//ttf后缀直接跳转
		// if (extName == 'ttf' || extName == 'woff') {
		// 	yield next
		// 	return
		// }
		for (let i = 0; i < replaceRules.length; i++) { 
			let orginalPattern = replaceRules[i].webPattern;
			let localFilePath = replaceRules[i].localFile
			yield doReplaceRule(orginalPattern, localFilePath)
			if (i+1 == replaceRules.length && !testFlag) {
				yield next
				return
			}
		}


		if (mime.lookup(fakePath).split('/').shift() !== 'image') {
			res.statusCode = 200
			res.setHeader('Content-Type', mime.lookup(fakePath));
			res.setHeader('Transfer-Encoding','chunked')
			res.end(data)
		}
		

		function* doReplaceRule (pat, lfp) {
			if (typeof pat === 'string') {
				//指定替换
				if ( (fullUrl == req.proxytype + ':' + pat) && fs.existsSync(lfp) ) {
					testFlag = !testFlag
					data += fs.readFileSync(lfp)
					fakePath = 'a.json'
				}
			} else {
				if (pat.test(regPath)) {
					testFlag = !testFlag
					let params = regPath.match(pat).slice(1)
					let type = params[0]
					let staticPath = params[1]
					switch (type) {
						case 'j':
							data = yield readLoaclFile('/js')
							break;
						case 's':
							data = yield readLoaclFile('/css')
							break;
						case 'img':
							data = yield readLoaclFile('/images')
							break;
						case 'f':
							data = yield readLoaclFile('/file')
							break;
						case 'z':
							data = yield readLoaclFile('/')
							break;
						case 'ms':
							data = yield readLoaclFile('/m2015/css')
							break;
						case 'mj':
							data = yield readLoaclFile('/m2015/js')
							break;
						case 'w/s':
							data = yield readLoaclFile('/wap/css')
							break;
						case 'w/j':
							data = yield readLoaclFile('/wap/js')
							break;
						case 'static/s':
							data = yield readLoaclFile('/css')
							break;
						default :
							data = yield readLoaclFile('/')
							break;
					}
					function* readLoaclFile (p) {
						let preFix = basePath
						staticPath = staticPath.split('?')[0]
						let list = staticPath.split(',')
						let fullPath = '', data = ''
						if (p) {
							preFix += p
						}
						//针对PC site/image 和 m站 site/m2015/image
						if (p == '/images' || /^images\/(.*$)/.test(staticPath) || /^m2015\/images\/(.*$)/.test(staticPath)) {
							res.statusCode = 200
							if (!fs.existsSync(path.join(preFix, staticPath))) {
								testFlag = false
							}else {
								fs.createReadStream(path.join(preFix, staticPath)).pipe(res)
							}
							
							return ''
						}

						if(list && list.length > 1) {
							for (let i=0; i<list.length; i++) {
								fullPath = path.join(preFix, list[i])
								// console.log(fullPath)
								data += ('/****************************'+list[i]+'/****************************/\n')
								if (fs.existsSync(fullPath)) { 
									data += yield readFileSync(fullPath)
								}else{
									log.error('本地文件：' + fullPath + ' 不存在')
								} 
							}
						}else{
							fullPath = path.join(preFix, staticPath)
							// console.log(fullPath)
							if (fs.existsSync(fullPath)) {
								data += yield readFileSync(fullPath)
							} else {
								testFlag = false
							}
						}
						return data
					}
				}
			}
		}
	}
}



function* readFileSync (path, encode) {
	return new Promise(function(reslove,reject){
		fs.readFile(path, encode, (err, data) => {
			if (err) {
				log.error('read file ' + path + ' failed')
				reject();
			}
			log.success('read file ' + path + ' success')
			reslove(data)
		});
	})
}