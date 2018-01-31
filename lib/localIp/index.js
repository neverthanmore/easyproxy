/**
 * Created by Wangjiawei 20170322
 */
"use strict"
const netInterface = require('os').networkInterfaces()

module.exports = function () {
    let address
    for (let k in netInterface) {
        netInterface[k].forEach((item) => {
            if (!item.internal && item.family === 'IPv4') {
                address = item.address
            } 
        })   
    }
    return address
}

