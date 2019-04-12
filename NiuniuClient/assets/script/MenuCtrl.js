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
        editBox: cc.EditBox,
        inputLayer: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.inputLayer.active = false;
    },

    start () {
        // 连接网络
        Global.netProxy.connect();
    },

    onBtnOpenRoom(){
        Global.netProxy.createRoom((resp)=>{
            Global.gameMgr.onOpenRoom(resp);
        });
    },

    onBtnEnterRoom(){
        this.inputLayer.active = false;
        let rid = parseInt(this.editBox.string);
        cc.log("join rid:" + rid);
        Global.netProxy.enterRoom(rid, (resp)=>{
            Global.gameMgr.onEnterRoom(resp);
        });
    },

    onBtnInput(){
        this.inputLayer.active = true;
    }
    // update (dt) {},
});
