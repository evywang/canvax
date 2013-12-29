/**
 * Canvax
 *
 * @author 释剑 (李涛, litao.lt@alibaba-inc.com)
 *
 * 模拟as3 中 的Moveclip类，目前还只是个简单的容易。
 */


KISSY.add("canvax/display/Moveclip" , function(S , DisplayObjectContainer,Base){
  var Moveclip = function(opt){

      var self = this;

      opt.context || (opt.context = {});

      self.type = "Moveclip";
      self.currentFrame  = 0;
      self._autoPlay     = opt.autoPlay || false;//是否自动播放


      self._frameRate    = Base.mainFrameRate;
      self._speedTime    = parseInt(1000/self._frameRate);
      self._preRenderTime= 0;

      self._style = {
          //r : opt.context.r || 0   //{number},  // 必须，圆半径
      }

      arguments.callee.superclass.constructor.apply(this, arguments);
  };

  Base.creatClass(Moveclip , DisplayObjectContainer , {
      init : function(){
         
      },
      getStatus    : function(){
          //查询moveclip的_autoPlay状态
          return this._autoPlay;
      },
      setFrameRate : function(frameRate) {
          
          var self = this;
          if(self._frameRate  == frameRate) {
              return;
          }
          self._frameRate  = frameRate;

          //根据最新的帧率，来计算最新的间隔刷新时间
          self._speedTime = parseInt( 1000/self._frameRate );
      }, 
      afterAddChild:function(child , index){
         if(this.children.length==1){
            return;
         }

         if( index != undefined && index <= this.currentFrame ){
            //插入当前frame的前面 
            this.currentFrame++;
         }
      },
      afterDelChild:function(child,index){
         //记录下当前帧
         var preFrame = this.currentFrame;

         //如果干掉的是当前帧前面的帧，当前帧的索引就往上走一个
         if(index < this.currentFrame){
            this.currentFrame--;
         }

         //如果干掉了元素后当前帧已经超过了length
         if((this.currentFrame >= this.children.length) && this.children.length>0){
            this.currentFrame = this.children.length-1;
         };
      },
      _goto:function(i){
         var len = this.children.length;
         if(i>= len){
            i = i%len;
         }
         if(i<0){
            i = this.children.length-1-Math.abs(i)%len;
         }
         this.currentFrame = i;
      },
      gotoAndStop:function(i){
         this._goto(i);
         if(!this._autoPlay){
           //再stop的状态下面跳帧，就要告诉stage去发心跳
           this._preRenderTime = 0;
           this.getStage().heartBeat();
           return;
         }
         this._autoPlay = false;
      },
      stop:function(){
         if(!this._autoPlay){
           return;
         }
         this._autoPlay = false;
      },
      gotoAndPlay:function(i){
          debugger;
         this._goto(i);
         if(this._autoPlay){
           return;
         }
         this._autoPlay = true;
         var canvax = this.getStage().parent;
         if(!canvax._heartBeat && canvax._taskList.length==0){
             //手动启动引擎 
             //canvax.__enterFrame();
             canvax.__startEnter();
             //requestAnimationFrame( _.bind(canvax.__enterFrame,canvax) );
         }
 
         this._push2TaskList();

         //因为有goto设置好了currentFrame
         //this._next();
         this._preRenderTime = 0;

      },
      play:function(){
         if(this._autoPlay){
           return;
         }
         this._autoPlay = true;
         var canvax = this.getStage().parent;
         if(!canvax._heartBeat && canvax._taskList.length==0){
             //手动启动引擎
             //canvax.__enterFrame();
             canvax.__startEnter();
             //requestAnimationFrame( _.bind(canvax.__enterFrame,canvax) );
         }
         this._push2TaskList();
         
         this._preRenderTime = new Date().getTime();
         this._next();

      },
      _push2TaskList:function(){
         //把enterFrame push 到 引擎的任务列表
         if(!this._enterInCanvax){
           this.getStage().parent._taskList.push( this );
           this._enterInCanvax=true;
         }
      },
      //_autoPlay为true 而且已经把__enterFrame push 到了引擎的任务队列，
      //则为true
      _enterInCanvax:false, 
      __enterFrame:function(){
         var self = this;
         if((Base.now-self._preRenderTime) >= self._speedTime ){
             //大于_speedTime，才算完成了一帧
             
             //上报心跳 无条件心跳吧。
             //后续可以加上对应的 moveclip 跳帧 心跳
             self.getStage().heartBeat();
         }

      },
      next  :function(){
         var self = this;
         if(!self._autoPlay){
             //只有再非播放状态下才有效
             self.gotoAndStop(self._next());
         }
      },
      pre   :function(){
         var self = this;
         if(!self._autoPlay){
             //只有再非播放状态下才有效
             self.gotoAndStop(self._pre());
         }
      },
      _next : function(){
         var self = this;
         if(this.currentFrame >= this.children.length-1){
             this.currentFrame = 0;
         } else {
             this.currentFrame++;
         }
         return this.currentFrame;
      },

      _pre : function(){
         var self = this;
         if(this.currentFrame == 0){
             this.currentFrame = this.children.length-1;
         } else {
             this.currentFrame--;
         }
         return this.currentFrame;
      },
      render:function(ctx){

          //因为如果children为空的话，moveclip 会把自己设置为 visible:false，不会执行到这个render
          //所以这里可以不用做children.length==0 的判断。 大胆的搞吧。
          this.getChildAt(this.currentFrame)._render(ctx);

          if(this.children.length == 1){
              this._autoPlay = false;
          }

          //console.log(this.id+"|"+(Base.now-this._preRenderTime)+"|"+this._speedTime)
                  

          if(this._autoPlay){
              //如果要播放
              if((Base.now-this._preRenderTime) >= this._speedTime ){
                  //先把当前绘制的时间点记录
                  this._preRenderTime = Base.now;
                  this._next();
              }
              this._push2TaskList();
          } else {
              //暂停播放
              if(this._enterInCanvax){
                  //如果这个时候 已经 添加到了canvax的任务列表
                  this._enterInCanvax=false;
                  var tList = this.getStage().parent._taskList;
                  tList.splice( _.indexOf(tList , this) , 1 ); 
              }
          }

          
      } 
  });

  return Moveclip;

} , {
  requires:[
    "canvax/display/DisplayObjectContainer",
    "canvax/core/Base"
  ]
})
