KISSY.add("canvax/display/Shape" , function( S , DisplayObject , Graphics , core){

   var Shape = function(opt){
       
       var self = this;
       //元素是否有hover事件 和 chick事件，由addEvenetLister和remiveEventLister来触发修改
       self._hoverable = false;
       self._clickable = false;

       //over的时候如果有修改样式，就为true
       self._hoverClass = false;

       //拖拽drag的时候显示在activShape的副本
       self._dragDuplicate = null;

       //元素是否 开启 drag 拖动，这个有用户设置传入
       self.draggable = opt.draggable || false;

       arguments.callee.superclass.constructor.apply(this , arguments);
   
       self.type = self.type || "shape" ;
       self._rect = null;



   };


   S.extend(Shape , DisplayObject , {
      init : function(){
      },
      /*
       *下面两个方法为提供给 具体的 图形类覆盖实现，本shape类不提供具体实现
       *draw() 绘制   and   setRect()获取该类的矩形边界
      */
      draw:function(){
      
      },
      getRect:function(){
      
      },
          
 

      setContextStyle : function(ctx, style) {
          // 简单判断不做严格类型检测
          for (p in style){
              if(p in ctx){
                if (style[p]) {
                  ctx[p] = style[p];
                }
              }
          }
          return;
      },
      drawEnd : function(ctx){

          //style 要从diaplayObject的 context上面去取

          var style = this.context;
        
          //fill stroke 之前， 就应该要closepath 否则线条转角口会有缺口。
          //drawTypeOnly 由继承shape的具体绘制类提供
          if ( this.drawTypeOnly != "stroke" ){
             ctx.closePath();
          }


          if ( style.strokeStyle || style.lineWidth ){
              ctx.stroke();
          }
          //比如贝塞尔曲线画的线,drawTypeOnly==stroke，是不能使用fill的，后果很严重
          if (style.fillStyle && this.drawTypeOnly!="stroke"){
              ctx.fill();
          }
          
      },


      render : function(){
         var self = this;
         var style = self.context;
         var context = self.getStage().context2D;
         self.graphics || (self.graphics = new Graphics({_context : context}));

         if (style){
           self.setContextStyle( context ,style );
         }
         
         if (self.context.type == "shape"){
             //type == shape的时候，自定义绘画
             //这个时候就可以使用self.graphics绘图接口了，该接口模拟的是as3的接口
             self.draw.apply( self );
         } else {
             //这个时候，说明该shape是调用已经绘制好的 shape 模块，这些模块全部在../shape目录下面
             if(self.draw){
                 context.beginPath();
                 self.draw( context , style );
                 self.drawEnd(context);
             }        
         }
      }
   });

   return Shape;

},{
  requires:[
    "canvax/display/DisplayObject",
    "canvax/display/Graphics",
    "canvax/core/Core",
  ]
})
