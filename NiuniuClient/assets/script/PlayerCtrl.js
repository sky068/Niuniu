// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
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
            }
        },

        betLabel: cc.Label,
        curBets: 0,         // 当前下注

        hands: [],

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
    },

    onBtnDown(send, data){
        let downNum = 0;
        switch (data){
            case "1":{
                downNum = 10;
                break;
            }
            case "2":{
                downNum = 20;
                break;
            }
            case "3":{
                downNum = 50;
                break;
            }
            default:
                break;
        }

        this.payBet(downNum);
    },

    // 清空手牌
    clearHands(){
        this.cardPanelLeft.removeAllChildren();
        this.cardPanelLeft.width = 0;
        this.cardPanelRight.removeAllChildren();
        this.cardPanelRight.width = 0;
        this.hands = [];
    },

    // 下注
    payBet(bet){
        this.curBets = bet;
        this.betLabel.string = "下注:" + bet;
        this.betLabel.node.runAction(cc.blink(0.3,2));
        this.menuNode.active = false;
    }


    // update (dt) {},
});
