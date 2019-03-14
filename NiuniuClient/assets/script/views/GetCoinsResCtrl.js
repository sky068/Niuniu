/**
 * Created by edisonjiang on 2018/7/20.
 */

"use strict";

let ViewBase = require("./../common/ViewBase");
let DataMgr = require("./../common/DataMgr");
let CoinsMgr = require("./../common/CoinsMgr");

cc.Class({
    extends: ViewBase,

    properties: {
        labelCoins: cc.Label,

        _coins: 0,
        coins: {
            get () {
                return this._coins;
            },
            set (value) {
                this._coins = value;

                this.labelCoins.string = "+" + this._coins;
            }
        },

        callOnOk: null
    },

    // onLoad() {},

    // start() {},

    onBtnOK(event) {
        this._rmSelf();
        if (this.callOnOk) {
            this.callOnOk();
        }

        Global.uiUpdater.updateUserCoins();

        Global.audioMgr.playEffect(Global.audioMgr.effBtnClick);
    },

    _rmSelf() {
        this.node.removeFromParent(true);
        this.node.destroy();
    }
});
