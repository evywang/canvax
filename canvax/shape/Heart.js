KISSY.add("canvax/shape/Heart" , function(S , Shape){

   var Heart = function(opt){
       var self = this;
       this.type = "Heart";
       opt.context || (opt.context = {});
       self._style = {
           //x             : 0,//{number},  // 必须，心形内部尖端横坐标
           //y             : 0,//{number},  // 必须，心形内部尖端纵坐标
           a : opt.context.a || 0,//{number},  // 必须，心形横宽（中轴线到水平边缘最宽处距离）
           b : opt.context.b || 0 //{number},  // 必须，心形纵高（内尖到外尖距离）
       }
       arguments.callee.superclass.constructor.apply(this , arguments);

   };



   S.extend(Heart , Shape , {
       draw : function(ctx, style) {
           ctx.moveTo(0,0 );
           ctx.bezierCurveTo(
               style.a / 2,
               - style.b * 2 / 3,
               style.a * 2,
               style.b / 3,
               0,
               style.b
               );
           ctx.bezierCurveTo(
               - style.a *  2,
               style.b / 3,
               - style.a / 2,
               - style.b * 2 / 3,
               0,
               0
               );
           return;
       },
       getRect : function(style){
           var lineWidth;
           if (style.fillStyle || style.strokeStyle ) {
               lineWidth = style.lineWidth || 1;
           } else {
               lineWidth = 0;
           }
           return {
                 x : Math.round(0 - style.a - lineWidth / 2),
                 y : Math.round(0 - style.b / 4 - lineWidth / 2),
                 width : style.a * 2 + lineWidth,
                 height : style.b * 5 / 4 + lineWidth
           };

       }
   });

   return Heart;


} , {
   requires : [
     "canvax/display/Shape" 
   ]
})
