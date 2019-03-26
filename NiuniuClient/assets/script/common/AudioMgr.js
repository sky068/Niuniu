/**
 * Created by skyxu on 2018/4/17.
 *
 * 用来管理音频的播放
 * 挂置在一个常驻节点上
 */

"use strict";

let DataMgr = require("./DataMgr");
let Utils = require("./UtilsOther");

cc.Class({
    extends: cc.Component,

    properties: {
        effNiu_0: {
            url: cc.AudioClip,
            default: null
        },
        effNiu_1: {
            url: cc.AudioClip,
            default: null
        },
        effNiu_2: {
            url: cc.AudioClip,
            default: null
        },
        effNiu_3: {
            url: cc.AudioClip,
            default: null
        },
        effNiu_4: {
            url: cc.AudioClip,
            default: null
        },
        effNiu_5: {
            url: cc.AudioClip,
            default: null
        },
        effNiu_6: {
            url: cc.AudioClip,
            default: null
        },
        effNiu_7: {
            url: cc.AudioClip,
            default: null
        },
        effNiu_8: {
            url: cc.AudioClip,
            default: null
        },
        effNiu_9: {
            url: cc.AudioClip,
            default: null
        },
        effNiu_10: {
            url: cc.AudioClip,  // 牛牛
            default: null
        },
        effNiu_11: {
            url: cc.AudioClip,  // 银牛
            default: null
        },
        effNiu_12: {
            url: cc.AudioClip,  // 四炸
            default: null
        },
        effNiu_13: {
            url: cc.AudioClip,  // 五花牛
            default: null
        },
        effNiu_14: {
            url: cc.AudioClip,  // 五小牛
            default: null
        },


        roomMusic: {
            url: cc.AudioClip,
            default: null,
        },
        gameMusic: {
            url: cc.AudioClip,
            default: null
        },
        effFlyCoins: {
            url: cc.AudioClip,
            default: null
        },
        effFapai: {
            url: cc.AudioClip,
            default: null
        },
        effMdls: {
            url: cc.AudioClip,
            default: null
        },
        effKaipai: {
            url: cc.AudioClip,
            default: null
        },
        effBtnClose: {
            url: cc.AudioClip,
            default: null
        }
    },

    onLoad: function () {
        this._bgMusicID = null;
        this._lastBGM = null;
        this._setData = DataMgr.getInstance().settingObj;
        this._allEffects = [];

        Global.audioMgr = this;
    },

    /**
     *
     * @param efx {cc.AudioClip}
     * @param loop {Boolean} 循环
     */
    playEffect: function (efx, loop) {
        if (!this._setData.effectOn) return null;
        loop = loop !== undefined?loop:false;
        let audioId = cc.audioEngine.play(efx, loop, this._setData.effectVol);
        this._allEffects.push(audioId);
        cc.audioEngine.setFinishCallback(audioId, this.onEffectPlayFinished.bind(this, audioId));
        return audioId;
    },

    /**
     *
     * @param audioId
     */
    stopEffect: function (audioId) {
        if (audioId !== undefined && audioId !== null) {
            cc.audioEngine.stop(audioId);
            Utils.arrayRmObj(this._allEffects, audioId);
        }
    },

    stopAllEffects: function () {
        for (let audioId of this._allEffects) {
            cc.audioEngine.stop(audioId);
        }
    },

    pauseAllEffects: function () {
        for (let audioId of this._allEffects) {
            cc.audioEngine.pause(audioId);
        }
    },

    resumeAllEffects: function () {
        for (let audioId of this._allEffects) {
            cc.audioEngine.resume(audioId);
        }
    },

    setEffectVolume: function (vol) {
        for (let audioId of this._allEffects) {
            cc.audioEngine.setVolume(audioId, vol);
        }
    },

    /**
     *
     * @param a {AudioID}
     * @param b
     */
    onEffectPlayFinished(a, b){
        Utils.arrayRmObj(this._allEffects, a);
        cc.log("_allEffects:" + this._allEffects.length);
    },

    /**
     *
     * @param m {cc.AudioClip}
     */
    playMusic: function (m) {
        // mark: 必须优先保存，后面用来恢复播放
        this._lastBGM = m;

        if (!this._setData.musicOn) return;

        //todo 先暂停再播放
        if (this._bgMusicID !== null) {
            cc.audioEngine.stop(this._bgMusicID);
        }
        this._bgMusicID = cc.audioEngine.play(m, true, this._setData.musicVol);
    },

    getLastMusic: function () {
        return this._lastBGM;
    },

    playLastMusic: function () {
        if (!this._setData.musicOn) return;

        if (this._lastBGM) {
            //todo 先暂停再播放
            if (this._bgMusicID !== null) {
                cc.audioEngine.stop(this._bgMusicID);
            }
            this._bgMusicID = cc.audioEngine.play(this._lastBGM, true, this._setData.musicVol);
        }
    },

    stopMusic: function () {
        if (this._bgMusicID === null) {
            return;
        }
        cc.audioEngine.stop(this._bgMusicID);
    },

    pauseMusic: function () {
        if (this._bgMusicID === null) {
            return;
        }
        cc.audioEngine.pause(this._bgMusicID);
    },

    resumeMusic: function () {
        if (this._bgMusicID === null) {
            return;
        }
        cc.audioEngine.resume(this._bgMusicID);
    },

    setMusicVolume(vol){
        if (this._bgMusicID === null) {
            return;
        }
        cc.audioEngine.setVolume(this._bgMusicID, vol);
    }
});
