/**
 * Created by Wangjiawei 20170322
 */
"use strict"
const http = require('http')
const https = require('https')
const net = require('net')
const path = require('path')
const fs = require('fs')
const koa = require('./koa')
const co = require('co')
const cors = require('koa-cors')
const options = require('./config')
const log = require('./lib/log')
const utils = require('./lib/utils')
const proxy = require('./lib/middlewares')
const privatekey = path.join(__dirname, 'keys', 'privateKey.pem')
const certificate = path.join(__dirname, 'keys', 'certificate.pem')


let app = new koa
let httpServer, httpsServer, HTTPS_RANDOM_PORT = 0

process.on('uncaughtException', (err) => {
    log.error('uncaughtException: ' + err.message)
})

app.use(function* (next) {
    let start = new Date;
    yield next;
    let ms = new Date - start;
    // log.info(this.method + ' ' + this.url + ' ' + ms);
})

app.use(cors());

//本地替换
app.use(proxy.substitute(options.replace));
//代理跳转
app.use(proxy.forward())

httpServer = http.createServer((req, res) => {
    req.proxytype = 'http'
    app.callback(req, res)
}).listen(options.port)
httpsServer = https.createServer({
    key: fs.readFileSync(privatekey),
    cert: fs.readFileSync(certificate)
}, (req, res) => {
    req.proxytype = 'https'
    app.callback(req, res)
})

httpsServer.on('listening', () => {
    HTTPS_RANDOM_PORT = httpsServer.address().port
})

httpsServer.listen(HTTPS_RANDOM_PORT);

//connect https
co(function* httpsProxy() {
    httpServer.on('connect', (req, socket, head) => {
        let client = net.createConnection(HTTPS_RANDOM_PORT)

        client.on('connect', () => {
            // log.success('connect https server successfully')
            socket.write( "HTTP/1.1 200 Connection established\r\n\r\n")
        })

        socket.on('data', (chunk) => {
            client.write(chunk)
        })

        socket.on('end', () => {
            client.end()
        })

        socket.on('error', (err) => {
            client.end()
            log.error('socket error ' + err.message);
        })

        client.on('data', (chunk) => {
            socket.write(chunk)
        })

        client.on('end', () => {
            socket.end()
        })

        client.on('error', (err) => {
            socket.end()
            log.error('client error ' + err.message)
        })
    })
})

log.success('easyProxy started at port' + options.port + ' successfully!')


