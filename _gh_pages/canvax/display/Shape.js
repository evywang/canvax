/**
 * Canvax
 *
 * @author 释剑 (李涛, litao.lt@alibaba-inc.com)
 *
 * 模拟as3 DisplayList 中的shape 类
 */



KISSY.add("canvax/display/Shape" , function( S , DisplayObject , vec2 , Base  ){

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


   Base.creatClass(Shape , DisplayObject , {
      init : function(){
      },
      /*
       *下面两个方法为提供给 具体的 图形类覆盖实现，本shape类不提供具体实现
       *draw() 绘制   and   setRect()获取该类的矩形边界
      */
      draw:function(){
      
      },
      getRect:function(style){
          return style
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
          if(this._hasFillAndStroke){
              //如果在子shape类里面已经实现stroke fill 等操作， 就不需要统一的d
              return;
          }


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
      ,
      /*
       * 画虚线
       */
      dashedLineTo:function(ctx, x1, y1, x2, y2, dashLength) {
            dashLength = typeof dashLength == 'undefined'
                         ? 5 : dashLength;
            var deltaX = x2 - x1;
            var deltaY = y2 - y1;
            var numDashes = Math.floor(
                Math.sqrt(deltaX * deltaX + deltaY * deltaY) / dashLength
            );
            for (var i = 0; i < numDashes; ++i) {
                ctx[i % 2 === 0 ? 'moveTo' : 'lineTo'](
                    x1 + (deltaX / numDashes) * i,
                    y1 + (deltaY / numDashes) * i
                );
            }
      }
   });

   return Shape;

},{
  requires:[
    "canvax/display/DisplayObject",
    "canvax/geom/Vector",
    "canvax/core/Base"
  ]
})
