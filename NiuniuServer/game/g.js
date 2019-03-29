let g = {};

let EventEmitter = require('events').EventEmitter;

g.eventEmitter = new EventEmitter();

g.rm1ElementFromArr = function(arr, ele){
    for (let index=0; index<arr.length; index++){
        if (arr[index] == ele){
            arr.splice(index,1);
            return;
        }
    }
};

module.exports = g;