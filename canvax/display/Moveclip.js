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
      self._autoPlay     = true;//是否自动播放


      self._frameRate    = Base.mainFrameRate;
      self._speedTime    = parseInt(1000/self._frameRate);
      self._preRenderTime= 0;

      self._style = {
          //r : opt.context.r || 0   //{number},  // 必须，圆半径
      }

      arguments.callee.superclass.constructor.call(this, arguments);
             


  };

  Base.creatClass(Moveclip , DisplayObjectContainer , {
      init : function(){
         
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

         child.context.visible = false;

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

         //如果干掉的就是当前帧
         //把最新的child 显示
         if(index == preFrame && this.children.length>0){
            this.getChildAt(this.currentFrame).context.visible = true;
         }
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
         
         //这个时候主引擎的__enterFrame如果已经关掉了
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
         var now  = new Date().getTime();
         
         if((now-self._preRenderTime) >= self._speedTime ){
             //大于_speedTime，才算完成了一帧
             
             //下面render里面已经有记录了
             //self._preRenderTime = now;

             //上报心跳 无条件心跳吧。
             //后续可以加上对应的 moveclip 跳帧 心跳
             self.getStage().heartBeat();
         }

      },
      render:function(ctx){
        
         //因为如果children为空的话，moveclip 会把自己设置为 visible:false，不会执行到这个render
         //所以这里可以不用做children.length==0 的判断。 大胆的搞吧。
         this.getChildAt(this.currentFrame)._render(ctx);
         
         //先把当前绘制的时间点记录
         this._preRenderTime = new Date().getTime();
         
         if(this._autoPlay){
            //如果要播放
            this.getChildAt(this.currentFrame).context.visible=false;

            if(this.currentFrame >= this.children.length-1){
               this.currentFrame = 0;
            } else {
               this.currentFrame++;
            }

            this.getChildAt(this.currentFrame).context.visible=true;

            this._push2TaskList();
         } else {
            //暂停播放
            if(this._enterInCanvax){
              //如果这个时候 已经 添加到了canvax的任务列表
              this._enterInCanvax=false;
              this.getStage().parent._taskList.splice( this.getChildIndex() , 1 ); 
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
