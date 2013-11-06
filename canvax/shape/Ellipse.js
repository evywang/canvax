KISSY.add("canvax/shape/Ellipse" , function(S,Shape){

   var Ellipse = function(opt){
       var self = this;
       self.type = "Ellipse";

       opt.context || (opt.context={})
       self._style = {
           //x             : 0 , //{number},  // 丢弃
           //y             : 0 , //{number},  // 丢弃，原因同circle
           a : opt.context.a || 0 , //{number},  // 必须，椭圆横轴半径
           b : opt.context.b || 0   //{number},  // 必须，椭圆纵轴半径
       }


       arguments.callee.superclass.constructor.apply(this, arguments);
   };

   S.extend(Ellipse , Shape , {
       draw :  function(ctx, style) {
           var r = (style.a > style.b) ? style.a : style.b;
           var ratioX = style.a / r; //横轴缩放比率
           var ratioY = style.b / r;
           
           ctx.scale(ratioX, ratioY);
           ctx.arc(
               0, 0, r, 0, Math.PI * 2, true
               );
           if ( document.createElement('canvas').getContext ){
              //ie下面要想绘制个椭圆出来，就不能执行这步了
              //算是excanvas 实现上面的一个bug吧
              ctx.scale(1/ratioX, 1/ratioY);

           }
           return;
       },
       getRect : function(style){
           var lineWidth;
           if (style.fillStyle || style.strokeStyle) {
               lineWidth = style.lineWidth || 1;
           }
           else {
               lineWidth = 0;
           }
           return {
                 x : Math.round(0 - style.a - lineWidth / 2),
                 y : Math.round(0 - style.b - lineWidth / 2),
                 width : style.a * 2 + lineWidth,
                 height : style.b * 2 + lineWidth
           };

       }
   });

   return Ellipse;

} , {
   requires : [
      "canvax/display/Shape" 
   ]
});
