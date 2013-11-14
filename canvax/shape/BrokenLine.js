/**
 * BrokenLine类：折线
 * 继承自shape：
 */
KISSY.add("canvax/shape/BrokenLine" , function(S , Shape , Polygon , Base){
   var BrokenLine = function(opt){
       var self = this;
       self.type = "BrokenLine";
       self.drawTypeOnly = "stroke";

       opt.context || (opt.context={})
       self._style = {
           pointList  : opt.context.pointList || [] //{Array}  // 必须，各个顶角坐标
       }
       
       
       arguments.callee.superclass.constructor.apply(this, arguments);
   }

   Base.creatClass(BrokenLine , Shape , {
       draw : function(ctx, style) {
           var pointList = style.pointList.$model;
           if (pointList.length < 2) {
               // 少于2个点就不画了~
               return;
           }
           if (!style.lineType || style.lineType == 'solid') {
               //默认为实线
               ctx.moveTo(pointList[0][0],pointList[0][1]);
               for (var i = 1, l = pointList.length; i < l; i++) {
                   ctx.lineTo(pointList[i][0],pointList[i][1]);
               }
           } else if (style.lineType == 'dashed' || style.lineType == 'dotted') {
               //画虚线的方法  by loutongbing@baidu.com
               var lineWidth = style.lineWidth || 1;
               var dashPattern = [ lineWidth * (style.lineType == 'dashed' ? 6 : 1), lineWidth * 4 ];
               ctx.moveTo(pointList[0][0],pointList[0][1]);
               for (var i = 1, l = pointList.length; i < l; i++) {
                   var fromX = pointList[i - 1][0];
                   var toX = pointList[i][0];
                   var fromY = pointList[i - 1][1];
                   var toY = pointList[i][1];
                   var dx = toX - fromX;
                   var dy = toY - fromY;
                   var angle = Math.atan2(dy, dx);
                   var x = fromX;
                   var y = fromY;
                   var idx = 0;
                   var draw = true;
                   var dashLength;
                   var nx;
                   var ny;

                   while (!((dx < 0 ? x <= toX : x >= toX) && (dy < 0 ? y <= toY : y >= toY))) {
                       dashLength = dashPattern[
                           idx++ % dashPattern.length
                           ];
                       nx = x + (Math.cos(angle) * dashLength);
                       x = dx < 0 ? Math.max(toX, nx) : Math.min(toX, nx);
                       ny = y + (Math.sin(angle) * dashLength);
                       y = dy < 0 ? Math.max(toY, ny) : Math.min(toY, ny);
                       if (draw) {
                           ctx.lineTo(x, y);
                       } else {
                           ctx.moveTo(x, y);
                       }
                       draw = !draw;
                   }
               }
           }


           return;
       },
       getRect :  function(style) {
           return Polygon.prototype.getRect(style);
       }


   
   });

   return BrokenLine;

} , {
   requires:[
     "canvax/display/Shape",
     "canvax/shape/Polygon",
     "canvax/core/Base"
   ]
});
