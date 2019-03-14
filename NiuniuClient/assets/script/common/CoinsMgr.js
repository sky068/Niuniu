/**
 * Created by skyxu on 2018/5/3.
 */

"use strict";

let DataMgr = require("./DataMgr");
// let AlertView = require("./../views/AlertViewCtrl");
let ViewMgr = require("./ViewMgr");

let CoinsMgr = cc.Class({
    ctor(){
    }
});

/**
 *
 * @param coins{Number}
 * @param sucCall{Function}
 * @param failedCall{Function}
 * @param toShop{Boolean} 金币不足是否进入商店(默认进入)
 */
CoinsMgr.costCoins = function (coins, sucCall, failedCall, toShop) {
    let playerObj = DataMgr.getInstance().playerObj;
    toShop = toShop===undefined?true:toShop;
    if (coins > playerObj.coins) {
        let call = null;
        if (toShop){
            call = ()=>{
                ViewMgr.getInstance().showShopView();
            }
        } else {
            call = failedCall;

        }
        // mark: 统一弹框提示
        // AlertView.showGreen("Alert", "You are out of coins. Visit the shop for more.", "OK", call);
        call();

    } else {
        playerObj.coins -= coins;
        Global.uiUpdater.updateUserCoins();
        if (sucCall) {
            sucCall();
        }
    }
};

/**
 *
 * @param coins{Number}
 * @param updateUi{Boolean} 默认true, 是否刷新ui
 */
CoinsMgr.addCoins = function (coins, updateUi) {
    let playerObj = DataMgr.getInstance().playerObj;
    let achieveObj = DataMgr.getInstance().achieveObj;

    playerObj.coins += coins;
    achieveObj.accCoins += coins;

    if (updateUi === undefined || updateUi === null){
        updateUi = true;
    }
    if (updateUi){
        Global.uiUpdater.updateUserCoins();
    }
};

module.exports = CoinsMgr;