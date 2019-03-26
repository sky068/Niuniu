/**
 * Created by skyxu on 2019/3/26.
 */

"use strict";

let ViewBase = require("./../common/ViewBase");
let ModeSelViewCtrl = cc.Class({
    extends: ViewBase,

    properties: {},

    start(){
        this._tmpMode = 3;
    },

    onToggleSelect(toggle, data){
        cc.log(data);
        this._tmpMode = parseInt(data);
    },

    onBtnOk(){
        Global.config.GAME_MODE = this._tmpMode;
        Global.loadScene("Room");
    }
});

ModeSelViewCtrl.show = function () {
    Global.viewMgr.pushView(cc.instantiate(Global.assetMgr.modeSelPre));
};
