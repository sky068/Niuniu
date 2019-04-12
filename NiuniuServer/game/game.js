
const SOCKET_CONNECTING = 0;
const SOCKET_OPEN = 1;
const SOCKET_CLOSING = 2;
const SOCKET_CLOSED = 3;


let User = require("./user");
let roomMgr = require("./roomMgr").getInstance();
let Protocol = require("./protocol");
let {query} = require("./../db/asyncDb");

let game_instance = null;
class Game {
    constructor(){
        this.usersOlMap = new Map();    // 记录在线的玩家
    }

    static getInstance(){
        if (!game_instance){
            game_instance = new Game();
        }
        return game_instance;
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
            case 'enterRoom': {
                Game.getInstance().enterRoom(socket, request);
                break;
            }
            default:
                break;
        }
    }

    dealUserOnline(socket){
        // 不在处理，调用过login才算登录成功才算在线
    }

    dealOffline(socket){
        let uid = socket.uid;
        if (!uid || uid < 0){
            return;
        }
        
        if (this.usersOlMap.has(uid)){
            this.usersOlMap.delete(uid);
        }

        roomMgr.rmUserFromRoom(uid);

        console.log("user " + uid + " now offline. users online num:" + this.usersOlMap.size);
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

            let user = new User(socket,info.uid, info.nickname, info.avatar, info.coins);
            this.usersOlMap.set(info.uid, user);
            // mark: 只要登录成功就把uid绑定到socket上面，方便掉线时快速查找到
            socket.uid = info.uid;

            console.log("user " + info.uid + " now online. users online num:" + this.usersOlMap.size);

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
        let u = 100000 + Math.round(Math.random()*899999);
        let dataList = await this.getUidFromDb(u);
        if(dataList && dataList.length > 0){
            return await this.getRandomUid(u);
        }

        await query("INSERT INTO `users` (uid) values (" + u + ");");
        console.log("creat random uid:" + u);
        return u;
    }

    createNewRoom(socket, request){
        let user = this.usersOlMap.get(request.uid);
        user.isBanker = true;
        let aRoom = roomMgr.createARoom();
        roomMgr.addUserToRoom(user, aRoom.rid);

        let resp = new Protocol.CreateRoomResponse();
        resp.act = request.act;
        resp.seq = request.seq;

        resp.rid = aRoom.rid;
        resp.user = user;

        let respStr = JSON.stringify(resp, function(k, v){
            // socket属性必须过滤，含有方法无法字符串化
            if (k == "socket"){
                return undefined;
            } else{
                return v;
            }
        });
        aRoom.send(respStr);
        console.log("creat room suc, rid = " + aRoom.rid);
    }

    enterRoom(socket, request){
        let resp = new Protocol.EnterRoomResponse();
        resp.act = request.act;
        resp.seq = request.seq;

        let rid = request.rid;
        let uid = request.uid;
        let user = this.usersOlMap.get(uid);

        let ret = roomMgr.addUserToRoom(user, rid);
        if (!ret ){
            console.log("room " + rid + " 不存在或者此时不能加入.");
            resp.err = 1;
            resp.msg = "room " + rid + " 不存在或者此时不能加入.";
        } else{
            let room = roomMgr.getRoom(rid);
            resp.users = resp.users.concat(room.getAllUsers());
            resp.rid = rid;
        }

        let respStr = JSON.stringify(resp, function(k, v){
            if (k == "socket"){
                return undefined;
            } else{
                return v;
            }
        });
        socket.send(respStr);
    }
    
}


module.exports = Game;