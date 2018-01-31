/**
 * Created by Wangjiawei 20170322
 */
var proto = log.prototype;

function log () {
    if ( !(this instanceof log) ) return new log;
}

proto.print = function (msg) {
    console.log(msg);
}

proto.info  = function (msg) {
    msgTpl = '\033[36m[INFO] {{msg}} \033[0m';
    this.print(msgTpl.replace(/{{msg}}/, msg));
}

proto.success  = function (msg) {
    msgTpl = '\033[32m[success] {{msg}} \033[0m';
    this.print(msgTpl.replace(/{{msg}}/, msg));
}

proto.warn = function (msg) {
    msgTpl = '\033[33m[warn] {{msg}} \033[0m';
    this.print(msgTpl.replace(/{{msg}}/, msg));
}  

proto.error = function (msg) {
    msgTpl = '\033[31m[error] {{msg}} \033[0m';
    this.print(msgTpl.replace(/{{msg}}/, msg));
} 

module.exports = new log;