/**
 * Created by skyxu on 2018/3/27.
 */

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        settingPrefab: cc.Prefab,
        shopPrefab: cc.Prefab,
        rulesPrefab: cc.Prefab,
        challengePrefab: cc.Prefab,
        alertPrefab: cc.Prefab,
        alertUnlockRolePrefab: cc.Prefab,
        baseTipShowViewPrefab :cc.Prefab,
        rankingPrefab: cc.Prefab,
        alertFbPrefab: cc.Prefab,
        offlineRewardPrefab: cc.Prefab,
        getCoinsResPrefab: cc.Prefab,
        achivePrefab: cc.Prefab,
        getPropAlertPrefab: cc.Prefab,
        dailyRewardPrefab: cc.Prefab,
        subscriptionPrefab: cc.Prefab,
        subsRewardPrefab: cc.Prefab,

        prefabTransitionNodeIn: cc.Prefab,
        prefabTransitionNodeOut: cc.Prefab,
    },

    onLoad: function () {
        Global.assetMgr = this;
        this.setAutoRelease(true);
    },

    setAutoRelease: function (autoRelease) {
        // FIXME: 当前未绑定任何prefab，暂时不需要执行以下代码
        // cc.loader.setAutoRelease(this.prefabGameSuc, autoRelease);
        // cc.loader.setAutoRelease(this.prefabGameFailed, autoRelease);
        // cc.loader.setAutoRelease(this.prefabSetting, autoRelease);
        // cc.loader.setAutoRelease(this.prefabShop, autoRelease);
        // cc.loader.setAutoRelease(this.prefabBaseTipShowView, autoRelease);
    },

    /**
     * 释放掉和游戏场景有关的资源
     */
    releaseGameRes: function(){
        // var slotsId = 6;
        // xlog("release game res.");
        // if (Global.assetManager.curSlotsIconAtlas){
        //     var depends = cc.loader.getDependsRecursively(Global.assetManager.curSlotsIconAtlas);
        //     cc.loader.release(depends);
        //
        //     // cc.loader.release(Global.assetManager.curSlotsIconAtlas);
        // }
        // var url = "slots_" + slotsId + "/animations";
        // cc.loader.releaseResDir(url);
    }
});