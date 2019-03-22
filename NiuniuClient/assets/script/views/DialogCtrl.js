/**
 * Created by skyxu on 2018/6/12.
 */

"use strict";

let ViewBase = require("./../common/ViewBase");
let ViewMgr = require("./../common/ViewMgr");

let DialogCtrl = cc.Class({
    extends: ViewBase,

    properties: {
        btnLeft: cc.Node,
        btnRight: cc.Node,
        content: cc.Label,

        leftCall: null,
        rightCall: null
    },

    start(){

    },

    initView(content, lBtnTitle, rBtnTitle, lBtnCall, rBtnCall){
        this.content.string = content;
        if (lBtnTitle){
            this.btnLeft.getChildByName("Label").getComponent(cc.Label).string = lBtnTitle;
        } else {
            this.btnLeft.active = false;
        }

        if (rBtnTitle){
            this.btnRight.getChildByName("Label").getComponent(cc.Label).string = rBtnTitle;
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
    },

    onBtnRight(){
        this._rmSelf();

        if (this.rightCall){
            this.rightCall();
        }
    },

    _rmSelf(){
        this.node.removeFromParent(true);
        this.node.destroy();
    }
});

/**
 * 提示框
 * @param content{String} 内容
 * @param leftBtnTitle{String} 左侧按钮文字
 * @param rightBtnTitle{String} 右侧按钮文字
 * @param leftBtnCall{Function} 左侧按钮回调
 * @param rightBtnCall{Function} 右侧按钮回调
 */
DialogCtrl.show = function (content, leftBtnTitle, rightBtnTitle, leftBtnCall, rightBtnCall) {
    let alert = cc.instantiate(Global.assetMgr.dialogPrefab);
    alert.getComponent("DialogCtrl").initView(content, leftBtnTitle, rightBtnTitle, leftBtnCall, rightBtnCall);
    ViewMgr.getInstance().pushViewImmediate(alert);
};

/**
 * 一个绿色按钮提示
 * @param content{String} 内容
 * @param btnTitle{String} 按钮文字
 * @param btnCall{Function} 按钮回调
 */
DialogCtrl.showGreen = function (content, btnTitle, btnCall) {
    DialogCtrl.show(content, null, btnTitle, null, btnCall);
};

/**
 * 一个红色按钮提示
 * @param content{String} 内容
 * @param btnTitle{String} 按钮文字
 * @param btnCall{Function} 按钮回调
 */
DialogCtrl.showRed = function (content, btnTitle, btnCall) {
    DialogCtrl.show(content, btnTitle, null, btnCall, null);
};

