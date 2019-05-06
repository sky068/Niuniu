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
        scrollView: cc.Node,
        menu: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        // Global.audioMgr.playMusic(Global.audioMgr.roomMusic);
    },

    onBtnOffline(){
        cc.log("单机模式.");
        this.scrollView.active = true;
        this.menu.active = false;
        Global.config.ONLINE_MODE = false;
    },

    onBtnRoom(){
        Global.loadScene("Menu");
        Global.config.ONLINE_MODE = true;
    }

    // update (dt) {},
});
