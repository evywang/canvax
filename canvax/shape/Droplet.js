KISSY.add("canvax/shape/Droplet" , function(S,Shape){

  var Droplet = function(opt){
      var self = this;
      self.type = "Droplet";

      opt.context || (opt.context={});
      self._style = {
          a : opt.context.a || 0 , //{number},  // 必须，水滴横宽（中心到水平边缘最宽处距离）
          b : opt.context.b || 0   //{number},  // 必须，水滴纵高（中心到尖端距离）
      }


      arguments.callee.superclass.constructor.apply(this, arguments);
  };

  S.extend( Droplet , Shape , {
      draw : function(ctx, style) {

          ctx.moveTo( 0 , style.a);
          ctx.bezierCurveTo(
              style.a,
              style.a,
              style.a * 3 / 2,
              - style.a / 3,
              0,
              - style.b
              );
          ctx.bezierCurveTo(
              - style.a * 3 / 2,
              - style.a / 3,
              - style.a,
              style.a,
              0,
              style.a
              );
          return;
      },
      getRect : function(style){
          var lineWidth;
          if (style.fillStyle || style.strokeStyle) {
              lineWidth = style.lineWidth || 1;
          } else {
              lineWidth = 0;
          }
          return {
                x : Math.round(0 - style.a - lineWidth / 2),
                y : Math.round(0 - style.b - lineWidth / 2),
                width : style.a * 2 + lineWidth,
                height : style.a + style.b + lineWidth
          };

      }

  } );

  return Droplet;

},{
  requires:[
    "canvax/display/Shape"  
  ]
});
