/**
 * Canvax
 *
 * @author 释剑 (李涛, litao.lt@alibaba-inc.com)
 *
 * 正n边形（n>=3）
 *
 * 对应context的属性有 
 *
 * @r 正n边形外接圆半径
 * @r 指明正几边形
 *
 * @pointList 私有，从上面的r和n计算得到的边界值的集合
 */


KISSY.add("canvax/shape/Isogon" , function(S , Shape , math , Base){

  var Isogon = function(opt){
      var self = this;
      this.type = "Isogon";

      opt.context || (opt.context={});
      self._style = {
           pointList : [],//从下面的r和n计算得到的边界值的集合
           //x             : 0,//{number},  // 必须，正n边形外接圆心横坐标
           //y             : 0,//{number},  // 必须，正n边形外接圆心纵坐标
           r :opt.context.r  || 0,//{number},  // 必须，正n边形外接圆半径
           n :opt.context.n  || 0 //{number},  // 必须，指明正几边形
      }

      arguments.callee.superclass.constructor.apply(this, arguments);
  };


  var sin = math.sin;
  var cos = math.cos;
  var PI = Math.PI;

  Base.creatClass(Isogon , Shape , {
      /**
       * 创建n角星（n>=3）路径
       * @param {Context2D} ctx Canvas 2D上下文
       * @param {Object} style 样式
       */
      draw : function(ctx, style) {
          var n = style.n;
          if (!n || n < 2) { return; }

          var x = 0;
          var y = 0;
          var r = style.r;

          var dStep = 2 * PI / n;
          var deg = -PI / 2;
          var xStart = x + r * cos(deg);
          var yStart = y + r * sin(deg);
          deg += dStep;

          // 记录边界点，用于判断insight
          var pointList = style.pointList = [];
          pointList.push([xStart, yStart]);
          for (var i = 0, end = n - 1; i < end; i ++) {
              pointList.push([x + r * cos(deg), y + r * sin(deg)]);
              deg += dStep;
          }
          pointList.push([xStart, yStart]);

          // 绘制
          ctx.moveTo(pointList[0][0], pointList[0][1]);
          for (var i = 0; i < pointList.length; i ++) {
              ctx.lineTo(pointList[i][0], pointList[i][1]);
          }

          return;
      },

      /**
       * 返回矩形区域，用于局部刷新和文字定位
       * @param {Object} style
       */
      getRect : function(style) {
          var lineWidth;
          if (style.strokeStyle || style.fillStyle) {
              lineWidth = style.lineWidth || 1;
          }
          else {
              lineWidth = 0;
          }
          return {
              x : Math.round(0 - style.r - lineWidth / 2),
              y : Math.round(0 - style.r - lineWidth / 2),
              width : style.r * 2 + lineWidth,
              height : style.r * 2 + lineWidth
          };
      }

  });

  return Isogon;


}, {
  requires : [
    "canvax/display/Shape",
    "canvax/utils/Math",
    "canvax/core/Base"
  ] 
});
