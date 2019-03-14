/**
 * Created by skyxu on 2018/3/13.
 */

"use strict";

window.Global = window.Global || {};

let UiUpdater = require("./UiUpdater");
let GCONFIG = require("./GCONFIG");
let AudioMgr = require("./AudioMgr");
let IapMgr = require("./IAPMgr");
let DataMgr = require("./DataMgr");
let ViewMgr = require("./ViewMgr");
let UtilsCross = require("./UtilsCross");
let NetProxy = require("./../net/socket/NetProxy");

    /**
 * 全局事件管理器, 收发事件统一使用
 * esp: Global.eventMgr.on("event",function(){});
 */
Global.eventMgr = new cc.EventTarget();

// 用来刷新ui
Global.uiUpdater = new UiUpdater();

// 常驻节点，用来管理游戏流程
Global.gameMgr = null;

// 用来管理游戏assets（prefab etc.)
Global.assetMgr = null;

Global.effectMgr = null;

Global.config = GCONFIG;

// 用来管理游戏音频播放
Global.audioMgr = null;

Global.tips = null;

Global.iapMgr = IapMgr.getInstance();

Global.dataMgr = DataMgr.getInstance();

Global.viewMgr = ViewMgr.getInstance();

Global.utilsCross = UtilsCross;

Global.netProxy = new NetProxy();
Global.netProxy.init();

/**
 * hack preloadScene for add progress callback
 * @param _This
 * @param sceneName
 * @param onLoaded
 * @param onProgress
 */
Global.preloadScene = function(_This, sceneName, onLoaded, onProgress) {
    let director = cc.director;
    let info = director._getSceneUuid(sceneName);
    if (info) {
        director.emit(cc.Director.EVENT_BEFORE_SCENE_LOADING,sceneName);
        cc.loader.load({
            uuid: info.uuid,
            type: "uuid"
        }, null == onProgress ? null : function(e, a) {
            onProgress && onProgress.call(_This, e, a);
        }, function(error, asset) {
            error && cc.errorID(1215, sceneName, error.message);
            onLoaded && onLoaded(error, asset);
        });
    } else {
        let error = 'Can not preload the scene "' + sceneName + '" because it is not in the build settings.';
        onLoaded && onLoaded(new Error(error));
        cc.error("preloadScene: " + error);
    }
};

