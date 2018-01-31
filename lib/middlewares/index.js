/**
 * Created by Wangjiawei 20170322
 */
"use strict"
let proto = Object.create({});

['forward', 'substitute'].forEach((name) => {
	proto.__defineGetter__(name, () => {
		return require('./' + name)
	})
}) 


module.exports = proto