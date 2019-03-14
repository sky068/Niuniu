/**
 * Created by skyxu on 2018/8/23.
 */

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        isOn: {
            default: true,
            notify: function () {
                this._updateState();
            }
        },

        interactable: true,

        bgOnSp: cc.Sprite,
        bgOffSp: cc.Sprite,
        barSp: cc.Sprite,

        switchEvents: {
            default: [],
            type: cc.Component.EventHandler
        },
    },

    _updateState(){
        if (this.isOn){
            this.barSp.node.x = this.bgOffSp.node.x + 10;
        } else {
            this.barSp.node.x = this.bgOnSp.node.x - 10;
        }
    },

    onLoad(){
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this);
    },

    onClick(event){
        if (!this.interactable){
            return;
        }
        this.isOn = !this.isOn;
        if (this.switchEvents){
            cc.Component.EventHandler.emitEvents(this.switchEvents, this);
        }
    },

    start(){

    }
});
