KISSY.add("canvax/shape/Beziercurve" , function(S,Shape){
  var Beziercurve = function(opt){
      var self=this;
      self.type = "Beziercurve";
      self.drawTypeOnly = "stroke";//线条只能描边，填充的画出了问题别怪我没提醒


      //在diaplayobject组织context的之前就要把 这个 shape 需要的 style 字段 提供出来
      //displayobject 会merge 到 context去
      opt.context || (opt.context = {});
      self._style = {
           xStart : opt.context.xStart  || 0 , //        : {number} 必须，起点横坐标
           yStart : opt.context.yStart  || 0 , //       : {number},   必须，起点纵坐标
           cpX1   : opt.context.cpX1    || 0 , //       : {number},  // 必须，第一个关联点横坐标
           cpY1   : opt.context.cpY1    || 0 , //      : {number},  // 必须，第一个关联点纵坐标
           cpX2   : opt.context.cpX2    || 0 , //第二个关联点横坐标  缺省即为二次贝塞尔曲线
           cpY2   : opt.context.cpY2    || 0 , //       : {number},  // 可选，第二个关联点纵坐标
           xEnd   : opt.context.xEnd    || 0 , //       : {number},  // 必须，终点横坐标
           yEnd   : opt.context.yEnd    || 0   //       : {number},  // 必须，终点纵坐标
      }

      
      arguments.callee.superclass.constructor.apply(this , arguments);
  };

  S.extend(Beziercurve , Shape , {
    draw : function(ctx, style) {
        ctx.moveTo(style.xStart, style.yStart);
        if (typeof style.cpX2 != 'undefined' && typeof style.cpY2 != 'undefined') {
            ctx.bezierCurveTo(
                style.cpX1, style.cpY1,
                style.cpX2, style.cpY2,
                style.xEnd, style.yEnd
                );
        } else {
            ctx.quadraticCurveTo(
                style.cpX1, style.cpY1,
                style.xEnd, style.yEnd
                );
        }

    },
    getRect : function(style) {
        var _minX = Math.min(style.xStart, style.xEnd, style.cpX1);
        var _minY = Math.min(style.yStart, style.yEnd, style.cpY1);
        var _maxX = Math.max(style.xStart, style.xEnd, style.cpX1);
        var _maxY = Math.max(style.yStart, style.yEnd, style.cpY1);
        var _x2 = style.cpX2;
        var _y2 = style.cpY2;

        if (typeof _x2 != 'undefined'
                && typeof _y2 != 'undefined'
           ) {
               _minX = Math.min(_minX, _x2);
               _minY = Math.min(_minY, _y2);
               _maxX = Math.max(_maxX, _x2);
               _maxY = Math.max(_maxY, _y2);
           }

        var lineWidth = style.lineWidth || 1;
        return {
              x : _minX - lineWidth,
              y : _minY - lineWidth,
              width : _maxX - _minX + lineWidth,
              height : _maxY - _minY + lineWidth
        };
    }
  });

  return Beziercurve;


} , {
  requires : [
    "canvax/display/Shape"  
  ]
});
