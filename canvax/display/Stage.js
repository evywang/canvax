KISSY.add("canvax/display/Stage" , function( S , DisplayObjectContainer , Core,StageEvent ){
  
   var Stage = function( opt ){

       var self = this;
    
       self.type = "Stage";
       self.canvas = null;
       self.context2D = null;
       //stage正在渲染中
       self.stageRending=false;


       self._isReady = false;


       arguments.callee.superclass.constructor.apply(this, arguments);

   };


 
   S.extend( Stage , DisplayObjectContainer , {
       init : function(){
          var self = this;

          if ( !self.context.width || !self.context.height ){
             //如果stage的高宽有为0的直接跳出，不创建canvas
             return false;
          };

          //创见stage只需要两个参数即是width height，和 id ， 其他的都动态生成
          self.canvas = Core._createCanvas(self.id ,self.context.width,self.context.height);
          
          S.all(document.body).prepend( self.canvas );
                    
          if (window.G_vmlCanvasManager) {
              G_vmlCanvasManager.initElement(self.canvas);
          }
          self.context2D = self.canvas.getContext("2d");

          //为retina屏幕做的优化

          self.context.scaleX = Core._devicePixelRatio;
          self.context.scaleY = Core._devicePixelRatio;


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


           opt.stage = self;

           //Core.log('change '+ ev.attrName + ': '+ev.prevVal+' --> '+ev.newVal);

           //TODO临时先这么处理
           self.parent && self.parent.heartBeat(opt);
       },
       clear : function(x, y, width, height) {
           if(arguments.length >= 4) {
               this.context2D.clearRect(x, y, width, height);
           } else {
               this.context2D.clearRect(0, 0, this.canvas.width, this.canvas.height);
           }
       }
       
   });

   return Stage;

},{
  requires:[
    "canvax/display/DisplayObjectContainer",
    "canvax/core/Core",
    "canvax/event/StageEvent"
  ]
});
