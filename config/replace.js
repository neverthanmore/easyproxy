/**
 * Created by Wangjiawei 20170322
 */
"use strict"
let path = require('path')
module.exports = [
    {
        webPattern: /^\/(j|s|img|f|z|ms|mj|static\/s)\/\d+\/(.*$)/,
    },
    {
        webPattern: /^\/(site)\/(.*$)/
    },
    {
        webPattern: '//m.tuniu.com/m2015/global/index',
        localFile: path.join(__dirname, '../', 'fakeJson', '1.json')
    },
    {
        webPattern: '//m.tuniu.com/api/user/OrderNew/AddInvoiceNew',
        localFile: path.join(__dirname, '../', 'fakeJson', 'addInvoiceNew.json')
    },
    {
        webPattern: '//m.tuniu.com/api/user/OrderNew/GetInvoiceInfoByCust',
        localFile: path.join(__dirname, '../', 'fakeJson', 'GetInvoiceInfoByCust.json')
    },
    {
        webPattern: '//m.tuniu.com/api/user/OrderNew/DeleteInvoiceInfo',
        localFile: path.join(__dirname, '../', 'fakeJson', 'DeleteInvoiceInfo.json')
    },
    {
        webPattern: '//m.tuniu.com/api/user/OrderNew/UpdateInvoiceInfo',
        localFile: path.join(__dirname, '../', 'fakeJson', 'UpdateInvoiceInfo.json')
    },
    {
        webPattern: '//m.tuniu.com/api/user/OrderNew/AddInvoiceInfo',
        localFile: path.join(__dirname, '../', 'fakeJson', 'AddInvoiceInfo.json')
    }
]