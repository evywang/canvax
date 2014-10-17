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
KISSY.add(function( 
       S ,
       Base , CanvaxEvent , EventBase , EventDispatcher , EventManager , 
       DisplayObjectContainer , 
       Stage , Sprite , Shape , Point , Bitmap , Text , Movieclip  
   ) {
       
   var Canvax = function( opt ){
       this.type = "canvax";
       
       this.el   = opt.el || null;

       //是否阻止浏览器默认事件的执行
       this.preventDefault = true;
       if( opt.preventDefault === false ){
           this.preventDefault = false
       }

       //如果这个时候el里面已经有东西了。嗯，也许曾经这个el被canvax干过一次了。
       //那么要先清除这个el的所有内容。
       //默认的el是一个自己创建的div，因为要在这个div上面注册n多个事件 来 在整个canvax系统里面进行事件分发。
       //所以不能直接用配置传进来的el对象。因为可能会重复添加很多的事件在上面。导致很多内容无法释放。
       this.el.html("<div class='' style='width:" + this.el.width() + "px;height:" + this.el.height() + "px;'></div>");
       this.el = this.el.all("div");

       this.rootOffset      = this.el.offset();

       this.curPoints       = [ new Point( 0 , 0 ) ] //X,Y 的 point 集合, 在touch下面则为 touch的集合，只是这个touch被添加了对应的x，y

       //当前激活的点对应的obj，在touch下可以是个数组,和上面的curPoints对应
       this.curPointsTarget = [];

       //每帧 由 心跳 上报的 需要重绘的stages 列表
       this.convertStages = {};

       this._heartBeat = false;//心跳，默认为false，即false的时候引擎处于静默状态 true则启动渲染
       
       //设置帧率
       this._speedTime = parseInt(1000/Base.mainFrameRate);
       this._preRenderTime = 0;

       //任务列表, 如果_taskList 不为空，那么主引擎就一直跑
       //为 含有__enterFrame 方法 DisplayObject 的对象列表
       //比如Movieclip的__enterFrame方法。
       this._taskList = [];
       
       this._hoverStage = null;
       
       //为整个项目提供像素检测的容器
       this._pixelCtx = null;

       this._isReady = false;

       /**
        *交互相关属性
        * */
       //接触canvas
       this._touching = false;
       //正在拖动，前提是_touching=true
       this._draging =false;

       //当前的鼠标状态
       this._cursor  = "default";
       
       arguments.callee.superclass.constructor.apply(this, arguments);
       
   };
   
   Base.creatClass(Canvax , DisplayObjectContainer , {
       init : function(){
          this.context.width  = this.el.width();
          this.context.height = this.el.height();

          //然后创建一个用于绘制激活shape的 stage到activation
          this._creatHoverStage();

          //初始化事件委托到root元素上面
          this._initEvent();

          //创建一个如果要用像素检测的时候的容器
          this.createPixelContext();
          
          this._isReady = true;
       },
       reSet : function(){
          //重新设置坐标系统 高宽 等。
          this.rootOffset      = this.el.offset();
          this.context.width  = this.el.width();
          this.context.height = this.el.height();

       },
       _creatHoverStage : function(){
          //TODO:创建stage的时候一定要传入width height  两个参数
          this._hoverStage = new Stage( {
            id : "activCanvas"+(new Date()).getTime(),
            context : {
              width : this.context.width,
              height: this.context.height
            }
          } );
          this.addChild( this._hoverStage );
       },
       /**
        * 获取像素拾取专用的上下文
        * @return {Object} 上下文
       */
       createPixelContext : function() {
           
           var _pixelCanvas = null;
           if(S.all("#_pixelCanvas").length==0){
              _pixelCanvas = Base._createCanvas("_pixelCanvas" , this.context.width , this.context.height); 
           } else {
              _pixelCanvas = S.all("#_pixelCanvas")[0];
           }
           
           document.body.appendChild( _pixelCanvas );

           Base.initElement( _pixelCanvas );

           if( Base.canvasSupport() ){
               //canvas的话，哪怕是display:none的页可以用来左像素检测和measureText文本width检测
               _pixelCanvas.style.display    = "none";
           } else {
               //flashCanvas 的话，swf如果display:none了。就做不了measureText 文本宽度 检测了
               _pixelCanvas.style.zIndex     = -1;
               _pixelCanvas.style.position   = "absolute";
               _pixelCanvas.style.left       = - this.context.width  + "px";
               _pixelCanvas.style.top        = - this.context.height + "px";
               _pixelCanvas.style.visibility = "hidden";
           }
           Base._pixelCtx = _pixelCanvas.getContext('2d');
       },
       _initEvent : function(){
          //初始绑定事件，为后续的displayList的事件分发提供入口
          var self = this;
          var _moveStep = 0; //move的时候的频率设置

          if( !(window.Hammer && Hammer.NO_MOUSEEVENTS) ) {
              //依次添加上浏览器的自带事件侦听
              _.each( CanvaxEvent.EVENTS , function( type ){
                  CanvaxEvent.addEvent( self.el , type , function( e ){
                      //如果发现是mousemove的话，要做mousemove的频率控制
                      if( e.type == "mousemove" ){
                          if(_moveStep<1){
                              _moveStep++;
                              return;
                          }
                          _moveStep = 0;
                      }
                      self.__mouseHandler( e );
                  } ); 
              } );
          } 

          //触屏系统则引入Hammer
          if( window.Hammer && Hammer.HAS_TOUCHEVENTS ){
              var el = self.el[0]
              self._hammer = Hammer( el ).on( Hammer.EventsTypes , function( e ){
                 
                 //console.log(e.type)
                 //同样的，如果是drag事件，则要频率控制
                 if( e.type == "drag" ){
                      if(_moveStep<1){
                          _moveStep++;
                          return;
                      }
                      _moveStep = 0;
                 }

                 if( e.type == "touch" ){
                      //再移动端，每次touch的时候重新计算rootOffset
                      //无奈之举，因为宿主rootOffset不是一直再那个位置。
                      //经常再一些业务场景下面。会被移动了position
                      self.rootOffset = self.el.offset();
                 }

                 self.__touchHandler( e );
              } );
          }

       },
       
       /*
        *触屏事件处理函数
        * */
       __touchHandler : function( e ) {
          var self = this;

          //用hamer的方式来阻止执行浏览器默认事件
          if( this.preventDefault ) {
              this._hammer.options.prevent_default = true
          } else {
              this._hammer.options.prevent_default = false
          }

          //touch下的curPointsTarget 从touches中来
          //获取canvax坐标系统里面的坐标
          self.curPoints = self.__getCanvaxPointInTouchs( e );

          if( e.type == "release" ) {
              if(!self.__dispatchEventInChilds( e , self.curPointsTarget )){
                 //如果当前没有一个target，就把事件派发到canvax上面
                 self.__dispatchEventInChilds( e , [ self ] );
              }
          } else {
              //drag开始
              if( e.type == "dragstart"){
                  //dragstart的时候touch已经准备好了target，curPointsTarget里面只要有一个是有效的
                  //就认为drags开始
                  _.each( self.curPointsTarget , function( child , i ){
                      if( child && child.dragEnabled ){
                         //只要有一个元素就认为正在准备drag了
                         self._draging = true;
                         //然后克隆一个副本到activeStage
                         self._clone2hoverStage( child ,i );
                         //先把本尊给隐藏了
                         child.context.visible = false;

                         return false;
                      }
                  } ) 
              }

              //dragIng
              if( e.type == "drag"){
                  if( self._draging ){
                      _.each( self.curPointsTarget , function( child , i ){
                          if( child && child.dragEnabled) {
                             self._dragHander( e , child , i);
                          }
                      } )
                  }
              }

              //drag结束
              if( e.type == "dragend"){
                  if( self._draging ){
                      _.each( self.curPointsTarget , function( child , i ){
                          if( child && child.dragEnabled) {
                              self._dragEnd( e , child , 0 );
                              child.context.visible = true;
                          }
                      } );
                      self._draging = false;
                  }
              }

              var childs = self.__getChildInTouchs( self.curPoints );
              if(self.__dispatchEventInChilds( e , childs )){
                  if( e.type == "touch" ) {
                      self.curPointsTarget = childs;
                  }
              } else {
                  //如果当前没有一个target，就把事件派发到canvax上面
                  self.__dispatchEventInChilds( e , [ self ] );
              };
          }
       },
       /*
        *@param {array} childs 
        * */
       __dispatchEventInChilds : function( e , childs ){
           if( !childs && !("length" in childs) ){
             return false;
           }
           var self = this;
           var hasChild = false;
           _.each( childs , function( child , i){
               if( child ){
                   hasChild = true;
                   //ce
                   var ce         = Base.copyEvent( new CanvaxEvent() , e);
                   ce.target      = ce.currentTarget = child || this;
                   ce.stagePoint  = self.curPoints[i];
                   ce.point       = ce.target.globalToLocal( ce.stagePoint );
                   child.dispatchEvent( ce );
               }
           } );
           return hasChild;
       },
       //从touchs中获取到对应touch , 在上面添加上canvax坐标系统的x，y
       __getCanvaxPointInTouchs : function( e ){
           var self          = this;
           var curTouchs    = [];
           _.each( e.gesture.touches , function( touch ){
              touch.x = touch.pageX - self.rootOffset.left , 
              touch.y = touch.pageY - self.rootOffset.top
              curTouchs.push( touch );
           });
          return curTouchs;
       },
       __getChildInTouchs : function( touchs ){
          var self = this;
          var touchesTarget = [];
          _.each( touchs , function(touch){
              touchesTarget.push( self.getObjectsUnderPoint( touch , 1)[0] );
          } );
          return touchesTarget;
       },
       /*
        *触屏类处理结束
        * */


       /*
        * 鼠标事件处理函数
        * */
       __mouseHandler : function(e) {
           var self = this;
           self.curPoints = [ new Point( 
                   ( e.pageX || e.x ) - self.rootOffset.left , 
                   ( e.pageY || e.y ) - self.rootOffset.top
                   )];

           var curMousePoint  = self.curPoints[0]; 
           var curMouseTarget = self.curPointsTarget[0];

           //mousedown的时候 如果 curMouseTarget.dragEnabled 为true。就要开始准备drag了
           if( e.type == "mousedown" ){
              //如果curTarget 的数组为空或者第一个为falsh ，，，
              if( !curMouseTarget ){
                var obj = self.getObjectsUnderPoint( curMousePoint , 1)[0];
                if(obj){
                  self.curPointsTarget = [ obj ];
                }
              }
              curMouseTarget = self.curPointsTarget[0];
              if ( curMouseTarget && self.dragEnabled ){
                  self._touching = true
              }
           }

           if( e.type == "mouseup" || e.type == "mouseout" ){
              if(self._draging == true){
                 //说明刚刚在拖动
                 self._dragEnd( e , curMouseTarget , 0 );
              }
              self._draging  = false;
              self._touching = false;
           }

           if( e.type == "mouseout" ){
              self.__getcurPointsTarget(e , curMousePoint);
           }

           if( e.type == "mousemove" ){  //|| e.type == "mousedown" ){
               //拖动过程中就不在做其他的mouseover检测，drag优先
               if(self._touching && e.type == "mousemove" && curMouseTarget){
                  //说明正在拖动啊
                  if(!self._draging){
                     //begin drag
                     curMouseTarget.dragBegin && curMouseTarget.dragBegin(e);
                     
                     //先把本尊给隐藏了
                     curMouseTarget.context.visible = false;
                                          
                     //然后克隆一个副本到activeStage
                     self._clone2hoverStage( curMouseTarget , 0 );
                  } else {
                     //drag ing
                     self._dragHander( e , curMouseTarget , 0 );
                  }
                  self._draging = true;
               } else {
                   //常规mousemove检测
                   //move事件中，需要不停的搜索target，这个开销挺大，
                   //后续可以优化，加上和帧率相当的延迟处理
                   self.__getcurPointsTarget( e , curMousePoint );
               }

           } else {
               //其他的事件就直接在target上面派发事件
               var child = curMouseTarget;
               if( !child ){
                   child = self;
               };

               self.__dispatchEventInChilds( e , [ child ] );
           }

           if( this.preventDefault ) {
               CanvaxEvent.stopDefault( e );
           }

       },
       __getcurPointsTarget : function(e , point ) {
           var oldObj = this.curPointsTarget[0];

           var e = Base.copyEvent( new CanvaxEvent() , e );

           if( e.type=="mousemove" && oldObj && oldObj.getChildInPoint( point ) ){
               //小优化,鼠标move的时候。计算频率太大，所以。做此优化
               //如果有target存在，而且当前鼠标还在target内,就没必要取检测整个displayList了
               //开发派发常规mousemove事件

               e.target = e.currentTarget = oldObj;
               e.point  = oldObj.globalToLocal( point );
               this._mouseEventDispatch( oldObj , e );
               return;
           }

           var obj = this.getObjectsUnderPoint( point , 1)[0];

           e.target = e.currentTarget = obj;
           e.point  = point;

           this._cursorHander( obj , oldObj );

           if(oldObj && oldObj != obj || e.type=="mouseout") {
               if(!oldObj){
                  return;
               }
               this.curPointsTarget[0] = null;
               e.type = "mouseout";
               e.target = e.currentTarget = oldObj;
               //之所以放在dispatchEvent(e)之前，是因为有可能用户的mouseout处理函数
               //会有修改visible的意愿
               if(!oldObj.context.visible){
                  oldObj.context.visible = true;
               }
               this._mouseEventDispatch( oldObj , e );
           };

           if( obj && oldObj != obj ){ //&& obj._hoverable 已经 干掉了
               this.curPointsTarget[0] = obj;
               e.type = "mouseover";
               e.target = e.currentTarget = obj;
               this._mouseEventDispatch( obj , e );
           };

       },
       _mouseEventDispatch : function( obj , e ){
           obj.dispatchEvent( e );
       },
       //克隆一个元素到hover stage中去
       _clone2hoverStage : function( target , i ){
           var self = this;
           var _dragDuplicate = self._hoverStage.getChildById( target.id );
           if(!_dragDuplicate){
               _dragDuplicate             = target.clone(true);
               _dragDuplicate._transform  = target.getConcatenatedMatrix();
               self._hoverStage.addChild( _dragDuplicate );
           }
           _dragDuplicate.context.visible = true;
           _dragDuplicate._dragPoint = target.globalToLocal( self.curPoints[ i ] );
       },
       //drag 中 的处理函数
       _dragHander  : function( e , target , i ){
           var self = this;
           var _dragDuplicate = self._hoverStage.getChildById( target.id );
           var gPoint = new Point( self.curPoints[i].x - _dragDuplicate._dragPoint.x , self.curPoints[i].y - _dragDuplicate._dragPoint.y );
           _dragDuplicate.context.x = gPoint.x; 
           _dragDuplicate.context.y = gPoint.y;  
           target.drag && target.drag( e );

           //要对应的修改本尊的位置，但是要告诉引擎不要watch这个时候的变化
           var tPoint = gPoint;
           if( target.type != "stage" && target.parent && target.parent.type != "stage" ){
               tPoint = target.parent.globalToLocal( gPoint );
           }
           target._notWatch = true;
           target.context.x = tPoint.x;
           target.context.y = tPoint.y;
           target._notWatch = false;
           //同步完毕本尊的位置
       },
       //drag结束的处理函数
       _dragEnd  : function( e , target , i ){
           var self = this;

           self.dragEnd && self.dragEnd( e );  
           //拖动停止， 那么要先把本尊给显示出来先
           //这里还可以做优化，因为拖动停止了但是还是在hover状态，没必要把本尊显示的。

           //_dragDuplicate 复制在_hoverStage 中的副本
           var _dragDuplicate     = self._hoverStage.getChildById( target.id );

           //这个时候的target还是隐藏状态呢
           target.context.visible = false;
           //target._updateTransform();
           if( e.type == "mouseout" || e.type == "dragend"){
               _dragDuplicate.destroy();
           }
       },
       _cursorHander    : function( obj , oldObj ){
           if(!obj && !oldObj ){
               this.setCursor("default");
           }
           if(obj && oldObj != obj){
               this.setCursor(obj.context.cursor);
           }
       },
       setCursor : function(cursor) {
           if(this._cursor == cursor){
             //如果两次要设置的鼠标状态是一样的
             return;
           }
           this.el.css("cursor" , cursor);
           this._cursor = cursor;
       },
       setFrameRate : function(frameRate) {
          if(Base.mainFrameRate == frameRate) {
              return;
          }
          Base.mainFrameRate = frameRate;

          //根据最新的帧率，来计算最新的间隔刷新时间
          this._speedTime = parseInt(1000/Base.mainFrameRate);
       },
       getFrameRate : function(){
          return  Base.mainFrameRate;
       },

       //如果引擎处于静默状态的话，就会启动
       __startEnter : function(){
          var self = this;
          if( !self.requestAid ){
              self.requestAid = requestAnimationFrame( _.bind( self.__enterFrame , self) );
          }
       },
       __enterFrame : function(){
           
           var self = this;
           //不管怎么样，__enterFrame执行了就要把
           //requestAid null 掉
           self.requestAid = null;
           Base.now = new Date().getTime();

           if( self._heartBeat ){

               //console.log(self._speedTime)
               if(( Base.now - self._preRenderTime ) < self._speedTime ){
                   //事件speed不够，下一帧再来
                   self.__startEnter();
                   return;
               }
               

               //开始渲染的事件
               self.fire("beginRender");

               _.each(_.values( self.convertStages ) , function(convertStage){
                  convertStage.stage._render( convertStage.stage.context2D );
               });

               self._heartBeat = false;

               
               //debugger;
               self.convertStages = {};

               //渲染完了，打上最新时间挫
               self._preRenderTime = new Date().getTime();

               //渲染结束
               self.fire("afterRender");
           }
           
           //先跑任务队列,因为有可能再具体的hander中会把自己清除掉
           //所以跑任务和下面的length检测分开来
           if(self._taskList.length > 0){
              for(var i=0,l = self._taskList.length ; i < l ; i++ ){
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
           }
       },
       _afterAddChild : function( stage , index ){
           var canvas;
           var contextInit = true;

           if(!stage.context2D){
               contextInit = false;
               canvas = Base._createCanvas( stage.id , this.context.width , this.context.height );
           } else {
               canvas = stage.context2D.canvas;
           }
           if(this.children.length == 1){
               this.el.append( canvas );
           } else if(this.children.length>1) {
               if( index == undefined ) {
                   //如果没有指定位置，那么就放到_hoverStage的下面。
                   this.el[0].insertBefore( canvas , this._hoverStage.context2D.canvas);
               } else {
                   //如果有指定的位置，那么就指定的位置来
                   if( index >= this.children.length-1 ){
                      this.el.append( canvas );
                   } else {
                      this.el[0].insertBefore( canvas , this.children[ index ].context2D.canvas );
                   }
               }
           };

           if( !contextInit ) {
               Base.initElement( canvas );
           }
           stage.initStage( canvas.getContext("2d") , this.context.width , this.context.height ); 
       },
       _afterDelChild : function(stage){
           this.el[0].removeChild( stage.context2D.canvas );
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
                   if (!self.convertStages[ stage.id ].convertShapes[ shape.id ]){
                       self.convertStages[ stage.id ].convertShapes[ shape.id ]={
                           shape : shape,
                           convertType : opt.convertType
                       }
                   } else {
                       //如果已经上报了该shape的心跳。
                       return;
                   }
               }
           }

           if (opt.convertType == "children"){
               //元素结构变化，比如addchild removeChild等
               var target = opt.target;
               var stage = opt.src.getStage();
               if( stage || (target.type=="stage") ){
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


   Canvax.Display = {
       Stage  : Stage,
       Sprite : Sprite,
       Shape  : Shape,
       Point  : Point,
       Bitmap : Bitmap,
       Text   : Text,
       Movieclip : Movieclip
   }

   Canvax.Event = {
       CanvaxEvent : CanvaxEvent,
       EventBase   : EventBase,
       EventDispatcher : EventDispatcher,
       EventManager : EventManager
   }


   return Canvax;

} , {
   requires : [
    "canvax/core/Base",
    "canvax/event/CanvaxEvent",
    "canvax/event/EventBase",
    "canvax/event/EventDispatcher",
    "canvax/event/EventManager",

    "canvax/display/DisplayObjectContainer" ,
    "canvax/display/Stage",
    "canvax/display/Sprite",
    "canvax/display/Shape",
    "canvax/display/Point",
    "canvax/display/Bitmap",
    "canvax/display/Text",
    "canvax/display/Movieclip"
    ]
});
