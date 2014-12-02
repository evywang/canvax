/**
 * Canvax
 *
 * @author 释剑 (李涛, litao.lt@alibaba-inc.com)
 *
 * 事件派发类
 */


define(
    "canvax/event/EventDispatcher",
    [
        "canvax/core/Base",
        "canvax/event/EventManager"
    ],
    function( Base ,EventManager){

        var EventDispatcher = function(){
            arguments.callee.superclass.constructor.call(this, name);
        };
      
        Base.creatClass(EventDispatcher , EventManager , {
            on : function(type, listener){
                this._addEventListener( type, listener);
                return this;
            },
            addEventListener:function(type, listener){
                this._addEventListener( type, listener);
                return this;
            },
            un : function(type,listener){
                this._removeEventListener( type, listener);
                return this;
            },
            removeEventListener:function(type,listener){
                this._removeEventListener( type, listener);
                return this;
            },
            removeEventListenerByType:function(type){
                this._removeEventListenerByType( type);
                return this;
            },
            removeAllEventListeners:function(){
                this._removeAllEventListeners();
                return this;
            },
            fire : function(event){
                if(_.isString(event)){
                    //如果是str，比如mouseover
                    event = { type : event };
                } else {
          
                }
                this.dispatchEvent(event);
                return this;
            },
            dispatchEvent:function(event){
                if(event.type == "mouseover"){
                   //记录dispatchEvent之前的心跳
                   var preHeartBeat = this._heartBeatNum;
                   this._dispatchEvent( event );
                   if( preHeartBeat != this._heartBeatNum ){
                       this._hoverClass = true;

                       var canvax = this.getStage().parent;
    

                       /*
                       //如果前后心跳不一致，说明有mouseover 属性的修改，也就是有hover态
                       //那么该该心跳包肯定已经 巴shape添加到了canvax引擎的convertStages队列中
                       //把该shape从convertStages中干掉，重新添加到专门渲染hover态shape的_hoverStage中
                       if(_.values(canvax.convertStages[this.getStage().id].convertShapes).length > 1){
                           //如果还有其他元素也上报的心跳，那么该画的还是得画，不管了
                       } else {
                           delete canvax.convertStages[ this.getStage().id ];
                           this._heart = false;
                       }
                       */

                       

                       //然后clone一份obj，添加到_hoverStage 中
                       var activShape = this.clone(true);                     
                       activShape._transform = this.getConcatenatedMatrix();
                       canvax._hoverStage.addChildAt( activShape , 0 ); 

                       //然后把自己visible=false隐藏了
                       //this.context.visible = false;
                       this._globalAlpha = this.context.globalAlpha;
                       this.context.globalAlpha = 0

                   }
                   return;
                }
      
                this._dispatchEvent( event );
      
                if(event.type == "mouseout"){
                    if(this._hoverClass){
                        //说明刚刚over的时候有添加样式
                        var canvax = this.getStage().parent;
                        this._hoverClass = false;
                        canvax._hoverStage.removeChildById(this.id);
                        
                        //this.context.visible = true;
                        this.context.globalAlpha = this._globalAlpha;
                        delete this._globalAlpha;

                    }
                }
      
                return this;
            },
            hasEvent:function(type){
                return this._hasEventListener(type);
            },
            hasEventListener:function(type){
                return this._hasEventListener(type);
            },
            hover : function( overFun , outFun ){
                this.on("mouseover" , overFun);
                this.on("mouseout"  , outFun );
                return this;
            },
            once : function(type, listener){
                this.on(type , function(){
                    listener.apply(this , arguments);
                    this.un(type , arguments.callee);
                });
                return this;
            }
        });
      
        return EventDispatcher;
      
    }
);
