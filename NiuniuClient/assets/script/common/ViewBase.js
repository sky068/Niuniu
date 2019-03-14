/**
 * Created by skyxu on 2018/4/4.
 *
 * 所有的弹出框都要添加这个组件
 * 方便统一使用ViewManager进行管理
 * 如果子类重写了onDestroy则必须手动调用父类的onDestroy
 * 结构统一为:
 * node|
 *     |mask
 *     |root
 *          |sub node
 */

"use strict";

cc.Class({
    extends: cc.Component,

    properties:{
        onShowHandler: {
            default: null,
            type: cc.Component.EventHandler,
            tooltip: "视图显示时的回掉"
        },
        onHideHandler: {
            default: null,
            type: cc.Component.EventHandler,
            tooltip: "视图消失时的回掉"
        },

        aniClipShow: {
            default: null,
            type: cc.AnimationClip,
            tooltip: "出现动画"
        },

        aniClipHide: {
            default: null,
            type: cc.AnimationClip,
            tooltip: "消失动画"
        },

        mask: {
            default: null,
            type: cc.Node,
            tooltip: "半透明遮罩"
        },

        immediatelyHandle: {
            default: false,
            visible: false
        },

        _owner: null,   // viewMgr maybe null
    },

    showWithAni(){
        if (!this.aniClipShow && !this.aniClipHide){
            return;
        }
        let animation = this.node.getComponent(cc.Animation);
        if (!animation){
            animation = this.node.addComponent(cc.Animation);
        }
        if (this.aniClipHide){
            animation.addClip(this.aniClipHide, "aniHide");
        }
        if (this.aniClipShow){
            animation.addClip(this.aniClipShow, "aniShow");
            animation.play("aniShow").once("finished", function () {
                if (!this.immediatelyHandle && this.onShowHandler){
                    this.onShowHandler.emit();
                }
            }.bind(this));
            if (this.immediatelyHandle && this.onShowHandler){
                this.onShowHandler.emit();
            }
        } else {
            if (this.onShowHandler){
                this.onShowHandler.emit();
            }
        }
    },

    /**
     * called by ViewMgr
     */
    destroyWithAni(){
        let animation = this.node.getComponent(cc.Animation);
        if (this.aniClipHide){
            animation.play("aniHide").once("finished", function () {
                if (!this.immediatelyHandle && this.onHideHandler){
                    this.onHideHandler.emit();
                }
                this.node.destroy();
            }.bind(this));

            if (this.immediatelyHandle && this.onHideHandler){
                this.onHideHandler.emit();
            }
        } else {
            if (this.onHideHandler){
                this.onHideHandler.emit();
            }
            this.node.destroy();
        }
    },

    onDestroy(){
        if (this._owner){
            this._owner.onViewDestroy();
        }
    },

    onBtnClose(){
        this.destroyWithAni();
        Global.audioMgr.playEffect(Global.audioMgr.effBtnClose);
    }
});