/**
 * Created by skyxu on 2018/5/3.
 *
 * 由于作用域问题，这里无法使用require来的模块
 */

"use strict";
let IapTools = IapTools || {};

// mark: 必须放到全局里，不然OC无法调用到
window.IapTools = IapTools;

/**
 *
 * @param key{String} 参考GCONFIG.IAPCFG
 * @param sucCallback{Function} 购买成功的回调
 * @param failedCallback{Function} 购买失败的回调
 * @returns {string}
 */
IapTools.buy = function (key, sucCallback, failedCallback) {
    if (Global.config.DEBUG_MODE){
        // mark: 测试模式直接购买成功
        IapTools.sucCallback = sucCallback;
        IapTools.onBuySuc(key);
        return;
    }

    if (!cc.sys.isNative) {
        cc.log("only native can use iap.");
        return;
    }

    IapTools.sucCallback = sucCallback;
    IapTools.failedCallback = failedCallback;

    let ret = "";
    if (cc.sys.platform === cc.sys.IPHONE || cc.sys.platform === cc.sys.IPAD) {
        ret = jsb.reflection.callStaticMethod("HKPayManagerSolitaire","applePay:", key);
    } else if(cc.sys.platform === cc.sys.ANDROID){
        // todo: Android
        cc.log("iaptools buy android:" + key);
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity","purchaseInApp", "(Ljava/lang/String;)V", key);
    }

    return ret;
};

// 购买订阅服务
IapTools.buySubs = function (key, sucCallback, failedCallback) {
    if (Global.config.DEBUG_MODE){
        // mark: 测试模式直接购买成功
        IapTools.sucCallback = sucCallback;
        IapTools.onBuySuc(key);
        return;
    }

    if (!cc.sys.isNative) {
        cc.log("only native can use iap.");
        return;
    }

    IapTools.sucCallback = sucCallback;
    IapTools.failedCallback = failedCallback;

    let ret = "";
    if (cc.sys.platform === cc.sys.IPHONE || cc.sys.platform === cc.sys.IPAD) {
        ret = jsb.reflection.callStaticMethod("HKPayManagerSolitaire","applePay:", key);
    } else if(cc.sys.platform === cc.sys.ANDROID){
        // todo: Android
        cc.log("iaptools buy android:" + key);
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity","purchaseSubs", "(Ljava/lang/String;)V", key);
    }

    return ret;
};

/**
 * 获取当前可用的订阅数 -1 查询失败 0 没有有效的订阅 >1 具有有效的订阅
  * @return {number}
 */
IapTools.getSubsSize = function () {
    let ret = 0;
    if (!cc.sys.isNative) {
        cc.log("only native can buySubs.");
        return ret;
    }

    if (cc.sys.platform === cc.sys.ANDROID) {
        ret = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity","getPurchasesSubsSize", "()I");
    }

    return ret;
};

/**
 * 恢复购买（每次从后台进入前台都会自动调用,一般不需要用户手动处理)
 * @param sucCallback{Function} 成功的回调
 * @param failedCallbace{Function} 失败的回调
 * @returns {string}
 */
IapTools.restorePurchase = function (sucCallback, failedCallback) {
    if (!cc.sys.isNative) {
        cc.log("only native can use iap.");
        return;
    }

    IapTools.sucCallback = sucCallback;
    IapTools.failedCallback = failedCallback;

    let ret = "";
    if (cc.sys.platform === cc.sys.IPHONE || cc.sys.platform === cc.sys.IPAD) {
        ret = jsb.reflection.callStaticMethod("HKPayManagerSolitaire","restorePurchase");
    }else if(cc.sys.platform == cc.sys.ANDROID){
        ret = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity","restorePurchase", "()Ljava/lang/String;");
        cc.log('restore suc ret:' + ret);
        let ret = JSON.parse(ret);
        cc.log(ret.length);
    }
    else {

    }

    return ret;
};

/**
 *
 * @param key{String} 参考GCONFIG.IAPCFG
 */
IapTools.onBuySuc = function (key) {
    cc.log("js购买成功. key=" + key);
    if (IapTools.sucCallback){
        IapTools.sucCallback(key);
        IapTools.sucCallback = null;
    }
};

/**
 *
 * @param code{String}
 */
IapTools.onBuyFailed = function (code) {
    cc.log("js购买失败. code=" + code);
    if (IapTools.failedCallback){
        IapTools.failedCallback(code);
        IapTools.failedCallback = null;
    }
};

IapTools.onRestoreFinished = function (ok, msg) {
    cc.log('IapTools.onRestoreFinished: ' + ok + ", " + msg);
    // mark: 目前只有vip订阅
    cc.log("js恢复购买成功.");
    if (IapTools.sucCallback){
        IapTools.sucCallback();
    }
};

/**
 * 验证vip订阅是否有效
 * @param ret {String} "true" or "false"
 */
IapTools.verifyVip = function (ret) {
    cc.log("js verify Vip:" + ret);
    if (ret === "true"){
        Global.dataMgr.iapObj.vipValid = true;
    } else {
        Global.dataMgr.iapObj.vipValid = false;
    }
};
