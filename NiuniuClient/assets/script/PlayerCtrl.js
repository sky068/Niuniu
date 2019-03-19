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
        nickName: cc.Label,
        coinsLabel: cc.Label,
        _coins: 999999,
        cardPanelLeft: cc.Node,
        cardPanelRight: cc.Node,
        cardPanelNode: cc.Node,
        menuNode: cc.Node,
        _cards: [],
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    initPlayer(name, avatar, coins){
        this.nickName.string = name;
        this.coinsLabel.string = this._coins = coins;
    },

    onBtnDown(send, data){
        cc.log("data:" + data);
        let downNum = 0;
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
                break;
        }
    },

    // update (dt) {},
});
