/**
 * Created by skyxu on 2018/5/7.
 * 精灵组件，让精灵置灰
 */

"use strict";

cc.Class({
    extends: cc.Component,
    properties:{
        _gray: false,
        gray:{
            type: Boolean,
            set(g){
                this._gray = g;
                let s = g?1:0;
                this.getComponent(cc.Sprite)._sgNode.setState(s);
            },
            get(){
                return this._gray;
            }
        }
    },

    onLoad(){
        this.gray = this._gray;
    }
});