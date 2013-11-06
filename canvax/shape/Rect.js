KISSY.add("canvax/shape/Rect" , function( S , Shape ){
  var Rect = function(opt){
      var self = this;
      self.type = "Rect";

      opt.context || (opt.context = {});
      self._style = {
           //x             : 0,//{number},  // 必须，左上角横坐标
           //y             : 0,//{number},  // 必须，左上角纵坐标
           width         : opt.context.width || 0,//{number},  // 必须，宽度
           height        : opt.context.height|| 0,//{number},  // 必须，高度
           radius        : opt.context.radius|| []     //{array},   // 默认为[0]，圆角 
      }
      arguments.callee.superclass.constructor.apply(this, arguments);
  };

  S.extend( Rect , Shape , {
      /**
       * 绘制圆角矩形
       * @param {Context2D} ctx Canvas 2D上下文
       * @param {Object} style 样式
       */
      _buildRadiusPath: function(ctx, style) {
          //左上、右上、右下、左下角的半径依次为r1、r2、r3、r4
          //r缩写为1         相当于 [1, 1, 1, 1]
          //r缩写为[1]       相当于 [1, 1, 1, 1]
          //r缩写为[1, 2]    相当于 [1, 2, 1, 2]
          //r缩写为[1, 2, 3] 相当于 [1, 2, 3, 2]
          var x = 0;
          var y = 0;
          var width = this.context.width;
          var height = this.context.height;
          var r = style.radius.$model;
          var r1; 
          var r2; 
          var r3; 
          var r4;

          if(typeof r === 'number') {
              r1 = r2 = r3 = r4 = r;
          }
          else if(r instanceof Array) {
              if (r.length === 1) {
                  r1 = r2 = r3 = r4 = r[0];
              }
              else if(r.length === 2) {
                  r1 = r3 = r[0];
                  r2 = r4 = r[1];
              }
              else if(r.length === 3) {
                  r1 = r[0];
                  r2 = r4 = r[1];
                  r3 = r[2];
              } else {
                  r1 = r[0];
                  r2 = r[1];
                  r3 = r[2];
                  r4 = r[3];
              }
          } else {
              r1 = r2 = r3 = r4 = 0;
          }
          ctx.moveTo(x + r1, y);
          ctx.lineTo(x + width - r2, y);
          r2 !== 0 && ctx.quadraticCurveTo(
                  x + width, y, x + width, y + r2
                  );
          ctx.lineTo(x + width, y + height - r3);
          r3 !== 0 && ctx.quadraticCurveTo(
                  x + width, y + height, x + width - r3, y + height
                  );
          ctx.lineTo(x + r4, y + height);
          r4 !== 0 && ctx.quadraticCurveTo(
                  x, y + height, x, y + height - r4
                  );
          ctx.lineTo(x, y + r1);
          r1 !== 0 && ctx.quadraticCurveTo(x, y, x + r1, y);
      },

      /**
       * 创建矩形路径
       * @param {Context2D} ctx Canvas 2D上下文
       * @param {Object} style 样式
       */
      draw : function(ctx, style) {
          if(!style.$model.radius.length) {
              var x = 0;
              var y = 0;
              ctx.moveTo(x, y);
              ctx.lineTo(x + this.context.width, y);
              ctx.lineTo(x + this.context.width, y + this.context.height);
              ctx.lineTo(x, y + this.context.height);
              ctx.lineTo(x, y);
              //ctx.rect(x, y, this.get("width"), this.get("height"));
          } else {
              this._buildRadiusPath(ctx, style);
          }
          return;
      },

      /**
       * 返回矩形区域，用于局部刷新和文字定位
       * @param {Object} style
       */
      getRect : function(style) {
              var lineWidth;
              if (style.fillStyle || style.strokeStyle) {
                  lineWidth = style.lineWidth || 1;
              }
              else {
                  lineWidth = 0;
              }
              return {
                    x : Math.round(0 - lineWidth / 2),
                    y : Math.round(0 - lineWidth / 2),
                    width : this.context.width + lineWidth,
                    height : this.context.height + lineWidth
              };
          }

  } );

  return Rect;

} , {
  requires : [
    "canvax/display/Shape"  
  ]
});
