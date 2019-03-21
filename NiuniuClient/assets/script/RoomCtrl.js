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
let DataMgr = require("./common/DataMgr");

cc.Class({
    extends: cc.Component,

    properties: {
        seats:[cc.Node],
        cardHeapSeat: cc.Node,
        betLabel: cc.Label,
        bet: {
            default: 1,
            type: cc.Integer,
            min: 1,
            max: 50,
            notify(){
                this.betLabel.string = this.bet + "倍场";
            }
        },
        betTimeLabel: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.selfNode = this.getPlayerNode(2);

        Global.eventMgr.on(Global.config.EVENT_USER_COINS_CHANGED, (event)=>{
            this.selfNode.getComponent("PlayerCtrl").coins = event.detail;
        }, this);

        this.startBets = false;  // 开始下注
        this.betsTime = 10;      // 等待下注时间
        this.bankerSeat = -1;    // 庄家座位号
        this.cardsArr = [];      // 当前牌堆
    },

    start () {
        this.schedule(this.myUpdate, 0.5);
        this.initGame();    // 初始化游戏
        this.cleanGame();   // 清理游戏，方便开始下一局
        this.startGame();
    },

    initGame(){
        let names = ["玛利亚", "波多", "吉野君", "椎名空", "筱田步美", "佐佐木明希", "高桥圣子", "三上悠亚", "水野朝阳"];
        // 随机4个玩家, 中间座位为自己
        for(let i=0; i<5; i++){
            if (i != 2){
                let index = Utils.randomInteger(0, names.length-1);
                let name = names[index];
                names.splice(index,1);
                let coins = parseInt(999999 * (0.5 + Math.random()));
                this.getPlayerNode(i).getComponent("PlayerCtrl").initPlayer(name, "", coins);
            }
        }

        // 初始化自己
        this.selfNode.getComponent("PlayerCtrl").coins = DataMgr.getInstance().playerObj.coins;

        // 开局随机一个庄家
        this.bankerSeat = Utils.randomInteger(0,4);
        this.getPlayerNode(this.bankerSeat).getComponent("PlayerCtrl").isBanker = true;

        // 初始化牌堆
        this.cardsArr = create1pairPoker(true);

    },

    /**
     * 获取发牌顺序（座位号)
     * @return {Array}
     */
    getDealSeatOrder(){
        let order = [];
        let tmp = this.bankerSeat;
        // 从庄家开始逆时针发牌
        while (tmp <= 4){
            order.push(tmp++);
        }
        tmp = 0;
        while (tmp < this.bankerSeat){
            order.push(tmp++);
        }

        return order;
    },

    cleanGame(){
        this.betsTime = 10;
        for (let i = 0; i<5; i++){
            let p = this.getPlayerNode(i).getComponent("PlayerCtrl");
            p.curBets = 0;
            p.clearHands();
            p.menuNode.active = true;
        }
    },

    getPlayerNode(seatIndex){
        cc.assert(seatIndex >= 0 && seatIndex <= 4, "wrong seatIndex!");
        return this.seats[seatIndex].getChildByName("PlayerNode");
    },

    startGame(){
        this.startBets = true;
    },

    myUpdate (dt) {
        if (!this.startBets){
            return;
        }
        this.betsTime -= dt;
        if (this.betsTime > 0){
            this.betTimeLabel.node.parent.active
            this.betTimeLabel.string = parseInt(this.betsTime);
            let allOk = true;
            for(let seat of this.seats){
                let player = seat.getChildByName("PlayerNode").getComponent("PlayerCtrl");
                if(player.curBets <= 0){
                    allOk = false;
                }
            }
            if (allOk){
                // 都下好注开始发牌
                this.startBets = false;
            }
        } else {
            // 超时自动下注最小bet
            for(let seat of this.seats){
                let player = seat.getChildByName("PlayerNode").getComponent("PlayerCtrl");
                if(player.curBets <= 0){
                    player.payBet(10);    // 超时自动下注最小bet
                    this.startBets = false;
                }
            }
        }

        if (!this.startBets){
            this.betTimeLabel.node.parent.active = false;
            this.startDeal();
        }
    },

    // 开始发牌
    startDeal(){
        cc.log("开始发牌.");
        let order = this.getDealSeatOrder();

        if (this.cardsArr.length < 15){
            cc.log("牌不够，洗牌.");
            this.cardsArr = create1pairPoker(true);
        }

        for (let seat of order){
            for (let i=0; i<5; i++){
                this.getPlayerNode(seat).getComponent("PlayerCtrl").hands.push(this.cardsArr.shift());
            }
        }

        for (let seat of order) {
            cc.log(JSON.stringify(this.getPlayerNode(seat).getComponent("PlayerCtrl").hands));
        }

    },
});
