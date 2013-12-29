/**
 * Canvax
 *
 * @author 释剑 (李涛, litao.lt@alibaba-inc.com)
 *
 * 主引擎 类
 *
 * 负责所有canvas的层级管理，和心跳机制的实现,捕获到心跳包后 
 * 分发到对应的stage(canvas)来绘制对应的改动
 * 然后 默认有实现了shape的 mouseover  mouseout  drag 事件
 *
 **/


KISSY.add("canvax/index" ,
   function( S , DisplayObjectContainer , Stage , Base , StageEvent , propertyFactory , Sprite , Text , Shape , Movieclip , Bitmap , Shapes ){
   var Canvax=function(opt){
       var self = this;
       self.type = "canvax";
       
       self.el = opt.el || null;
       self.mouseTarget = null;
       self.dragTarget = null;

       //每帧 由 心跳 上报的 需要重绘的stages 列表
       self.convertStages = [];

       self.rootOffset = {
          left:0,top:0
       };
       self.mouseX = 0;
       self.mouseY = 0;

       self._heartBeat = false;//心跳，默认为false，即false的时候引擎处于静默状态 true则启动渲染
       
       //设置帧率
       self._speedTime = parseInt(1000/Base.mainFrameRate);
       self._preRenderTime = 0;

       //任务列表, 如果_taskList 不为空，那么主引擎就一直跑
       //为 含有__enterFrame 方法 DisplayObject 的对象列表
       //比如Movieclip的__enterFrame方法。
       self._taskList = [];
       
       self._Event = null;

       self._hoverStage = null;
       
       //为整个项目提供像素检测的容器
       self._pixelCtx = null;

       self._isReady = false;

       /**
        *交互相关属性
        * */
       //接触canvas
       self._touching = false;
       //正在拖动，前提是_touching=true
       self._draging =false;
       
       arguments.callee.superclass.constructor.apply(this, arguments);
       
   };
   
   Base.creatClass(Canvax , DisplayObjectContainer , {
       init : function(){
          var self = this;

          self.context.width = self.el.width();
          self.context.height = self.el.height();

          //然后创建一个用于绘制激活shape的 stage到activation
          self._creatHoverStage();

          //初始化事件委托到root元素上面
          self._initEvent();

          //创建一个如果要用像素检测的时候的容器
          self.createPixelContext();
          
          self._isReady = true;
       },
       _creatHoverStage : function(){
          //TODO:创建stage的时候一定要传入width height  两个参数
          var self = this;
          self._hoverStage = new Stage( {
            id : "activCanvas"+(new Date()).getTime(),
            context : {
              width : self.context.width,
              height: self.context.height
            }
          } );
          self.addChild( self._hoverStage );
       },
       _initEvent : function(){
          //初始绑定事件，为后续的displayList的事件分发提供入口
          var self = this;
          self.rootOffset = self.el.offset();
          self._Event = new StageEvent();
          self.el.on("click" , function(e){
               var mouseX = e.pageX - self.rootOffset.left;
               var mouseY = e.pageY - self.rootOffset.top;

               if (self.mouseX != mouseX){
                   self.mouseX = mouseX;
               };
               if (self.mouseY != mouseY){
                   self.mouseY = mouseY;
               };
               var list = self.getObjectsUnderPoint(mouseX , mouseY);
          });

          //delegate mouse events on the el
          self.el.on("mousedown" , function(e){
               self.__mouseHandler(e);
          });  
          self._moveStep = 0;
          self.el.on("mousemove" , function(e){
               if(self._moveStep<1){
                  self._moveStep++;
                  return;
               }
               self._moveStep = 0;
               self.__mouseHandler(e);
          });  
          self.el.on("mouseup" , function(e){
               self.__mouseHandler(e);
          });
          self.el.on("mouseout" , function(e){
               self.__mouseHandler(e);
          });

       },
       /**
        * 获取像素拾取专用的上下文
        * @return {Object} 上下文
       */
       createPixelContext : function() {
           var self = this;
           var _pixelCanvas = null;
           if(S.all("#_pixelCanvas").length==0){
              _pixelCanvas=Base._createCanvas("_pixelCanvas",self.context.width,self.context.height); 
           } else {
              _pixelCanvas=S.all("#_pixelCanvas")[0];
           }
           
           if(typeof FlashCanvas != "undefined" && FlashCanvas.initElement){
               FlashCanvas.initElement( _pixelCanvas );
           }

           document.body.appendChild( _pixelCanvas );

           _pixelCanvas.style.display = "none";

           self._pixelCtx = _pixelCanvas.getContext('2d');

       },
       /*
        * 鼠标事件处理函数
        * */
       __mouseHandler : function(event) {
           var self = this;
           var mouseX = event.pageX - self.rootOffset.left;
           var mouseY = event.pageY - self.rootOffset.top;
           
           //stage拥有mouseX and mouseY
           self.mouseX = mouseX;
           self.mouseY = mouseY;

           if(event.type == "mousedown"){
              
              if(!self.mouseTarget){
                var obj = self.getObjectsUnderPoint(self.mouseX, self.mouseY, 1)[0];
                if(obj){
                  self.mouseTarget = obj;
                }
              }
              self.mouseTarget && self.dragEnabled && (self._touching = true);
           }

           if(event.type == "mouseup" || event.type == "mouseout"){
              if(self._draging == true){
                 //说明刚刚在拖动
                 self._dragEnd();
              }
              self._draging  = false;
              self._touching = false;
           }

           if(event.type=="mouseout"){
              self.__getMouseTarget(event);
           }
 
           if( event.type == "mousemove" || event.type == "mousedown" ){
               //拖动过程中就不在做其他的mouseover检测，drag优先
               if(self._touching && event.type == "mousemove" && self.mouseTarget){
                  //说明正在拖动啊
                  if(!self._draging){
                     //begin drag
                     self.mouseTarget.dragBegin && self.mouseTarget.dragBegin(event);
                     
                     //先把本尊给隐藏了
                     self.mouseTarget.context.visible = false;
                                          
                     //然后克隆一个副本到activeStage
                     self._clone2hoverStage();
                  } else {
                     //drag ing
                     self._dragIng();
                  }
                  self._draging = true;
                  return self;
               }
               //常规mousemove检测
               //move事件中，需要不停的搜索target，这个开销挺大，
               //后续可以优化，加上和帧率相当的延迟处理
               this.__getMouseTarget(event);

           } else {
               //其他的事件就直接在target上面派发事件
               if(this.mouseTarget){
                   //event
                   var e = _.extend(self._Event , event);
                   e.target = e.currentTarget = this.mouseTarget || this;
                   e.mouseX = this.mouseX;
                   e.mouseY = this.mouseY;

                   //dispatch event
                   this.mouseTarget.dispatchEvent(e);
               }
           }
           //disable text selection on the canvas, works like a charm.	
           event.preventDefault();
           event.stopPropagation();
       },
       __getMouseTarget : function(event) {

           var oldObj = this.mouseTarget;
           if(event.type=="mousemove" && oldObj && oldObj.hitTestPoint(this.mouseX, this.mouseY)){
               //小优化,鼠标move的时候。计算频率太大，所以。做此优化
               //如果有target存在，而且当前鼠标还在target内,就没必要取检测整个displayList了
               return;
           }
           var obj = this.getObjectsUnderPoint(this.mouseX, this.mouseY, 1)[0];
           var e = _.extend(this._Event , event);

           e.target = e.currentTarget = obj;
           e.mouseX = this.mouseX;
           e.mouseY = this.mouseY;

           if(oldObj && oldObj != obj || e.type=="mouseout") {
               if(!oldObj){
                  return;
               }
               this.mouseTarget = null;
               e.type = "mouseout";
               e.target = e.currentTarget = oldObj;
               //之所以放在dispatchEvent(e)之前，是因为有可能用户的mouseout处理函数
               //会有修改visible的意愿
               if(!oldObj.context.visible){
                  oldObj.context.visible = true;
               }
               oldObj.dispatchEvent(e);
               this.setCursor("default");
           };
           if(obj && oldObj != obj && obj._hoverable){
               this.mouseTarget = obj;
               e.type = "mouseover";
               e.target = e.currentTarget = obj;
               obj.dispatchEvent(e);
               this.setCursor(obj.context.cursor);
           };
       },
       //克隆一个元素到hover stage中去
       _clone2hoverStage : function(){
           var self = this;
           var _dragDuplicate = self._hoverStage.getChildById(self.mouseTarget.id);
           if(!_dragDuplicate){
               _dragDuplicate = self.mouseTarget.clone(true);
               _dragDuplicate._transform = _dragDuplicate.getConcatenatedMatrix();
               self._hoverStage.addChild( _dragDuplicate );
           }
           _dragDuplicate.context = propertyFactory(self.mouseTarget.context.$model);
           _dragDuplicate.context.$owner = _dragDuplicate;
           _dragDuplicate.context.$watch = self.mouseTarget.context.$watch;
           _dragDuplicate.context.visible = true;

           _dragDuplicate._dragPoint = _dragDuplicate.globalToLocal(self.mouseX , self.mouseY)
       },
       //drag 中 的处理函数
       _dragIng  : function(){
           var self = this;
           var _dragDuplicate = self._hoverStage.getChildById(self.mouseTarget.id);
           _dragDuplicate.context.x = self.mouseX - _dragDuplicate._dragPoint.x; 
           _dragDuplicate.context.y = self.mouseY - _dragDuplicate._dragPoint.y;  
           self.mouseTarget.drag && self.mouseTarget.drag(event);
       },
       //drag结束的处理函数
       _dragEnd  : function(){
           var self = this;
           self.dragEnd && self.dragEnd(event);  
           //拖动停止， 那么要先把本尊给显示出来先
           //这里还可以做优化，因为拖动停止了但是还是在hover状态，没必要把本尊显示的。
           //self.mouseTarget.context.visible = true;

           //_dragDuplicate 复制在_hoverStage 中的副本
           var _dragDuplicate = self._hoverStage.getChildById(self.mouseTarget.id);
           self.mouseTarget.context = _dragDuplicate.context;
           self.mouseTarget.context.$owner = self.mouseTarget;
           //这个时候的target还是隐藏状态呢
           self.mouseTarget.context.visible = false;
           self.mouseTarget._updateTransform();
           if(event.type == "mouseout"){
               _dragDuplicate.destroy();
           }
       },
       setCursor : function(cursor) {
           this.el.css("cursor" , cursor)
       },
       setFrameRate : function(frameRate) {
          if(Base.mainFrameRate == frameRate) {
              return;
          }
          Base.mainFrameRate = frameRate;

          //根据最新的帧率，来计算最新的间隔刷新时间
          this._speedTime = parseInt(1000/Base.mainFrameRate);
       },

       //如果引擎处于静默状态的话，就会启动
       __startEnter : function(){
          var self = this;
          if(!self.requestAid){
              self.requestAid = requestAnimationFrame( _.bind(self.__enterFrame,self) );
          }
       },
       __enterFrame : function(){
           var self = this;

           //不管怎么样，__enterFrame执行了就要把
           //requestAid null 掉
           self.requestAid = null;
           Base.now = new Date().getTime();

           if(self._heartBeat){

               if((Base.now-self._preRenderTime) < self._speedTime ){
                   //事件speed不够，下一帧再来
                   self.__startEnter();
                   //self.requestAid = requestAnimationFrame( _.bind(self.__enterFrame,self) );
                   return;
               }

               _.each(_.values(self.convertStages) , function(convertStage){
                  convertStage.stage._render(convertStage.stage.context2D);
               });
           
               self._heartBeat = false;
               self.convertStages = {};

               //渲染完了，打上最新时间挫
               self._preRenderTime = new Date().getTime();
           }
           
           //先跑任务队列,因为有可能再具体的hander中会把自己清除掉
           //所以跑任务和下面的length检测分开来
           if(self._taskList.length > 0){
              for(var i=0,l=self._taskList.length;i<l;i++){
                 var obj = self._taskList[i];
                 if(obj.__enterFrame){
                    obj.__enterFrame();
                 } else {
                    self.__taskList.splice(i-- , 1);
                 }
              }  
           }
           //如果依然还有任务。 就继续enterFrame.
           if(self._taskList.length > 0){
              self.__startEnter();
              //self.requestAid = requestAnimationFrame( _.bind(self.__enterFrame,self) );
           }
       },
       afterAddChild : function(stage){
           if(this.children.length==1){
               this.el.append(stage.context2D.canvas);
           } else if(this.children.length>1) {
               this.el[0].insertBefore(stage.context2D.canvas , this._hoverStage.context2D.canvas);
           }
       },
       afterDelChild : function(stage){
       
       },
       heartBeat : function( opt ){
           //displayList中某个属性改变了
           var self = this;

           //心跳包有两种，一种是某元素的可视属性改变了。一种是children有变动
           //分别对应convertType  为 context  and children
           if (opt.convertType == "context"){
               var stage   = opt.stage;
               var shape   = opt.shape;
               var name    = opt.name;
               var value   = opt.value;
               var preValue=opt.preValue;

               if (!self._isReady) {
                   //在还没初始化完毕的情况下，无需做任何处理
                   return;
               }

               if(!self.convertStages[stage.id]){
                   self.convertStages[stage.id]={
                       stage : stage,
                       convertShapes : {}
                   }
               };

               if(shape){
                   if (!self.convertStages[stage.id].convertShapes[shape.id]){
                       self.convertStages[stage.id].convertShapes[shape.id]={
                           shape : shape,
                           convertType : null,
                           convertLog  : []
                       }
                   }
                   var ss = self.convertStages[stage.id].convertShapes[shape.id];
                   ss.convertLog.push(name,value,preValue);
               }
           }

           if (opt.convertType == "children"){
               //元素结构变化，比如addchild removeChild等
               var target = opt.target;
               var stage = opt.src.getStage();
               if( stage || (target.type=="Stage") ){
                   //如果操作的目标元素是Stage
                   stage = stage || target;
                   if(!self.convertStages[stage.id]) {
                       self.convertStages[stage.id]={
                           stage : stage ,
                           convertShapes : {}
                       }
                   }
               }
           }

           if(!opt.convertType){
               //无条件要求刷新
               var stage = opt.stage;
               if(!self.convertStages[stage.id]) {
                   self.convertStages[stage.id]={
                       stage : stage ,
                       convertShapes : {}
                   }
               }
           }

           if (!self._heartBeat){
              //如果发现引擎在静默状态，那么就唤醒引擎
              self._heartBeat = true;
              self.__startEnter();
              //self.requestAid = requestAnimationFrame( _.bind(self.__enterFrame,self) );
           } else {
              //否则智慧继续确认心跳
              self._heartBeat = true;
           }
                
       }
       
   } );

   Canvax.propertyFactory = propertyFactory;

   //给Canvax 添加静态对象，指向stage ,shape,text,sprite等类
   Canvax.Display ={
      Stage   : Stage,
      Sprite  : Sprite,
      Text    : Text,
      Shape   : Shape,
      Moveiclip: Movieclip,
      Bitmap  : Bitmap
   }
   //所有自定义shape的集合，可以直接再这个上面获取不必强制引入use('canvax/shape/Circle')这样
   Canvax.Shapes = Shapes;

   return Canvax;
} , {
   requires : [
    "canvax/display/DisplayObjectContainer" ,
    "canvax/display/Stage", 
    "canvax/core/Base",
    "canvax/event/StageEvent",
    "canvax/core/propertyFactory",
    
    "canvax/display/Sprite",
    //"canvax/display/Stage",
    "canvax/display/Text",
    "canvax/display/Shape",
    "canvax/display/Movieclip",
    "canvax/display/Bitmap",

    "canvax/shape/Shapes", //所有自定义shape的集合

    "canvax/animation/animation"
    ]
});
