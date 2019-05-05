const SOCKET_CONNECTING = 0;
const SOCKET_OPEN = 1;
const SOCKET_CLOSING = 2;
const SOCKET_CLOSED = 3;

let Protocol = require('./protocol');
let myUtils = require("./myUtils");
let pokerUtils = require("./pokerUtils");

const RoomStatus = {
    READY: 0,
    GAMING: 1,
}

class Room {
    constructor(rid){
        this.usersDic = new Map();
        this.rid = rid;

        this.rstat = 0; //房间状态 0准备，1游戏中

        this._seatOrder = 0;
        this._offlineOrder = [];

        this.cards = pokerUtils.create1pairPoker(true);    // 一副牌
    }

    addUser(user){
        if (this._offlineOrder.length > 0){
            user.seatOrder = this._offlineOrder.shift();
        } else{
            user.seatOrder = this._seatOrder;
            this._seatOrder ++;
        }

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

        this._offlineOrder.push(this.usersDic.get(uid).seatOrder);

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

    /**
     * 按照座次排序（给客户端用来确定座位显示）
     */
    getAllUsers(isSort){
        let users = [];
        this.usersDic.forEach((v,k,m)=>{
            users.push(v);
        });

        users.sort((a,b)=>{
            return a.seatOrder - b.seatOrder;
        });
    
        return users;
    }

    getUsersSize(){
        return this.usersDic.size;
    }

    /**
     * 
     * @param {String} msg 
     * @param {Number} exceptUid 排除的玩家
     */
    send(msg, exceptUid){
        this.usersDic.forEach((v,k,m)=>{
            if (v.uid != exceptUid && v._socket.readyState == SOCKET_OPEN){
                v._socket.send(msg);
            }
        });
    }

    /**
     * 
     * @param {Object} obj json obj
     * @param {Number} exceptUid 排除的玩家
     */
    sendObj(obj, exceptUid){
        // socket属性必须过滤，含有方法无法字符串化
        let str = myUtils.stringify(obj);
        this.send(str, exceptUid);
    }

    getUser(uid){
        let user = null;
        if (this.usersDic.has(uid)){
            user = this.usersDic.get(uid);
        }
        return user;
    }

    startGame(){
        this.rstat = RoomStatus.GAMING;
        // 发牌，每个人只知道自己的牌，防止抓包拿到别人的牌
        // todo: 先发三张，等待下注，然后发两张后开牌

        // let req = new Protocol.PushDeal();
    }

}

module.exports = Room;