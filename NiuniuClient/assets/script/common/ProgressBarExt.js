/**
 * Created by edisonjiang on 2018/4/4.
 * 扩展系统的ProgressBar组件，支持设置进度值时的过度动画，
 * 并支持达到某进度值时回调函数的设置
 */

"use strict";

// 改变进度值的过度方式(为无时不需要添加过度动画)
let ProcessType = cc.Enum({
    NULL: 0,           // 无
    INCREASE: 1,       // 增加
    DECREASE: 2,       // 减少
});

let ProgressBarExt = cc.Class({
    extends: cc.ProgressBar,

    properties: {
        _processType: ProcessType.NULL, // 是否在改变进度值的过度中

        _targetProgress: 0,
        _progressDiff: 0,
        targetProgress: {
            tooltip: '目标进度值',
            min: 0,
            max: 1,
            get () {
                return this._targetProgress;
            },
            set (value) {
                this._targetProgress = value;

                this._progressDiff = (this._targetProgress - this.progress);
                if (this._progressDiff > 0) {
                    this._processType = ProcessType.INCREASE;
                } else if (this._progressDiff < 0) {
                    this._processType = ProcessType.DECREASE;
                } else {
                    this._processType = ProcessType.NULL;
                }
            }
        },
        _onProgressComplete: null, //进度达到目标进度值时执行的回调函数

        _changeTime: 0,
        changeTime: {
            tooltip: '过度动画执行的时间(单位秒)',
            range: [0, Number.MAX_VALUE],
            get () {
                return this._changeTime;
            },
            set (value) {
                this._changeTime = value;
            }
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
    },

    update (dt) {
        if (this._processType == ProcessType.NULL) {
            return;
        }

        let delta = this._progressDiff;
        if (this._changeTime > 0) {
            delta = (this._progressDiff / this._changeTime);
            delta *= dt;
        }
        if (this._processType == ProcessType.INCREASE) {
            if (this._targetProgress > this.progress) {
                this.progress += delta;
            } else {
                this.progress = this._targetProgress;
                this.runProgressComplete();

                this._processType = ProcessType.NULL;
            }
            this._updateBarStatus();
        } else if (this._processType == ProcessType.DECREASE) {
            if (this._targetProgress < this.progress) {
                this.progress += delta;
            } else {
                this.progress = this._targetProgress;
                this.runProgressComplete();

                this._processType = ProcessType.NULL;
            }
            this._updateBarStatus();
        }
    },

    setTargetProgress (progress, onProgressComplete, isImmediate) {
        this.targetProgress = progress;
        this._onProgressComplete = onProgressComplete;

        if (isImmediate) {
            this._processType = ProcessType.NULL;

            this.progress = this._targetProgress;
            this.runProgressComplete();
            this._updateBarStatus();
        }
    },

    runProgressComplete () {
        if (this._onProgressComplete) {
            this._onProgressComplete();
            this._onProgressComplete = null;
        }
    }
});

module.exports = ProgressBarExt;
