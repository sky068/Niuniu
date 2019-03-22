/**
 * Created by skyxu on 2019/3/22.
 */

"use strict";

let ViewBase = require("./../common/ViewBase");
let ViewMgr = require("./../common/ViewMgr");

let ToastCtrl = cc.Class({
    extends: ViewBase,

    properties: {
        content: cc.Label,
    },


    initView(content, t, cb){
        this.content.string = content;
        this._cb = cb;
        this._t = t;
    },

    _rmSelf(){
        if (this._cb){
            this._cb();
        }
        this.node.removeFromParent(true);
        this.node.destroy();
    },

    start(){
        this._t = this._t ? this._t : 1;
        this.scheduleOnce(this._rmSelf, this._t);
    }
});

/**
 * 提示框
 * @param content{String} 内容
 * @param t{Number} 停留时间
 */
ToastCtrl.showText = function (content, t, cb) {
    t = t?t:1;
    let toast = cc.instantiate(Global.assetMgr.toastPrefab);
    let tCtrl = toast.getComponent("ToastCtrl");
    tCtrl.initView(content, t, cb);
    ViewMgr.getInstance().pushViewImmediate(toast);
};


