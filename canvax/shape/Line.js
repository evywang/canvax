KISSY.add("canvax/shape/Line" , function(S,Shape,Base){
  var Line = function(opt){
      var self = this;
      this.type = "Line";
      this.drawTypeOnly = "stroke";
      opt.context || (opt.context={})
      self._style = {
           lineType      : opt.context.lineType || null, //可选 虚线 实现 的 类型
           xStart        : opt.context.xStart || 0 ,//{number},  // 必须，起点横坐标
           yStart        : opt.context.yStart || 0 ,//{number},  // 必须，起点纵坐标
           xEnd          : opt.context.xEnd   || 0 ,//{number},  // 必须，终点横坐标
           yEnd          : opt.context.yEnd   || 0 //{number},  // 必须，终点纵坐标
      }
      arguments.callee.superclass.constructor.apply(this, arguments);
  };

  
  Base.creatClass( Line , Shape , {
      /**
       * 创建线条路径
       * @param {Context2D} ctx Canvas 2D上下文
       * @param {Object} style 样式
       */
      draw : function(ctx, style) {
          if (!style.lineType || style.lineType == 'solid') {
              //默认为实线
              ctx.moveTo(style.xStart, style.yStart);
              ctx.lineTo(style.xEnd, style.yEnd);
          } else if (style.lineType == 'dashed' || style.lineType == 'dotted') {
              var dashLength =(style.lineWidth || 1) * (style.lineType == 'dashed' ? 5 : 1);
              this.dashedLineTo(
                  ctx,
                  style.xStart, style.yStart,
                  style.xEnd, style.yEnd,
                  dashLength
              );
          }
      },

      /**
       * 返回矩形区域，用于局部刷新和文字定位
       * @param {Object} style
       */
      getRect:function(style) {
          var lineWidth = style.lineWidth || 1;
          return {
              x : Math.min(style.xStart, style.xEnd) - lineWidth,
                y : Math.min(style.yStart, style.yEnd) - lineWidth,
                width : Math.abs(style.xStart - style.xEnd)
                    + lineWidth,
                height : Math.abs(style.yStart - style.yEnd)
                    + lineWidth
          };
      }

  } );

  return Line;


} , {
  requires : [
    "canvax/display/Shape",
    "canvax/core/Base"
  ]
});
