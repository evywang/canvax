/**
 * BrokenLine类：折线
 * 继承自shape：
   {
       // 基础属性
       id     : {string},       // 必须，图形唯一标识，可通过zrender实例方法newShapeId生成

       // 样式属性，默认状态样式样式属性
       style  : {
           pointList     : {Array},   // 必须，各个顶角坐标
           strokeColor   : {color},   // 默认为'#000'，线条颜色（轮廓），支持rgba
           lineType      : {string},  // 默认为solid，线条类型，solid | dashed | dotted
           lineWidth     : {number},  // 默认为1，线条宽度
           lineCap       : {string},  // 默认为butt，线帽样式。butt | round | square
           lineJoin      : {string},  // 默认为miter，线段连接样式。miter | round | bevel
           miterLimit    : {number},  // 默认为10，最大斜接长度，仅当lineJoin为miter时生效

           opacity       : {number},  // 默认为1，透明度设置，如果color为rgba，则最终透明度效果叠加
           shadowBlur    : {number},  // 默认为0，阴影模糊度，大于0有效
           shadowColor   : {color},   // 默认为'#000'，阴影色彩，支持rgba
           shadowOffsetX : {number},  // 默认为0，阴影横向偏移，正值往右，负值往左
           shadowOffsetY : {number},  // 默认为0，阴影纵向偏移，正值往下，负值往上

       },

       // 样式属性，高亮样式属性，当不存在highlightStyle时使用基于默认样式扩展显示
       highlightStyle : {
           // 同style
       }

   }
         例子：
   {
       shape  : 'brokenLine',
       id     : '123456',
       zlevel : 1,
       style  : {
           pointList : [[10, 10], [300, 20], [298, 400], [50, 450]],
           strokeColor : '#eee',
           lineWidth : 20,
           text : 'Baidu'
       },
       myName : 'kener',  //可自带任何有效自定义属性

       clickable : true,
       onClick : function(eventPacket) {
           alert(eventPacket.target.myName);
       }
   }
 */
KISSY.add("canvax/shape/BrokenLine" , function(S , Shape , Polygon){
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

   S.extend(BrokenLine , Shape , {
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
     "canvax/shape/Polygon"
   ]
});
