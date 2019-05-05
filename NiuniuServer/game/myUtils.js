let MyUtils = {};
let EventEmitter = require('events').EventEmitter;

MyUtils.eventEmitter = new EventEmitter();

MyUtils.rm1ElementFromArr = function(arr, ele){
    for (let index=0; index<arr.length; index++){
        if (arr[index] == ele){
            arr.splice(index,1);
            return;
        }
    }
};

/**
 * 将对象转成字符串，过滤'_'开头的字段
 * @param {Object} obj
 * @returns {String}
 */
MyUtils.stringify = function(obj){
    return JSON.stringify(obj, (k, v)=>{
        if (k.indexOf("_") == 0){
            return undefined;
        } else{
            return v;
        }
    })
};

module.exports = MyUtils;