KISSY.add("canvax/shape/Polygon" , function(S , Shape){

   var Polygon=function(opt){
       var self = this;
       self.type = "Polygon";

       opt.context || (opt.context = {});
       self._style = {
           pointList     : opt.context.pointList || []  //{Array},   // 必须，多边形各个顶角坐标
       }
       arguments.callee.superclass.constructor.apply(this, arguments);

   };

  
   S.extend( Polygon , Shape , {
       draw : function(ctx, style) {
           var pointList = style.pointList.$model;
           ctx.moveTo(pointList[0][0],pointList[0][1]);
           for (var i = 1, l = pointList.length; i < l; i++) {
               ctx.lineTo(pointList[i][0],pointList[i][1]);
           }
           ctx.lineTo(pointList[0][0],pointList[0][1]);
           return;
       },
       getRect : function(style) {
           var minX =  Number.MAX_VALUE;
           var maxX =  Number.MIN_VALUE;
           var minY = Number.MAX_VALUE;
           var maxY = Number.MIN_VALUE;

           var pointList = style.pointList.$model;
           for(var i = 0, l = pointList.length; i < l; i++) {
               if (pointList[i][0] < minX) {
                   minX = pointList[i][0];
               }
               if (pointList[i][0] > maxX) {
                   maxX = pointList[i][0];
               }
               if (pointList[i][1] < minY) {
                   minY = pointList[i][1];
               }
               if (pointList[i][1] > maxY) {
                   maxY = pointList[i][1];
               }
           }

           var lineWidth;
           if (style.strokeStyle || style.fillStyle  ) {
               lineWidth = style.lineWidth || 1;
           } else {
               lineWidth = 0;
           }
           return {
               x : Math.round(minX - lineWidth / 2),
               y : Math.round(minY - lineWidth / 2),
               width : maxX - minX + lineWidth,
               height : maxY - minY + lineWidth
           };
       }

   } );

   return Polygon;


},{
   requires:[
     "canvax/display/Shape" 
   ]
});
