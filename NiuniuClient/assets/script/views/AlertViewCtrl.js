/**
 * Created by skyxu on 2018/6/12.
 */

"use strict";

let ViewBase = require("./../common/ViewBase");
let ViewMgr = require("./../common/ViewMgr");

let AlertViewCtrl = cc.Class({
    extends: ViewBase,

    properties: {
        btnLeft: cc.Node,
        btnRight: cc.Node,
        title: cc.Label,
        content: cc.Label,

        leftCall: null,
        rightCall: null
    },

    start(){

    },

    initView(title, content, lBtnTitle, rBtnTitle, lBtnCall, rBtnCall){
        this.title.string = title;
        this.content.string = content;
        if (lBtnTitle){
            this.btnLeft.getChildByName("title").getComponent(cc.Label).string = lBtnTitle;
        } else {
            this.btnLeft.active = false;
        }

        if (rBtnTitle){
            this.btnRight.getChildByName("title").getComponent(cc.Label).string = rBtnTitle;
        } else {
            this.btnRight.active = false;
        }

        if (lBtnCall){
            this.leftCall = lBtnCall;
        }

        if (rBtnCall){
            this.rightCall = rBtnCall;
        }
    },

    onBtnLeft(){
        this._rmSelf();

        if (this.leftCall){
            this.leftCall();
        }

        Global.audioMgr.playEffect(Global.audioMgr.effBtnClick);
    },

    onBtnRight(){
        this._rmSelf();

        if (this.rightCall){
            this.rightCall();
        }
        Global.audioMgr.playEffect(Global.audioMgr.effBtnClick);
    },

    _rmSelf(){
        this.node.removeFromParent(true);
        this.node.destroy();
    }
});

/**
 * 提示框
 * @param title{String} 标题
 * @param content{String} 内容
 * @param leftBtnTitle{String} 左侧按钮文字
 * @param rightBtnTitle{String} 右侧按钮文字
 * @param leftBtnCall{Function} 左侧按钮回调
 * @param rightBtnCall{Function} 右侧按钮回调
 */
AlertViewCtrl.show = function (title, content, leftBtnTitle, rightBtnTitle, leftBtnCall, rightBtnCall) {
    let alert = cc.instantiate(Global.assetMgr.alertPrefab);
    alert.getComponent("AlertViewCtrl").initView(title, content, leftBtnTitle, rightBtnTitle, leftBtnCall, rightBtnCall);
    ViewMgr.getInstance().pushViewImmediate(alert);
};

/**
 * 一个绿色按钮提示
 * @param title{String} 标题
 * @param content{String} 内容
 * @param btnTitle{String} 按钮文字
 * @param btnCall{Function} 按钮回调
 */
AlertViewCtrl.showGreen = function (title, content, btnTitle, btnCall) {
    AlertViewCtrl.show(title, content, null, btnTitle, null, btnCall);
};

/**
 * 一个红色按钮提示
 * @param title{String} 标题
 * @param content{String} 内容
 * @param btnTitle{String} 按钮文字
 * @param btnCall{Function} 按钮回调
 */
AlertViewCtrl.showRed = function (title, content, btnTitle, btnCall) {
    AlertViewCtrl.show(title, content, btnTitle, null, btnCall, null);
};

