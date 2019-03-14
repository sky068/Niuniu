/**
 * Created by skyxu on 2018/3/22.
 */

"use strict";

cc.Class({
    extends: cc.Sprite,

    properties: {

        imgAddr:"",
        spSize: cc.Size,
    },

    // use this for initialization
    onLoad: function () {
        this._newSpFrame = null;
        if(this.imgAddr && this.imgAddr.length>0)
        {
            this.setSPLink(this.imgAddr);
        }
    },

    setSPLink:function(link)
    {
        if(link && link.length>0)
        {
            this.imgAddr = link;
            cc.loader.load(this.imgAddr,function(progress){
                cc.log("~~~~~SpriteRemote progress:"+progress);
            },function(error,tex){
                if(error)
                {
                    cc.log("~~~~~SprieRemote error:"+error);
                    return;
                }

                this._newSpFrame = new cc.SpriteFrame(tex);

                if(!this.node) return;
                let oldW = this.node.width;
                let oldH = this.node.height;

                this.getComponent(cc.Sprite).spriteFrame = this._newSpFrame;

                this.node.width = this.spSize.width ? this.spSize.width : oldW;
                this.node.height = this.spSize.height ? this.spSize.height : oldH;
            }.bind(this));
        }
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

});
