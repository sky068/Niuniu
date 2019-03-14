/**
 * Created by skyxu on 2018/3/27.
 */

"use strict";

let GCONFIG = require("./GCONFIG");

let ViewMgr = cc.Class({

    ctor: function() {

        /**
         *
         * @type {Array.<View>}
         * @private
         */
        this._views = [];

        this.rootNode = null;

        this._isShowing = false;    // 标记当前有view正在显示

        /**
         * @type {cc.Node}
         */
        this.loading = null;

        Global.eventMgr.on(GCONFIG.EVENT_CHANGE_SCENE, function () {
            this.beforeChangeScene();
        }, this);
    },

    statics:{
        _instance: null,
        getInstance(){
            if (!ViewMgr._instance){
                ViewMgr._instance = new ViewMgr();
            }
            return ViewMgr._instance;
        }
    },

    /**
     * 切换场景之前要调用一下，用来移除所有没有移除的view
     */
    beforeChangeScene(){
        cc.log("---before change scene.");
        this.removeAllView();
    },

    /**
     * 显示视图
     * @param {cc.Node} view inherit ViewBase
     * @param {Boolean} noMask
     * @param {Boolean} immediatelyHandle 是否立即开始调用回掉函数
     */
    pushView: function(view, noMask, immediatelyHandle) {
        this._pushViewAndInit(view, noMask, immediatelyHandle);
        view.getComponent("ViewBase")._owner = this;
        this._views.push(view);
        this._sortView();
        this._showNextView();
    },

    _pushViewAndInit(view, noMask, immediatelyHandle){
        let viewBase = view.getComponent("ViewBase");
        cc.assert(viewBase, "view must has component ViewBase or inherit ViewBase.");

        if (!this.rootNode){
            let root = cc.Canvas.instance.node;
            this.rootNode = new cc.Node;
            this.rootNode.width = root.width;
            this.rootNode.height = root.height;
            this.rootNode.setLocalZOrder(GCONFIG.LOCAL_ZINDEX_MAX);
            root.addChild(this.rootNode);
        }

        if(noMask && viewBase.mask){
            viewBase.mask.active = false;
        }
        viewBase.immediatelyHandle = immediatelyHandle !== undefined?immediatelyHandle:false;

    },

    // 独立于队列，直接显示
    pushViewImmediate(view, noMask, immediatelyHandle){
        this._pushViewAndInit(view, noMask, immediatelyHandle);
        view.getComponent("ViewBase").showWithAni();
        this.rootNode.addChild(view);
    },

    onViewDestroy(){
        this._isShowing = false;
        this._showNextView();
    },

    _sortView(){
        // todo:  可以对队列里的view按照某个顺序进行排序
    },

    _showNextView(){
        if (this._isShowing){
            return;
        }

        if (this._views.length < 0){
            return;
        }

        let view = this._views.shift();

        if (view){
            view.getComponent("ViewBase").showWithAni();
            this.rootNode.addChild(view);
            this._isShowing = true;
        } else {
            this._isShowing = false;
        }
    },

    removeAllView: function() {
        for(let i = 0; i < this._views.length; i++){
            let view = this._views[i];
            view.destroy();
        }
        if (this.loading){
            this.loading.parent = null;
            this.loading.destroy();
            this.loading = null;
        }
        if (this.rootNode){
            this.rootNode.parent = null;
            this.rootNode.destroy();
            this.rootNode = null;
        }
        this._views = [];
        this._isShowing = false;
    }
});

module.exports = ViewMgr;