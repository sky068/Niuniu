/**
 *  棋子位置编号
 * 
 *  0-------------1
 *  |  \          /
 *  |     \4  /
 *  |     /  \     *
 *  |  /        \ 
 *  2-------------3
 * 
 */

const SOCKET_CONNECTING = 0;
const SOCKET_OPEN = 1;
const SOCKET_CLOSING = 2;
const SOCKET_CLOSED = 3;
const MATCH_WAIT_TIME = 10;     // 匹配等待时间（默认10秒)

let TIMEOUT_FLAG = {};
let RANDOM_USER_POOL = [];
let GAME_ROOM_DIC = {};
let ONLINE_USER_DIC = {};
let LAST_IN_ROOM_ID = {};      // 玩家掉线之前所在房间id


let User = require("./user");
let Room = require("./room");
let Protocol = require("./protocol");
let g = require("./g");
let {query} = require("./../db/asyncDb");

class Chess {
    constructor(cid, lastBedIndex, isBlack){
        this.cid = cid;
        this.lastBedIndex = lastBedIndex;
        this.isBlack = isBlack;
        this.isSelected = false;
    }
}

let game_instance = null;
class Game {
    constructor(){
        // 当前存在的所有房间，索引为房间rid
        this.rooms = {};
        this.onlineUsers = [];

        g.eventEmitter.on("destroy_room", this.onDestroyRoom);
    }

    static getInstance(){
        if (!game_instance){
            game_instance = new Game();
        }
        return game_instance;
    }

    // 销毁房间
    onDestroyRoom(rid){
        console.log("destroy room: " + rid);

        let room = GAME_ROOM_DIC[rid.toString()];
        if (room){
            delete GAME_ROOM_DIC[rid.toString()];
        }
    }

    handleMsg(socket, msg){
        let request = JSON.parse(msg);
        switch (request.act){
            case 'heart':{
                let resp = new Protocol.HeartResponse();
                resp.act = request.act;
                resp.seq = request.seq;
                resp.t = Date.now();
                socket.send(JSON.stringify(resp));
                break;
            }
            case 'chat': {
                for (let w of wsRouter.clients){
                    w.send(msg);
                }
                break;
            }
            case 'rmatch': {
                Game.getInstance().randomMatch(socket, request);
                break;
            }
            case 'playChess': {
                Game.getInstance().playChess(socket, request);
                break;
            }
            case 'login': {
                Game.getInstance().login(socket, request);
                break;
            }
            case 'selectChess': {
                Game.getInstance().selectChess(socket, request);
                break;
            }
            case 'createRoom': {
                Game.getInstance().createNewRoom(socket, request);
                break;
            }
            case 'joinRoom': {
                Game.getInstance().joinRoom(socket, request);
                break;
            }
            default:
                break;
        }
    }

    dealUserOnline(socket){
        this.onlineUsers.push(socket);
    }

    dealOffline(socket){
        g.rm1ElementFromArr(this.onlineUsers, socket);

        let uid = socket.uid;
        let rid = socket.rid;
        if (uid){
            delete ONLINE_USER_DIC[uid.toString()];
            // 如果在匹配队列则移除队列
            this.exitRandomMatchPool(uid);
        }

        // 已经在游戏中，通知对方已经掉线
        if (rid) {
            let room = GAME_ROOM_DIC[rid.toString()];
            if (room){
                console.log('有人中途离开room ' + room.rid);
                room.leaveRoom(socket);
            }
        }
    }

    async login(socket, request){
        let resp = new Protocol.LoginResponse();
        resp.act = request.act;
        resp.seq = request.seq;

        let uid = request.uid;
        if (!uid || uid <= 0){
            console.log("尚未获得uid，开始分配uid");
            uid = await this.getRandomUid();
        } 

        let dataList = await this.getUserInfoFromDb(uid);

        if (!dataList || dataList.length <= 0){
            resp.err = 1;
            socket.send(JSON.stringify(resp));
        } else{
            let info = dataList[0];
            resp.uid = info.uid;
            resp.bid = info.bid;
            resp.coins = info.coins;
            resp.avatar = info.avatar;
            resp.nickname = info.nickname;
            let respStr = JSON.stringify(resp);
            console.log("login suc, userInfo = " + respStr);
            socket.send(respStr);
        }
    }

    async getUserInfoFromDb(uid){
        let sql = "SELECT * FROM `users` WHERE `uid`=" + uid + ";";
        let dataList = await query(sql);
        return dataList;
    }

    async getUidFromDb(uid) {
        let sql = "SELECT `uid` from `users` WHERE `uid`=" + uid + ";"
        let dataList = await query(sql);
        return dataList;
    }

    async getRandomUid(){
        let u = 100000 + Math.round(Math.random()*89999);
        let dataList = await this.getUidFromDb(u);
        if(dataList && dataList.length > 0){
            return await this.getRandomUid(u);
        }

        await query("INSERT INTO `users` (uid) values (" + u + ");");
        console.log("creat random uid:" + u);
        return u;
    }
    
    exitRandomMatchPool(uid){
        for (let index=0; index<RANDOM_USER_POOL.length; index++){
            if (RANDOM_USER_POOL[index].uid == uid){
                RANDOM_USER_POOL.splice(index,1);
            }
        }
    }
    
    randomMatch(socket, requestObj){
        let user = new User(socket, requestObj.data.uid)
        console.log("random pool size: " + RANDOM_USER_POOL.length);
        if (RANDOM_USER_POOL.length > 0){
            let other = RANDOM_USER_POOL.shift();
            let aRoom = new Room();
            aRoom.addUser(user);
            aRoom.addUser(other);
            aRoom.createRid();
            GAME_ROOM_DIC[aRoom.rid.toString()] = aRoom;
            // 方便断线重连时快速找到之前的房间
            LAST_IN_ROOM_ID[user.uid.toString()] = aRoom.rid;
            LAST_IN_ROOM_ID[other.uid.toString()] = aRoom.rid;

            let resp = new Protocol.RandomMatchResponse(requestObj.act, requestObj.seq);
            resp.data.rid = aRoom.rid;
            user.socket.rid = aRoom.rid;
            other.socket.rid = aRoom.rid;
            if (Math.random() < 0.5){
                resp.data.black = user.uid;
                resp.data.other = other.uid;
                user.isBlack = true;
                aRoom.order = user.uid;
                createUserChess(user, other);
            } else{
                resp.data.black = other.uid;
                resp.data.other = user.uid;
                other.isBlack = true;
                aRoom.order = other.uid;
                createUserChess(other, user);
            }
    
            function createUserChess(blackUser, whiteUser){
                // 创建黑色棋子id 2 3
                for (let i=2; i<=3; i++){
                    let chess = new Chess(i,i, true);
                    blackUser.chessDic[i.toString()] = chess;
                    aRoom.chessPanelFlag[i] = 1;
                }
    
                // 创建白色棋子id 0 1
                for (let i=0; i<=1; i++){
                    let chess = new Chess(i,i, false);
                    whiteUser.chessDic[i.toString()] = chess;
                    aRoom.chessPanelFlag[i] = 1;
                }
            }
    
            resp.data.order = resp.data.black;  // 黑子先走棋
    
            if (TIMEOUT_FLAG[user.uid.toString()] != null){
                clearTimeout(TIMEOUT_FLAG[user.uid.toString()]);
            }
            if (TIMEOUT_FLAG[other.uid.toString()] != null){
                clearTimeout(TIMEOUT_FLAG[other.uid.toString()]);
            }
            aRoom.send(JSON.stringify(resp));
        } else{
            RANDOM_USER_POOL.push(user);
        
            // 十秒钟匹配不到就失败
            TIMEOUT_FLAG[user.uid.toString()] = setTimeout(()=>{
                if (socket.readyState != SOCKET_OPEN){
                    return;
                }
                let resp = new Protocol.RandomMatchResponse(requestObj.act, requestObj.seq);
                resp.err = -1;
                console.log("匹配失败，没人加入.");
                user.socket.send(JSON.stringify(resp));
    
                // 离开随机匹配池
                Game.getInstance().exitRandomMatchPool(user.uid);
            }, MATCH_WAIT_TIME * 1000);
        }
    }
    
    playChess(socket, request) {
        let rid = socket.rid;
        let uid = request.data.uid;
        let dest = request.data.dest;
        let room = GAME_ROOM_DIC[rid.toString()];
        let resp = new Protocol.PushPlayChess();
        resp.act = request.act;
        resp.seq = request.seq;
    
        let cur = request.data.lastBedIndex;
        let destIndex = request.data.dest.index;
        let cid = request.data.cid;
        let ret = room.getIsCanMoveChess(cur, destIndex);
        if (!ret){
            console.log("走棋不合格，不能移动");
            resp.err = -1;
        } else{
            resp.data = {
                uid: uid,
                cid: cid,
                dest: dest,
                order: room.getOrderUid(request.data.uid)
            }
    
            room.playChess(uid, cid, destIndex);
            let winner = room.getWinner(uid);
            if (winner){
                resp.data.order = -1;
                resp.data.winner = winner;
                console.log("game over, " + winner + " win.");
                // todo: 重新开始，暂时直接销毁房间
                room.destroyRoom();
            }
        }
    
        room.send(JSON.stringify(resp));
    }

    selectChess(socket, request){
        let resp = new Protocol.PushSelectChess(request.data.cid);
        resp.act = request.act;
        resp.seq = request.seq;

        let rid = socket.rid;
        let room = GAME_ROOM_DIC[rid.toString()];
        room.selectChess(request.data.cid);

        room.send(JSON.stringify(resp));
    }

    createNewRoom(socket, request){
        // 用户只要调用过login则已经把uid绑定到socket上面, 否则就是没有登录成功.
        let user = new User(socket, socket.uid);
        let aRoom = new Room();
        aRoom.createRid();
        aRoom.addUser(user);
        user.socket.rid = aRoom.rid;
        GAME_ROOM_DIC[aRoom.rid.toString()] = aRoom;
            // 方便断线重连时快速找到之前的房间
        LAST_IN_ROOM_ID[user.uid.toString()] = aRoom.rid;

        let resp = new Protocol.CreateRoomResponse();
        resp.act = request.act;
        resp.seq = request.seq;
        resp.data.rid = aRoom.rid;

        aRoom.send(JSON.stringify(resp));
    }

    joinRoom(socket, request){

        let rid = request.data.rid;

        let room = GAME_ROOM_DIC[rid.toString()];
        if (!room){
            console.log("room " + rid + " 不存在.");
            return;
        } else{
            let resp = new Protocol.RandomMatchResponse("rmatch", 1);

            let userNew = new User(socket, socket.uid);
            userNew.socket.rid = rid;
            room.addUser(userNew);
            LAST_IN_ROOM_ID[userNew.uid.toString()] = rid;

            let userOld = room.getRival(socket.uid);
    
            if (Math.random() < 0.5){
                resp.data.black = userNew.uid;
                resp.data.other = userOld.uid;
                userNew.isBlack = true;
                room.order = userNew.uid;
                createUserChess(userNew, userOld);
            } else{
                resp.data.black = userOld.uid;
                resp.data.other = userNew.uid;
                userOld.isBlack = true;
                room.order = userOld.uid;
                createUserChess(userOld, userNew);
            }
    
            function createUserChess(blackUser, whiteUser){
                // 创建黑色棋子id 2 3
                for (let i=2; i<=3; i++){
                    let chess = new Chess(i,i, true);
                    blackUser.chessDic[i.toString()] = chess;
                    room.chessPanelFlag[i] = 1;
                }
    
                // 创建白色棋子id 0 1
                for (let i=0; i<=1; i++){
                    let chess = new Chess(i,i, false);
                    whiteUser.chessDic[i.toString()] = chess;
                    room.chessPanelFlag[i] = 1;
                }
            }
    
            resp.data.order = resp.data.black;  // 黑子先走棋

            room.send(JSON.stringify(resp));
        }

    }
}


module.exports = Game;