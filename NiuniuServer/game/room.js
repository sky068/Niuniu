const SOCKET_CONNECTING = 0;
const SOCKET_OPEN = 1;
const SOCKET_CLOSING = 2;
const SOCKET_CLOSED = 3;

let Protocol = require('./protocol');
let myUtils = require("./myUtils");
let pokerUtils = require("./pokerUtils");
let config = require("./config");

const RoomStatus = {
    READY: 0,
    GAMING: 1,
}

class Room {
    constructor(rid){
        this.usersDic = new Map();
        this.rid = rid;

        this.rstat = 0;             // 房间状态 0准备，1游戏中
        this.mult = 1;              // 当前房间的倍数
        this._seatOrder = 0;        // 玩家的真实座次
        this._offlineOrder = [];    // 存储掉线的玩家的座次

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

    getBanerUser(){
        let banker = null;
        this.usersDic.forEach((v, k, m)=>{
            if (v.isBanker){
                banker = v;
            }
        });

        return banker;
    }

    startGame(){
        if (this.getUsersSize() < 2){
            // todo: 小于2不能开始游戏
            return;
        }

        // 清理游戏，准备下一局
        this.clearRoom();

        this.rstat = RoomStatus.GAMING;
        // 发牌，每个人只知道自己的牌，防止抓包拿到别人的牌
        // todo: 先发三张，等待下注，然后发两张后开牌

        // let req = new Protocol.PushDeal();
        // 牌堆不够，重新洗牌
        if (this.cards.length < this.getUsersSize() * 5){
            this.cards = pokerUtils.create1pairPoker(true);
        }
        this.dealCards(3, ()=>{
            setTimeout(() => {
                this.pushStartBet();
            }, this.getUsersSize() * config.T_DEAL);
        });
    }

    pushStartBet(){
        let expired = Date.now() + config.T_BET_WAITING;
        let resp = new Protocol.PushStartBet(expired);
        this.sendObj(resp);

        this._payT = setTimeout(() => {
            this.onPayBetTimeover();
        }, config.T_BET_WAITING);
    }

    /**
     * 发牌
     * @param {Number} count 张数
     * @param {Function} cb 回调
     */
    dealCards(count, cb){
        this.usersDic.forEach((user, k, m)=>{
            let aCards = this.cards.splice(0,count);
            aCards.forEach((v,i,a)=>{
                user._cards.push(v);
            });

            let resp = new Protocol.PushDeal();
            resp.cards = aCards;
            user._socket.send(myUtils.stringify(resp));
        });

        if (cb){
            cb();
        }
    }

    payBet(uid, bet){
        let user = this.getUser(uid);
        user._bet = bet;
        
        let resp = new Protocol.PushBet();
        resp.uid = uid;
        resp.bet = bet;
        this.sendObj(resp);

        let allPay = this._checkAllHasPay();
        if (allPay){
            if (this._payT != undefined){
                clearTimeout(this._payT);
            }

            // 开始发牌，然后开牌
            this.dealCards(2, ()=>{
                setTimeout(() => {
                    this.showCards();
                }, 1000);
            });
        }
    }

    // 下注时间到，开始再次发牌
    onPayBetTimeover(){
        console.log("下注时间到.");
        this.usersDic.forEach((user, k, m)=>{
            // 没下注的玩家自动下最小注
            if (!user.isBanker && user._bet == 0 && user._socket.readyState == SOCKET_OPEN){
                let resp = new Protocol.PushBet();
                resp.uid = user.uid;
                resp.bet = 10;
                this.sendObj(resp);
            }
        });
        this.dealCards(2, ()=>{
            setTimeout(() => {
                this.showCards();
            }, 1000);
        });
    }

    showCards(){
        // 计算奖金
        this.countReward();
        
        let resp = new Protocol.PushShowCards();
        this.usersDic.forEach((v, k, m)=>{
            resp.users.push({
                uid: v.uid,
                cards: v._cards,
                reward: v._reward,
            });
        });
        
        this.sendObj(resp);

        // 此时游戏结束，其他玩家可以加入
        this.rstat = RoomStatus.READY;
    }

    // 结算
    countReward(){
        console.log("结算");
        let banker = this.getBanerUser();
        let bankerReward = 0;

        this.usersDic.forEach((v, k, m)=>{
            if (v.uid != banker.uid){
                let r = v._bet * this._countMult(pokerUtils.getHandsType(v._cards));
                if (pokerUtils.compareCards(banker._cards, v._cards)){
                    // 庄家赢
                    bankerReward += r;
                    v._reward = -r;
                    v.coins += v._reward;
                } else{
                    // 闲家赢
                    bankerReward -= r;
                    v._reward = r;
                    v.coins += v._reward;
                }
            }
            banker._reward = bankerReward;
            banker.coins += bankerReward;
        });


        // this.scheduleOnce(()=>{
        //     // 开始下一局
        //     Dialog.show("继续玩？", "取消", "确定", ()=>{
        //         Global.loadScene("Lobby");
        //     }, ()=>{
        //         this.cleanGame();
        //         this.bankerSeat = this.nextBankerSeat;
        //         this.startGame();
        //     });
        // }, 1.5);
    }

    clearRoom(){
        this.usersDic.forEach((u, k, m)=>{
            u._cards = [];    // 手牌
            u._bet = 0;       // 下注
            u._reward = 0;    // 本局赢钱
        });
    }

    /**
     *  计算牌型倍数
     * @param typeReturn{TypeReturn}
     * 牛牛 this.mult倍，牛9减一倍，牛8减二倍，直到剩余一倍
     */
    _countMult(typeReturn){
        if (this.mult <= 1) return 1;
        let mult = 1;
        if (typeReturn.handsType == pokerUtils.HandsType.TYPE_NONE){
            mult = 1;
        }  else {
            mult = this.mult + (typeReturn.handsType - pokerUtils.HandsType.TYPE_NIUNIU);
        }

        mult = Math.max(mult, 1);
        return mult;
    }

    // 检测是否全部都下注了
    _checkAllHasPay(){
        let ret = true;
        this.usersDic.forEach((v, k, m)=>{
            if (v._bet <= 0 && !v.isBanker){
                ret = false;
            }
        });

        return ret;
    }

}

module.exports = Room;