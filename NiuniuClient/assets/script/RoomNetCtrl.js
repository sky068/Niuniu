// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

let Utils = require("./common/UtilsOther");
let Toast = require("./views/ToastCtrl");
let Dialog = require("./views/DialogCtrl");
let playerObj = require("./common/DataMgr").getInstance().playerObj;
let RoomCtrl = require("./RoomCtrl");

cc.Class({
    extends: RoomCtrl,

    properties: {
        ridLabel: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 自己在正中间,座位号为2
        this.selfNodeCtrl = this.getPlayerNode(2).getComponent("PlayerCtrl");
        this.startBets = false;  // 开始下注
        this.bankerSeat = -1;    // 庄家座位号
        this.cardsArr = [];      // 当前牌堆
        this.nextBankerSeat = -1;    // 下一个庄家
        this.mult = Global.config.ROOM_MULT;
        this.betTimeLabel.node.parent.active = false;

        this.listenEvent();

        this.seatOrder = 0;  // 我的真实座次
        this.inRoomUserMap = new Map();
    },

    start () {
        this.schedule(this.myUpdate, 0.1);
        this.initGame();
        // this.startGame();

        Global.audioMgr.playMusic(Global.audioMgr.gameMusic);
    },

    listenEvent(){
        Global.netProxy.registerPush("pEnterRoom", this.onOtherUserEnterRoom, this);
        Global.netProxy.registerPush("pExitRoom", this.onOtherUserExitRoom, this);

        Global.eventMgr.on(Global.config.EVENT_OPEN_ROOM, this.onOpenRoom.bind(this));
        Global.eventMgr.on(Global.config.EVENT_ENTER_ROOM, this.onEnterRoom.bind(this));
    },

    onOpenRoom(event){
        let data = event.detail;
        let user = data.user;

        this.ridLabel.string = "rid:" + data.rid;

        // 初始化自己
        this.seats[2].active = true;
        this.selfNodeCtrl.initPlayerWithData(user);

        // 默认房主是庄家
        this.bankerSeat = 2;

        this.seatOrder = user.seatOrder;

        this.inRoomUserMap.set(user.uid, 2);
    },

    onEnterRoom(event){
        let data = event.detail;
        this.ridLabel.string = "rid:" + data.rid;
        this.seatOrder = this.__getSelfSeatOrder(data.users);

        for (let i=0; i<data.users.length; i++){
            let userObj = data.users[i];
            let seat = this.__getUserSeat(userObj.seatOrder);

            this.seats[seat].active = true;
            let userNodeCtrl = this.getPlayerNode(seat).getComponent("PlayerCtrl");
            userNodeCtrl.initPlayerWithData(userObj);
            this.bankerSeat = userObj.isBanker ? seat : this.bankerSeat;

            this.inRoomUserMap.set(data.users[i].uid, seat);
        }
    },

    __getSelfSeatOrder(users){
        for (let i=0; i<users.length; i++){
            if (users[i].uid == playerObj.uid){
                return users[i].seatOrder;
            }
        }

        return -1;
    },

    /**
     * 根据座次(真实座次)返回应该显示的座位号
     * @param {Number}seatOrder
     * @return {Number}
     * @private
     */
    __getUserSeat(seatOrder){
        let delta = 2 - this.seatOrder;
        let seat = seatOrder + delta;
        seat = seat >= 0 ? seat : (seat + 5);
        seat = seat < 5 ? seat : (seat - 5);
        return seat;
    },

    // 有其他玩家加入游戏
    onOtherUserEnterRoom(resp){
        let user = resp.user;
        let seat = this.__getUserSeat(user.seatOrder);

        let userNodeCtrl = this.getPlayerNode(seat).getComponent("PlayerCtrl");
        this.seats[seat].active = true;
        userNodeCtrl.initPlayerWithData(user);
        this.inRoomUserMap.set(user.uid, seat);
    },

    onOtherUserExitRoom(resp){
        let user = resp.user;
        let seat = this.inRoomUserMap.get(user.uid);
        this.seats[seat].active = false;
        this.inRoomUserMap.delete(user.uid);
    },

    initGame(){
        for (let s of this.seats){
            s.active = false;
        }
    },

    /**
     * 获取发牌顺序（座位号), 从庄家开始逆时针发牌
     * @return {Array}
     */
    getDealSeatOrder(){
        let order = [];
        let tmp = this.bankerSeat;
        while (tmp <= 4){
            order.push(tmp++);
        }
        tmp = 0;
        while (tmp < this.bankerSeat){
            order.push(tmp++);
        }

        return order;
    },

    /**
     * 清理游戏，方便开始下一局
     */
    cleanGame(){
        for (let i = 0; i<5; i++){
            let p = this.getPlayerNode(i).getComponent("PlayerCtrl");
            p.clearHands();
        }
    },

    /**
     * 通过座位号获取对应玩家节点
     * @param seatIndex
     * @return {cc.Node}
     */
    getPlayerNode(seatIndex){
        cc.assert(seatIndex >= 0 && seatIndex <= 4, "wrong seatIndex!");
        return this.seats[seatIndex].getChildByName("PlayerNode");
    },

    startGame(){
        // 金币不足无法继续
        if (Global.dataMgr.playerObj.coins < this.mult * 100 * 4){
            Dialog.show("金币不足" + this.mult * 50 * 4 + "，请充值.", null, "确定", null, ()=>{
                Global.loadScene("Lobby");
            });
            return;
        }

        this.getPlayerNode(this.bankerSeat).getComponent("PlayerCtrl").isBanker = true;

        this.scheduleOnce(()=>{
            if (Global.config.GAME_MODE < 5){
                // 下发牌后下注
                this.startDeal(Global.config.GAME_MODE, ()=>{
                    this.startBetDown();
                });
            } else {
                // 先下注后发牌
                this.startBetDown();
            }
        }, 1);
    },

    /**
     * 开始下注
     */
    startBetDown(){
        Toast.showText("请开始下注.", 1, ()=>{
            this.startBets = true;
            this.betsTime = Global.config.BETS_WAITING;
            this.robotDown();
        });
        Global.audioMgr.playEffect(Global.audioMgr.effMdls);
        this.selfNodeCtrl.showMenu = !this.selfNodeCtrl.isBanker;
    },

    /**
     * 给机器下注
     */
    robotDown(){
        // 自动给机器人下注
        let orders = this.getDealSeatOrder();
        for(let i = 0; i < orders.length; i ++){
            let seat = orders[i];
            let player = this.getPlayerNode(seat).getComponent("PlayerCtrl");

            if (seat === 2 || player.isBanker) continue;

            // 机器人自动加钱
            if (player.coins < this.mult * 100 * 4){
                player.coins = 100000;
            }
            player.payBet(-1, Math.random() + 0.5);
        }
    },

    /**
     * 开发发牌
     * @param count{Number} 发牌张数
     * @param cb{function} 回调函数
     */
    startDeal(count, cb){
        cc.log("开始发牌." + count + "张.");
        let t = 0;
        if (count > 0){
            let self = this;
            let zIndex = Global.config.LOCAL_ZINDEX_MAX;
            let root = self.cardHeapSeat.parent;
            let order = this.getDealSeatOrder();

            if (this.cardsArr.length < count * 5){
                cc.log("牌不够，洗牌.");
                this.cardsArr = create1pairPoker(true);
            }

            for (let seat of order){
                let cards = this.cardsArr.slice(0, count);
                sortBig2Samll(cards);
                this.cardsArr = this.cardsArr.slice(count);
                _dealAct(seat, cards);
            }

            // 执行发牌并展示动画
            function _dealAct(seat, cards) {
                let playerCtrl = self.getPlayerNode(seat).getComponent("PlayerCtrl");
                for (let i=0; i<cards.length; i++){
                    let cardObj = cards[i];
                    playerCtrl.hands.push(cardObj); // 发牌给玩家
                    let card = cc.instantiate(Global.assetMgr.cardPrefab);
                    card.getComponent("CardCtrl").initCard(cardObj.point, cardObj.suit, false);
                    card.scale = 0.5;
                    card.zIndex = zIndex;
                    let posOri = root.convertToNodeSpaceAR(root.convertToWorldSpaceAR(self.cardHeapSeat.getPosition()));
                    let posDes = root.convertToNodeSpaceAR(playerCtrl.cardPanelLeft.convertToWorldSpaceAR(cc.v2(0,0)));
                    root.addChild(card);
                    card.setPosition(posOri);
                    card.runAction(cc.sequence(cc.delayTime(t), cc.moveTo(0.1,posDes), cc.callFunc(()=>{
                        card.removeFromParent(true);
                        card.x = card.y = 0;
                        card.scale = 1;
                        card.getComponent("CardCtrl").showFace = seat === 2;
                        playerCtrl.cardPanelLeft.addChild(card);
                        Global.audioMgr.playEffect(Global.audioMgr.effFapai);
                    })));

                    t += 0.1;
                    zIndex --;
                }
            }
        }

        this.scheduleOnce(cb, t + 0.5);
    },

    // 开牌比较大小
    openHands(){
        cc.log("开始开牌");
        Global.audioMgr.playEffect(Global.audioMgr.effKaipai);

        Toast.showText("开牌!", 1, ()=>{
            let orders = this.getDealSeatOrder();
            let t = 0.6;
            for (let i=0; i<orders.length; i++){
                let seat = orders[i];
                this.getPlayerNode(seat).getComponent("PlayerCtrl").openHands(t * i);
            }

            this.scheduleOnce(this.countReward, t * orders.length);
        });
    },

    /**
     *  计算牌型倍数
     * @param typeReturn{TypeReturn}
     * 牛牛 this.mult倍，牛9减一倍，牛8减二倍，直到剩余一倍
     */
    countMult(typeReturn){
        if (this.mult <= 1) return 1;
        let mult = 1;
        if (typeReturn.handsType === HandsType.TYPE_NONE){
            mult = 1;
        }  else {
            mult = this.mult + (typeReturn.handsType - HandsType.TYPE_NIUNIU);
        }

        mult = Math.max(mult, 1);
        return mult;
    },

    // 结算
    countReward(){
        cc.log("结算");
        let banker = this.getPlayerNode((this.bankerSeat)).getComponent("PlayerCtrl");
        let bankerType = banker.typeReturn;
        let bankerReward = 0;

        let orders = this.getDealSeatOrder();
        orders.splice(0,1);
        for (let seat of orders){
            let player = this.getPlayerNode(seat).getComponent("PlayerCtrl");
            let pType = player.typeReturn;
            if (pType.handsType === HandsType.TYPE_NIUNIU){
                this.nextBankerSeat = seat;
            }
            if (compareHandsReturn(bankerType, pType)){
                // 庄家赢
                let multi = this.countMult(bankerType);
                bankerReward += player.curBets * multi;
                player.addReward(-player.curBets * multi);

            } else {
                // 闲家赢
                let multi = this.countMult(pType);
                bankerReward -= player.curBets * multi;
                player.addReward(player.curBets * multi);
            }
        }
        banker.addReward(bankerReward);

        Global.dataMgr.playerObj.coins = this.selfNodeCtrl.coins;
        Global.dataMgr.saveDataToLocal();

        this.scheduleOnce(()=>{
            // 开始下一局
            Dialog.show("继续玩？", "取消", "确定", ()=>{
                Global.loadScene("Lobby");
            }, ()=>{
                this.cleanGame();
                this.bankerSeat = this.nextBankerSeat;
                this.startGame();
            });
        }, 1.5);
    },

    myUpdate (dt) {
        if (!this.startBets){
            return;
        }

        this.betTimeLabel.string = Math.ceil(this.betsTime);
        this.betsTime -= dt;
        if (this.betsTime > 0){
            this.betTimeLabel.node.parent.active = true;
            let allOk = true;
            for(let seat of this.seats){
                let player = seat.getChildByName("PlayerNode").getComponent("PlayerCtrl");
                if(player.curBets <= 0 && !player.isBanker){
                    allOk = false;
                }
            }
            if (allOk){
                // 都下好注开始发牌
                this.startBets = false;
            }
        } else {
            // 超时自动下注最小bet, 按照顺序，逆时针开始
            let orders = this.getDealSeatOrder();
            for(let seat of orders){
                let player = this.getPlayerNode(seat).getComponent("PlayerCtrl");
                if(player.curBets <= 0){
                    player.onBtnDown(null,1);    // 超时自动下注最小bet
                    this.startBets = false;
                    cc.log("超时自动下注.");
                }
            }
        }

        // 已经下好注，开始发剩下的牌
        if (!this.startBets){
            this.betTimeLabel.node.parent.active = false;
            let cardCounts = Global.config.GAME_MODE < 5 ? (5-Global.config.GAME_MODE) : Global.config.GAME_MODE;
            this.startDeal(cardCounts, ()=>{
                this.openHands();
            });
        }
    },
});
