KISSY.add("canvax/display/Stage" , function( S , DisplayObjectContainer , Base,StageEvent ){
  
   var Stage = function( opt ){

       var self = this;
    
       self.type = "Stage";
       self.context2D = null;
       //stage正在渲染中
       self.stageRending=false;


       self._isReady = false;


       arguments.callee.superclass.constructor.apply(this, arguments);

   };


 
   Base.creatClass( Stage , DisplayObjectContainer , {
       init : function(){
          var self = this;

          if ( !self.context.width || !self.context.height ){
             //如果stage的高宽有为0的直接跳出，不创建canvas
             return false;
          };

          //创见stage只需要两个参数即是width height，和 id ， 其他的都动态生成

          var canvas = Base._createCanvas(self.id ,self.context.width,self.context.height)
          
          //S.all(document.body).prepend( canvas );
          if(typeof FlashCanvas != "undefined" && FlashCanvas.initElement){
             FlashCanvas.initElement(canvas);
          }
          self.context2D = canvas.getContext("2d");
          canvas = null;
                    
          //if (window.G_vmlCanvasManager) {
          //    G_vmlCanvasManager.initElement(self.context2D.canvas);
          //}
     
          //为retina屏幕做的优化

          self.context.scaleX = Base._devicePixelRatio;
          self.context.scaleY = Base._devicePixelRatio;


          self._isReady = true;

       },
       render : function(context){
           this.stageRending = true;
           if(!context) context = this.context2D;
           this.clear();
           var dragTarget = this.dragTarget;
           if( dragTarget ) {
               //handle drag target
               var p = dragTarget.globalToLocal(this.mouseX, this.mouseY);
               dragTarget.context.x = p.x;
               dragTarget.context.y= p.y;
           }
           Stage.superclass.render.call(this, context);

           this.stageRending = false;
           

       },
       heartBeat : function( opt ){
           //shape , name , value , preValue 
           //displayList中某个属性改变了
           var self = this;

           if (!self._isReady) {
              //在stage还没初始化完毕的情况下，无需做任何处理
              return;
           }


           opt || (opt = {}); //如果opt为空，说明就是无条件刷新
           opt.stage = self;

           //Base.log('change '+ ev.attrName + ': '+ev.prevVal+' --> '+ev.newVal);

           //TODO临时先这么处理
           self.parent && self.parent.heartBeat(opt);
       },
       clear : function(x, y, width, height) {
           if(arguments.length >= 4) {
               this.context2D.clearRect(x, y, width, height);
           } else {
               this.context2D.clearRect(0, 0, this.context2D.canvas.width, this.context2D.canvas.height);
           }
       }
       
   });

   return Stage;

},{
  requires:[
    "canvax/display/DisplayObjectContainer",
    "canvax/core/Base",
    "canvax/event/StageEvent"
  ]
});
