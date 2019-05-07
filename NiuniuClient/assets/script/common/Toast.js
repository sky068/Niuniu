/**
 * Created by skyxu on 2019/4/28.
 *
 * 需要在assets/resources文件夹下添加一个2x2的纯白图片 singleColor.png用作底图
 *
 */

"use strict";

const BGRES_FILE = "singleColor";

let Toast = {
    LENGTH_LONG: 3.5,
    LENGTH_SHORT: 2,
    CENTER: 0,
    TOP: 1,
    TOP_LEFT: 2,
    LEFT: 3,
    BOTTOM_LEFT: 4,
    BOTTOM: 5,
    BOTTOM_RIGHT: 6,
    RIGHT: 7,
    TOP_RIGHT: 8,
};

let ToastView = cc.Class({
    ctor(){
        this._text = "";
        this._duration = 0;
        this._gravity = Toast.CENTER;
    },

    show(str, tDuration, gravity){
        this._text = str;
        this._duration = tDuration;
        this._gravity = gravity;

        let self = this;
        // 加载背景纹理
        if (Toast.bgSpriteFrame == undefined) {
            (function () {
                cc.loader.loadRes(BGRES_FILE, cc.SpriteFrame, (error, spf)=>{
                    if (error) {
                        cc.error(error);
                        return;
                    }
                    Toast.bgSpriteFrame = spf;
                    Toast.bgSpriteFrame.insetTop = 3;
                    Toast.bgSpriteFrame.insetBottom = 3;
                    Toast.bgSpriteFrame.insetLeft = 4;
                    Toast.bgSpriteFrame.insetRight = 4;
                    //加载完再调用
                    self.show(str, tDuration, gravity);
                });
            })();
            return;
        }

        // canvas
        let canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        let width = canvas.node.width;
        let height = canvas.node.height;
        if (this._duration === undefined) {
            this._duration = Toast.LENGTH_SHORT;
        }
        // 背景图片设置
        let bgNode = new cc.Node();
        // 背景图片透明度
        bgNode.opacity = 240;
        bgNode.color = cc.Color.BLACK;
        let bgSprite = bgNode.addComponent(cc.Sprite);
        bgSprite.type = cc.Sprite.Type.SLICED;
        let bgLayout = bgNode.addComponent(cc.Layout);
        bgLayout.resizeMode = cc.Layout.ResizeMode.CONTAINER;

        // Lable文本格式设置
        let textNode = new cc.Node();
        let textLabel = textNode.addComponent(cc.Label);
        textLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        textLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
        textLabel.fontSize = 30;
        textLabel.string = this._text;

        //背景图片与文本内容的间距
        let hPadding = textLabel.fontSize / 8;
        let vPadding = 2;
        bgLayout.paddingLeft = hPadding;
        bgLayout.paddingRight = hPadding;
        bgLayout.paddingTop = vPadding;
        bgLayout.paddingBottom = vPadding;

        // 当文本宽度过长时，设置为自动换行格式
        if (this._text.length * textLabel.fontSize > width / 3 * 2) {
            textNode.width = width / 3 * 2;
            textLabel.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        }

        bgNode.addChild(textNode);
        if (Toast.bgSpriteFrame) {
            bgSprite.spriteFrame = Toast.bgSpriteFrame;
        }

        // gravity 设置Toast显示的位置
        if (this._gravity == Toast.CENTER) {
            textNode.y = 0;
            textNode.x = 0;
        } else if (this._gravity == Toast.TOP) {
            textNode.y = textNode.y + (height / 5) * 2;
        } else if (this._gravity == Toast.TOP_LEFT) {
            textNode.y = textNode.y + (height / 5) * 2;
            textNode.x = textNode.x + (width / 5);
        } else if (this._gravity == Toast.LEFT) {
            textNode.x = textNode.x + (width / 5);
        } else if (this._gravity == Toast.BOTTOM_LEFT) {
            textNode.y = textNode.y - (height / 5) * 2;
            textNode.x = textNode.x + (width / 5);
        } else if (this._gravity == Toast.BOTTOM) {
            textNode.y = textNode.y - (height / 5) * 2;
        } else if (this._gravity == Toast.BOTTOM_RIGHT) {
            textNode.y = textNode.y - (height / 5) * 2;
            textNode.x = textNode.x - (width / 5);
        } else if (this._gravity == Toast.RIGHT) {
            textNode.x = textNode.x - (width / 5);
        } else if (this._gravity == Toast.TOP_RIGHT) {
            textNode.y = textNode.y + (height / 5) * 2;
            textNode.x = textNode.x - (width / 5);
        } else {
            // 默认情况 BOTTOM
            textNode.y = textNode.y - (height / 5) * 2;
        }

        // textNode.x = textNode.x + _x;
        // textNode.y = textNode.y + _y;

        canvas.node.addChild(bgNode);

        let finishCall = cc.callFunc((target)=>{
            bgNode.destroy();
        }, self);
        let action = cc.sequence(cc.delayTime(this._duration), cc.fadeOut(0.3), finishCall);
        bgNode.runAction(action);
    }
});

Toast.showText = function (txt, duration, gravity) {
    let toast = new ToastView();
    toast.show(txt, duration, gravity);
};

module.exports = Toast;
