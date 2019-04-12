
let Room = require('./room');
let myUtils = require("./myUtils");

let _roomMgrIns = null;
class RoomMgr{
    constructor(){
        this.roomsMap = new Map();      // 记录所有的房间
        this.userRoomMap = new Map();   // 记录玩家所在的房间，快速索引
    }

    /**
     * @returns new RoomMgr()
     */
    static getInstance(){
        if (!_roomMgrIns){
            _roomMgrIns = new RoomMgr();
            myUtils.eventEmitter.on("destroy_room", _roomMgrIns.destroyRoom.bind(_roomMgrIns));

        }
        return _roomMgrIns;
    }

    /**
     * @returns {Room}
     */
    createARoom(){
        let room = new Room(this.createRandomRid());
        this.roomsMap.set(room.rid, room);
        return room;
    }

    /**
     * 返回随机房间rid
     * @returns {Number} rid
     */
    createRandomRid(){
        let rid = 10000 + Math.round(Math.random()*89999);
        while(this.getRoom(rid) != null){
            rid = 10000 + Math.round(Math.random()*89999);
        }
        return rid;
    }

    /**
     * 根据房间id获取房间
     * @param {Number} rid 
     */
    getRoom(rid){
        if (!this.roomsMap.has(rid)){
            return null;
        }
        return this.roomsMap.get(rid);
    }

    /**
     * 获取用户所在的房间
     * @param {Number} uid 
     */
    getRoomOfUser(uid){
        if (!this.userRoomMap.has(uid)){
            return null;
        }

        return this.userRoomMap.get(uid);
    }

    destroyRoom(rid){
        if (this.roomsMap.has(rid)){
            this.roomsMap.delete(rid);
        }
    }

    /**
     * 把玩家加入指定房间
     * @param {User} user 
     * @param {Number} rid 
     * @returns {Boolean} 是否加入成功
     */
    addUserToRoom(user, rid){
        if (!user) return false;

        let ret = false;
        let room = this.getRoom(rid);
        if (room && room.getUsersSize() < 5 && room.rstat < 1){
            room.addUser(user);
            this.userRoomMap.set(user.uid, room);
            ret = true;
        }

        return ret;
    }

    rmUserFromRoom(uid){
        let room = this.getRoomOfUser(uid);
        if (room){
            room.rmUser(uid);
        }
    }

}

module.exports = RoomMgr;