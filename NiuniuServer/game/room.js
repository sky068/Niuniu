const SOCKET_CONNECTING = 0;
const SOCKET_OPEN = 1;
const SOCKET_CLOSING = 2;
const SOCKET_CLOSED = 3;

let Protocol = require('./protocol');
let myUtils = require("./myUtils");

class Room {
    constructor(rid){
        this.usersDic = new Map();
        this.rid = rid;
    }

    addUser(user){
        this.usersDic.set(user.uid, user);
        let resp = new Protocol.PushEnterRoom(user);
        this.sendObj(resp, user.uid);
        console.log("user " + user.uid + " enter room:" + this.rid);
        console.log("room " + this.rid + ", user count:" + this.usersDic.size);
    }

    rmUser(uid){
        if (!this.usersDic.has(uid)){
            return;
        }

        if (this.usersDic.size <= 1){
            console.log("room " + this.rid + " 没有玩家了，可以销毁.");
            myUtils.eventEmitter.emit("destroy_room", this.rid);
        } else{
            let resp = new Protocol.PushExitRoom(this.usersDic.get(uid));
            this.sendObj(resp, uid);
            this.usersDic.delete(uid);
            console.log("user " + uid + " leave room:" + this.rid);
            console.log("room " + this.rid + ", user count:" + this.usersDic.size);
        }
    }

    getAllUsers(){
        let ret = [];
        this.usersDic.forEach((v,k,m)=>{
            ret.push(v);
        });
        return ret;
    }

    /**
     * 
     * @param {String} msg 
     * @param {Number} exceptUid 排除的玩家
     */
    send(msg, exceptUid){
        this.usersDic.forEach((v,k,m)=>{
            if (v.uid == exceptUid){
                return;
            }
            if (v.socket.readyState == SOCKET_OPEN){
                v.socket.send(msg);
            }
        });
    }

    /**
     * 
     * @param {Object} obj json obj
     * @param {Number} exceptUid 排除的玩家
     */
    sendObj(obj, exceptUid){
        let str = JSON.stringify(obj, function(k, v){
            // socket属性必须过滤，含有方法无法字符串化
            if (k == "socket"){
                return undefined;
            } else{
                return v;
            }
        });

        this.send(str, exceptUid);
    }

    getUser(uid){
        let user = null;
        if (this.usersDic.has(uid)){
            user = this.usersDic.get(uid);
        }
        return user;
    }

}

module.exports = Room;