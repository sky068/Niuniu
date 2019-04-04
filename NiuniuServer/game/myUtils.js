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

module.exports = MyUtils;