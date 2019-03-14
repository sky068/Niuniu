/**
 * Created by skyxu on 2018/5/7.
 *
 * 平台工具，调用原生平台方法
 */

"use strict";

let UtilsCross = UtilsCross || {};

/**
 *
 * @param title {String}
 * @param message {String}
 * @param delay {Number} 多长时间后提醒（单位秒)
 * @param loop {Boolean} 是否重复提醒
 * @param key {String} 唯一key
 */
UtilsCross.pushLocalNotification = function (title, message, delay, loop, key) {
    if (!cc.sys.isNative) {
        cc.log("only native can use iap.");
        return;
    }
    
    if (loop === undefined){
        loop = false;
    }

    let ret = "";
    if (cc.sys.platform === cc.sys.IPHONE || cc.sys.platform === cc.sys.IPAD) {
        ret = jsb.reflection.callStaticMethod("HKLocalNotification","pushLocalNoti:message:withSecond:repeats:key:", title, message, delay, loop, key);
    } else if (cc.sys.platform == cc.sys.ANDROID) {
        ret = jsb.reflection.callStaticMethod("com/hawk/utils/UtilNotification", "s_postNotification", "(Ljava/lang/String;Ljava/lang/String;IZLjava/lang/String;)V", title, message, delay, loop, key);
    }

    return ret;
};

UtilsCross.getAppVersion = function () {
    let v = "V";
    let ret = "";
    if (cc.sys.platform === cc.sys.IPHONE || cc.sys.platform === cc.sys.IPAD) {
        ret = jsb.reflection.callStaticMethod("UtilsNative","getAppVersion");
    } else if (cc.sys.platform == cc.sys.ANDROID){
        ret = jsb.reflection.callStaticMethod("com/hawk/utils/ConfigManager", "getPackageVersionStatic", "()Ljava/lang/String;");
    } else {
        // web
        ret = "1.0.0";
    }
    v += ret;

    return v;
};

/**
 * 读取服务器时间
 */
UtilsCross.loadServerTime = function () {
    if (cc.sys.platform === cc.sys.IPHONE || cc.sys.platform === cc.sys.IPAD) {
        // do nothing
    } else if (cc.sys.platform == cc.sys.ANDROID){
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "loadServerTime", "()V");
    }
};

UtilsCross.getUID = function () {
    let ret = "";
    if (cc.sys.platform === cc.sys.ANDROID) {
        ret = jsb.reflection.callStaticMethod("com/hawk/utils/ConfigManager", "getDeviceIDStatic", "()Ljava/lang/String;");
    } else {
        ret = (new Date()).toUTCString();
    }
    cc.log("uid: " + ret);
    return ret;
};


/**
 * 移除Andorid SplashView
 */
UtilsCross.rmAndroidSplash = function () {
    let ret = "";
    if (cc.sys.platform === cc.sys.ANDROID) {
        ret = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity","rmSplashView", "()V");
    }

    return ret;
};

/**
 * 分享
 */
UtilsCross.share = function (title, extraText) {
    let ret = "";
    if (cc.sys.platform === cc.sys.ANDROID) {
        ret = jsb.reflection.callStaticMethod("com/hawk/utils/ConfigManager", "share", "(Ljava/lang/String;Ljava/lang/String;)V", title, extraText);
    }

    return ret;
};

/**
 * 追踪事件
 */
UtilsCross.trackEvent = function (eventType, jsonStr) {
    if (!cc.sys.isNative) {
        cc.log("only native can trackEvent.");
        return;
    }
    
    if (cc.sys.platform === cc.sys.ANDROID) {
        jsb.reflection.callStaticMethod("com/hawk/utils/ConfigManager", "trackEvent", "(Ljava/lang/String;Ljava/lang/String;)V", eventType, jsonStr);
    }
};

/**
 * 追踪事件(Firebase平台)
 */
UtilsCross.trackEvent_FB = function (eventType, jsonStr) {
    if (!cc.sys.isNative) {
        cc.log("only native can trackEvent_FB.");
        return;
    }

    if (cc.sys.platform === cc.sys.ANDROID) {
        jsb.reflection.callStaticMethod("com/hawk/utils/ConfigManager", "trackEvent_FB", "(Ljava/lang/String;Ljava/lang/String;)V", eventType, jsonStr);
    }
};

//------------Ads start------------
UtilsCross.loadAdRewardVideo = function () {
    if (!cc.sys.isNative) {
        cc.log("only native can loadAdRewardVideo.");
        return;
    }

    if (cc.sys.platform === cc.sys.ANDROID) {
        jsb.reflection.callStaticMethod("com/hawk/utils/AdRewardVideoMgr","loadAdStatic", "()V");
    }
};
UtilsCross.isAdRewardVideoLoaded = function () {
    if (!cc.sys.isNative) {
        cc.log("only native can isAdRewardVideoLoaded.");
        return false;
    }

    if (cc.sys.platform === cc.sys.ANDROID) {
        return jsb.reflection.callStaticMethod("com/hawk/utils/AdRewardVideoMgr","isAdLoadedStatic", "()Z");
    } else {
        return false;
    }
};
UtilsCross.showAdRewardVideo = function () {
    if (!cc.sys.isNative) {
        cc.log("only native can showAdRewardVideo.");
        return;
    }

    if (cc.sys.platform === cc.sys.ANDROID) {
        jsb.reflection.callStaticMethod("com/hawk/utils/AdRewardVideoMgr","showStatic", "()V");
    }
};

UtilsCross.loadAdInterstitial = function () {
    if (!cc.sys.isNative) {
        cc.log("only native can loadAdInterstitial.");
        return;
    }

    if (cc.sys.platform === cc.sys.ANDROID) {
        jsb.reflection.callStaticMethod("com/hawk/utils/AdInterstitialMgr","loadAdStatic", "()V");
    }
};
UtilsCross.isAdInterstitialLoaded = function () {
    if (!cc.sys.isNative) {
        cc.log("only native can isAdInterstitialLoaded.");
        return false;
    }

    if (cc.sys.platform === cc.sys.ANDROID) {
        return jsb.reflection.callStaticMethod("com/hawk/utils/AdInterstitialMgr","isAdLoadedStatic", "()Z");
    } else {
        return false;
    }
};
UtilsCross.showAdInterstitial = function () {
    if (!cc.sys.isNative) {
        cc.log("only native can showAdInterstitial.");
        return;
    }

    if (cc.sys.platform === cc.sys.ANDROID) {
        jsb.reflection.callStaticMethod("com/hawk/utils/AdInterstitialMgr","showStatic", "()V");
    }
};

UtilsCross.showAdBanner = function () {
    if (!cc.sys.isNative) {
        cc.log("only native can showAdBanner.");
        return;
    }

    if (cc.sys.platform === cc.sys.ANDROID) {
        jsb.reflection.callStaticMethod("com/hawk/utils/AdBannerMgr","showStatic", "()V");
    }
};
UtilsCross.hideAdBanner = function () {
    if (!cc.sys.isNative) {
        cc.log("only native can hideAdBanner.");
        return;
    }

    if (cc.sys.platform === cc.sys.ANDROID) {
        jsb.reflection.callStaticMethod("com/hawk/utils/AdBannerMgr","hideStatic", "()V");
    }
};
//------------Ads end--------------

//------------native to js begin------------
// Ads
UtilsCross.closeAdRewardVideo = function (isPlayCompleted) {
    cc.log("关闭激励视频广告");
    Global.eventMgr.emit(Global.config.EVENT_CLOSE_AD_REWARD_VIDEO, isPlayCompleted);
};
UtilsCross.adRewardVideoLoaded = function () {
    Global.eventMgr.emit(Global.config.EVENT_AD_REWARD_VIDEO_LOADED);
};
//------------native to js end--------------

module.exports = UtilsCross;