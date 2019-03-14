/**
 * Created by skyxu on 2018/4/16.
 */

"use strict";

let Direction = cc.Enum({
    /**
     * !#en The horizontal direction.
     * !#zh 水平方向
     * @property {Number} Horizontal
     */
    Horizontal: 0,
    /**
     * !#en The vertical direction.
     * !#zh 垂直方向
     * @property {Number} Vertical
     */
    Vertical: 1
});

cc.Class({
    extends: cc.Slider,

    properties: {
        barSprite: {
            default: null,
            type: cc.Sprite,
            notify: function() {
                if (CC_EDITOR && this.barSprite) {
                    this._updateBarSprite();
                }
            }
        },

        enableAutoGrayEffect: {
            default: false,
            tooltip: CC_DEV && 'i18n:COMPONENT.button.auto_gray_effect',
            notify: function (oldValue) {
                this._updateDisabledState();
            }
        },

        interactable: {  
            default: true,
            tooltip: CC_DEV && 'i18n:COMPONENT.button.interactable',
            notify: function (oldValue) {
                this._updateDisabledState();
            }
        }
    },

    _handleSliderLogic: function (touch) {
        if (!this.interactable){
            return;
        }

        this._updateProgress(touch);
        this._emitSlideEvent();
    },

    _updateDisabledState(){
        if (this.handle){
            this.handle.enableAutoGrayEffect = this.enableAutoGrayEffect;
            this.handle.interactable = this.interactable;
        }

        if(this.barSprite) {
            this.barSprite._sgNode.setState(0);
        }
        if(this.enableAutoGrayEffect) {
            if(this.barSprite && !this.interactable) {
                this.barSprite._sgNode.setState(1);
            }
        }
    },

    _updateHandlePosition: function () {
        if (!this.handle) {
            return;
        }
        let handlelocalPos;
        if (this.direction === Direction.Horizontal) {
            handlelocalPos = cc.p(-this.node.width * this.node.anchorX + this.progress * this.node.width, 0);
        }
        else {
            handlelocalPos = cc.p(0, -this.node.height * this.node.anchorY + this.progress * this.node.height);
        }
        let worldSpacePos = this.node.convertToWorldSpaceAR(handlelocalPos);
        this.handle.node.position = this.handle.node.parent.convertToNodeSpaceAR(worldSpacePos);
        this._updateBarSprite();
    },

    _updateProgress: function (touch) {
        if (!this.handle) {
            return;
        }
        let maxRange = null, progress = 0, newPos = this.node.convertTouchToNodeSpaceAR(touch);
        if (this.direction === Direction.Horizontal) {
            maxRange = this.node.width / 2 - this.handle.node.width * this.handle.node.anchorX;
            progress = cc.clamp01((newPos.x + maxRange) / (maxRange * 2), 0, 1);
        }
        else if (this.direction === Direction.Vertical) {
            maxRange = this.node.height / 2 - this.handle.node.height * this.handle.node.anchorY;
            progress = cc.clamp01((newPos.y + maxRange) / (maxRange * 2), 0, 1);
        }
        this.progress = progress;

        this._updateBarSprite();
    },

    _updateBarSprite(){
        if (!this.barSprite) {
            return;
        }
        let maxWidth = this.node.width;
        let curWidth = maxWidth * this.progress;
        this.barSprite.node.width = curWidth;
        // mark: 左对齐
        this.barSprite.node.x = this.barSprite.node.anchorX * this.barSprite.node.width - this.node.width * this.node.anchorX;
    }
});