KISSY.add("canvax/shape/Circle" ,
    function(S , Shape) {
        var Circle = function(opt) {
            var self = this;
            self.type = "Circle";

            opt.context || (opt.context = {})
            self._style = {
                //x : 0 , // {number},  // 丢弃
                //y : 0 , //{number},  // 丢弃，圆心xy坐标 都 为原点
                r : opt.context.r || 0   //{number},  // 必须，圆半径
            }


            arguments.callee.superclass.constructor.apply(this, arguments);
        }

        S.extend(Circle , Shape , {
           /**
             * 创建圆形路径
             * @param {Context2D} ctx Canvas 2D上下文
             * @param {Object} style 样式
             */
            draw : function(ctx, style) {
                if (!style) {
                  return;
                }
                //ctx.arc(this.get("x"), this.get("y"), style.r, 0, Math.PI * 2, true);
                ctx.arc(0 , 0, style.r, 0, Math.PI * 2, true);
                return this;
            },

            /**
             * 返回矩形区域，用于局部刷新和文字定位
             * @param {Object} style
             */
            getRect : function(style) {
                var lineWidth;
                if (style.fillStyle || style.strokeStyle ) {
                    lineWidth = style.lineWidth || 1;
                } else {
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

        return Circle;
    },
    {
        requires : [
         "canvax/display/Shape"
        ]
    }
);
