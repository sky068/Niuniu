const SOCKET_CONNECTING = 0;
const SOCKET_OPEN = 1;
const SOCKET_CLOSING = 2;
const SOCKET_CLOSED = 3;


let Protocol = require('./protocol');

class Room {
    constructor(){
        this.userArr = [];
        this.userDic = {};
        this.rid = 0;
        this.order = 0;     // 当前走棋的uid
        this.chessPanelFlag = [0,0,0,0,0];     // 标记棋牌位置，0表示没有棋子 1表示已经有棋子
    }

    addUser(user){
        this.userArr.push(user);
        this.userDic[user.uid.toString()] = user;
    }

    createRid(rid){
        if (!rid){
            this.rid = Date.now();
        } else{
            this.rid = rid;
        }
    }

    /**
     * 
     * @param {String} msg 
     */
    send(msg){
        for (let user of this.userArr){
            if (user.socket.readyState == SOCKET_OPEN){
                user.socket.send(msg);
            }
        }
    }

    /**
     * @param {*} uid 用户id
     * @param {*} cur 当前棋子cid
     * @param {*} dest 目的位置index
     */
    playChess(uid, cid, dest){
        let user = this.getUser(uid);
        let chess = user.chessDic[cid.toString()];
        let lastBedIndex = chess.lastBedIndex;
        this.chessPanelFlag[dest] = 1;
        this.chessPanelFlag[lastBedIndex] = 0;
        chess.lastBedIndex = dest;
        console.log(this.chessPanelFlag.toString());
    }

    leaveRoom(socket){
        // 如果房间没人了则销毁房间，否则通知有人离开
        let destroy = true;
        for (let index=0; index<this.userArr.length; index++){
            if (this.userArr[index].socket.readyState == SOCKET_OPEN){
                destroy = false;
            }
        }
        
        if (destroy){
            this.destroyRoom();
        } else{
            let resp = new Protocol.PushExitRoom(socket.uid);
            this.send(JSON.stringify(resp));
        }
    }

    destroyRoom(){
        for (let user of this.userArr){
            user.socket.rid = 0;
        }
        global.eventEmiter.emit("destroy_room", this.rid);
    }

    // 获取下一个走棋的uid
    getOrderUid(uid){
        this.order = 0;
        if (this.userArr[0].uid == uid){
            this.order = this.userArr[1].uid;
        } else{
            this.order = this.userArr[0].uid;
        }
        return this.order;
    }

    getUser(uid){
        return this.userDic[uid.toString()];
    }

    /**
     * 获取胜利者
     * @param {*} lastUid 最后一个走棋的玩家uid
     */
    getWinner(lastUid){
        // 判断对手是否还能走棋
        let over = true;
        let flag = false;
        let rival = this.getRival(lastUid);
        for (let chessId in rival.chessDic){
            let chess = rival.chessDic[chessId];
            let lastPosIndex = chess.lastBedIndex;
            let neighborArr = this.getNeighborBedIndex(lastPosIndex);
            if (neighborArr){
                for (let bedIndex of neighborArr){
                    if (this.chessPanelFlag[bedIndex] == 0){
                        over = false;
                        flag = true;
                        break;
                    }
                }
                if (flag){
                    break;
                }
            }
        }

        // 游戏结束，返回赢家uid, 没结束返回0
        if (over){
            return lastUid;
        } else{
            return 0;
        }
    }

    /**
     * 获取对手玩家
     * @param {*} uid 
     */
    getRival(uid){
        for (let user of this.userArr){
            if (user.uid != uid){
                return user;
            }
        }
        return null;
    }

    /**
     * 判断是否可以移动
     * @param {Number} curIndex     当前所在位置索引
     * @param {Number} destIndex    目的位置索引
     */
    getIsCanMoveChess(curIndex, destIndex){
        curIndex = parseInt(curIndex);
        destIndex = parseInt(destIndex);
        return this.getDesIsInNeighbor(curIndex, destIndex) && !this.getIsHasChessInDest(destIndex);
    }

    /**
     * 判断目的位置是否在当前位置的相邻可走动位置列表里
     * @param {*} curIndex  当前所在位置索引
     * @param {*} desIndex  目的位置索引
     */
    getDesIsInNeighbor(curIndex, desIndex){
        let ns = this.getNeighborBedIndex(curIndex);
        if (ns){
            for (let i=0; i<ns.length; i++){
                if (desIndex == ns[i]){
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 获取当前位置的相邻可以走动（符合规则）的位置索引
     * @param {Number} curPosIndex 当前所在位置索引
     */
    getNeighborBedIndex(curPosIndex){
        let res = null;
        switch (curPosIndex){
            case 0:
                res = [1,2,4];
                break;
            case 1:
                res = [0,4];
                break;
            case 2:
                res = [0,3,4];
                break;
            case 3:
                res = [2,4];
                break;
            case 4:
                res = [0,1,2,3];
                break;
        }
        return res;
    }

    // 判断指定位置是否已经有棋子
    getIsHasChessInDest(dest){
        if (this.chessPanelFlag[dest] != 0){
            console.log("目的位置已经有棋子.");
            return true;
        }
        return false;
    }

    // 选中某个棋子
    selectChess(cid){
                for (let user of this.userArr){
            for (let c in user.chessDic){
                if (cid == c){
                    user.chessDic[c].isSelected = true;
                } else{
                    user.chessDic[c].isSelected = false;
                }
            }
        }
    }
}

module.exports = Room;