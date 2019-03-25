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

cc.Class({
    extends: cc.Component,

    properties: {
        uid: 0,
        avatar: cc.Sprite,
        nickNameLabel: cc.Label,
        nickName: {
            default:"Mark",
            notify(){
                this.nickNameLabel.string = this.nickName;
            }
        },
        coinsLabel: cc.Label,
        coins: {
            default: 999999,
            type: cc.Integer,
            min: 0,
            notify(){
                this.coinsLabel.string = this.coins;
            }
        },
        cardPanelLeft: cc.Node,
        cardPanelRight: cc.Node,
        cardPanelNode: cc.Node,
        menuNode: cc.Node,

        bankerSp: cc.Node,
        isBanker: {
            default: false,
            notify(){
                this.bankerSp.active = this.isBanker;
                this.betLabel.node.active = !this.isBanker;
            }
        },

        showMenu: {
            default: false,
            notify(){
                this.menuNode.active = this.showMenu;
            }
        },

        cowLabel: cc.Label,
        rewardLabel: cc.Label,

        betLabel: cc.Label,
        curBets: 0,         // 当前下注

        hands: [],

        typeReturn: null,    // 牌型信息@TypeReturn

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.clearHands();
    },

    start () {
    },

    initPlayer(name, avatar, coins){
        this.nickName = name;
        this.coins = coins;
        if (!avatar){
            // 随机一个头像
            cc.loader.loadRes("userIcons/user_icon_woman" + Utils.randomInteger(0,3), cc.SpriteFrame, (err, sf)=>{
                if (!err){
                    this.avatar.spriteFrame = sf;
                }
            });
        }
    },

    onBtnDown(send, data){
        let downNum = 0;
        data = parseInt(data);
        switch (data){
            case 1:{
                downNum = 10;
                break;
            }
            case 2:{
                downNum = 20;
                break;
            }
            case 3:{
                downNum = 50;
                break;
            }
            default:
                downNum = 10;
                break;
        }

        this.menuNode.active = false;
        this.payBet(downNum);
    },

    // 清空手牌
    clearHands(){
        this.cardPanelLeft.removeAllChildren();
        this.cardPanelLeft.width = 0;
        this.cardPanelRight.removeAllChildren();
        this.cardPanelRight.width = 0;
        this.hands = [];

        this.payBet(0);
        this.isBanker = false;
        this.showMenu = false;
        this.cowLabel.node.active = false;
        this.rewardLabel.node.active = false;
        this.typeReturn = null;
    },

    /**
     *
     * @param bet 下注，-1表示随机下注
     * @param delay 延迟操作，方便机器人控制
     */
    payBet(bet, delay){
        this.scheduleOnce(()=>{
            if (bet < 0){
                bet = [10,20,50][Utils.randomInteger(0,2)];
            }
            this.curBets = bet;
            this.betLabel.string = "下注:" + bet;
        }, delay != undefined ? delay : 0);
    },

    /**
     * 开启手牌
     * @param delay{Number} 延迟开牌(防止机器人同时开牌)
     */
    openHands(delay){
        this.scheduleOnce(()=>{
            let names = ["没牛", "牛1", "牛2", "牛3", "牛4", "牛5", "牛6", "牛7", "牛8", "牛9", "牛牛", "银牛", "炸弹", "五花牛", "五小牛"];
            this.typeReturn = getHandsType(this.hands);
            this.cowLabel.node.active = true;
            this.cowLabel.string = names[this.typeReturn.handsType];

            Global.audioMgr.playEffect(Global.audioMgr["effNiu_" + this.typeReturn.handsType]);

            // 把牌都翻开
            this.cardPanelLeft.removeAllChildren(true);
            for (let cardObj of this.typeReturn.nCards){
                let card = cc.instantiate(Global.assetMgr.cardPrefab);
                card.getComponent("CardCtrl").initCard(cardObj.point, cardObj.suit, true);
                card.x = card.y = 0;
                this.cardPanelLeft.addChild(card);
            }

            this.cardPanelRight.removeAllChildren(true);
            for (let cardObj of this.typeReturn.pCards){
                let card = cc.instantiate(Global.assetMgr.cardPrefab);
                card.getComponent("CardCtrl").initCard(cardObj.point, cardObj.suit, true);
                card.x = card.y = 0;
                this.cardPanelRight.addChild(card);
            }
        }, delay != undefined ? delay : 0);
    },

    addReward(coins){
        this.coins += coins;
        this.rewardLabel.string = (coins>0?"+":"") + coins;
        this.getComponent(cc.Animation).play("showReward");
    }


    // update (dt) {},
});
