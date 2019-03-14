/**
 * Created by skyxu on 2018/3/13.
 */

//sdk 配置说明 http://docs.sdkbox.com/en/plugins/iap/v3-js/

"use strict";

let IAPListener = {
    onInitialized: function (res) {
        cc.log("sdkbox iap init: " + res);
    },
    onSuccess : function (product) {
        //Purchase success
    },
    onFailure : function (product, msg) {
        //Purchase failed
        //msg is the error message
    },
    onCanceled : function (product) {
        //Purchase was canceled by user
    },
    onRestored : function (product) {
        //Purchase restored
    },
    onProductRequestSuccess : function (products) {
        //Returns you the data for all the iap products
        //You can get each item using following method
        //products
        let obj = {
            "name":"coin_package",
            "id":"com.cocos2dx.plugintest2",
            "title":"",
            "description":"",
            "price":"","currencyCode":"",
            "receipt":"",
            "receiptCipheredPayload":""
        };

        for (let i = 0; i < products.length; i++) {
            // loop
        }
    },
    onProductRequestFailure : function (msg) {
        //When product refresh request fails.
    }
};

let IAP = cc.Class({

    /**
     *SDKBOX 安装器会自动在您的工程中添加一个样例配置文件sdkbox_config.json.
     * 在您编译工程前,请修改里面的参数,用您自己的应用信息
     */

    /**
     * @param {Object} listener
     * @param {boolean} isDebug
     * @returns {boolean}
     */
    init: function (listener, isDebug) {
        if(typeof sdkbox === "undefined"){
            cc.log("sdkbox undefined");
            return false;
        }

        sdkbox.IAP.setListener(listener);
        sdkbox.IAP.init();
        sdkbox.IAP.setDebug(isDebug);
        sdkbox.IAP.enableUserSideVerification(false);
        sdkbox.IAP.refresh();


        return true;
    },

    /**
     * @param {string} name sdkbox_config.json对应的key
     */
    pay: function (name) {
        if(sdkbox.IAP){
            sdkbox.IAP.purchase(name);
        }
    },

    restore: function () {
        if(sdkbox.IAP){
            sdkbox.IAP.restore();
        }
    },

    refresh: function () {
        if(sdkbox.IAP){
            sdkbox.IAP.refresh();
        }
    }
});

module.exports = IAP;
