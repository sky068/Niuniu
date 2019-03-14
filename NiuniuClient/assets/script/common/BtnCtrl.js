/**
 * Created by skyxu on 2018/3/13.
 * 该节点有button组件，通过接受消息来控制button的可用与不可用
 */

"use strict";

let GCONFIG = require("./GCONFIG");
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let btn = this.node.getComponent(cc.Button);
        if (!btn){
            return;
        } else{
            // btn.enableAutoGrayEffect = true;
            Global.eventManager.on(GCONFIG.EVENT_ONSPIN, this._onStartSpin, this);
            Global.eventManager.on(GCONFIG.EVENT_STOPSPIN, this._onStopSpin, this);
        }
    },

    _onStartSpin: function(){
        let btn = this.node.getComponent(cc.Button);
        btn.interactable = false;
    },
    _onStopSpin: function(){
        let btn = this.node.getComponent(cc.Button);
        btn.interactable = true;
    },

    // start () {

    // },

    onDestroy: function(){
        Global.eventManager.off(GCONFIG.EVENT_ONSPIN, this._onStartSpin);
        Global.eventManager.off(GCONFIG.EVENT_STOPSPIN, this._onStopSpin);
    }

    // update (dt) {},
});
