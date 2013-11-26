/**
 * Canvax
 *
 * @author 释剑 (李涛, litao.lt@alibaba-inc.com)
 *
 * 扇形 类
 *
 * 坐标原点再圆心
 *
 * 对应context的属性有
 * @r0 默认为0，内圆半径指定后将出现内弧，同时扇边长度 = r - r0
 * @r  必须，外圆半径
 * @startAngle 起始角度(0, 360)
 * @endAngle   结束角度(0, 360)
 **/


KISSY.add("canvax/shape/Sector" , function(S,Shape,math,Polygon , Base){
 
   var Sector = function(opt){
       var self = this;
       self.type = "Sector";

       opt.context || (opt.context={})
       self._style = {
           pointList : [],//边界点的集合,私有，从下面的属性计算的来
           //x             : {number},  // 必须，圆心横坐标
           //y             : {number},  // 必须，圆心纵坐标
           r0: opt.context.r0 || 0,// 默认为0，内圆半径指定后将出现内弧，同时扇边长度 = r - r0
           r : opt.context.r  || 0,//{number},  // 必须，外圆半径
           startAngle : opt.context.startAngle || 0,//{number},  // 必须，起始角度[0, 360)
           endAngle   : opt.context.endAngle   || 0 //{number},  // 必须，结束角度(0, 360]
       }
       arguments.callee.superclass.constructor.apply(this , arguments);
   };



   Base.creatClass(Sector , Shape , {
       draw : function(ctx, style) {
           
                var x = 0;   // 圆心x
                var y = 0;   // 圆心y
                var r0 = typeof style.r0 == 'undefined'     // 形内半径[0,r)
                         ? 0 : style.r0;
                var r = style.r;                            // 扇形外半径(0,r]
                var startAngle = style.startAngle;          // 起始角度[0,360)
                var endAngle = style.endAngle;              // 结束角度(0,360]
                var PI2 = Math.PI * 2;

                startAngle = math.degreeToRadian(startAngle);
                endAngle = math.degreeToRadian(endAngle);

                //sin&cos已经在tool.math.缓存了，放心大胆的重复调用
                //ctx.moveTo(
                //    math.cos(startAngle) * r0 + x,
                //    y - math.sin(startAngle) * r0
                //);

                //ctx.lineTo(
                //    math.cos(startAngle) * r + x,
                //    y - math.sin(startAngle) * r
                //);

                ctx.arc(x, y, r, PI2 - startAngle, PI2 - endAngle, true);

                //ctx.lineTo(
                //    math.cos(endAngle) * r0 + x,
                //    y - math.sin(endAngle) * r0
                //);

                if (r0 !== 0) {
                    ctx.arc(x, y, r0, PI2 - endAngle, PI2 - startAngle, false);
                }

                return;
        },
        getRect : function(style){
            var x = 0;   // 圆心x
            var y = 0;   // 圆心y
            var r0 = typeof style.r0 == 'undefined'     // 形内半径[0,r)
                ? 0 : style.r0;
            var r = style.r;                            // 扇形外半径(0,r]
            var startAngle = style.startAngle;          // 起始角度[0,360)
            var endAngle = style.endAngle;              // 结束角度(0,360]
            var pointList = [];
            if (startAngle < 90 && endAngle > 90) {
                pointList.push([
                        x, y - r
                        ]);
            }
            if (startAngle < 180 && endAngle > 180) {
                pointList.push([
                        x - r, y
                        ]);
            }
            if (startAngle < 270 && endAngle > 270) {
                pointList.push([
                        x, y + r
                        ]);
            }
            if (startAngle < 360 && endAngle > 360) {
                pointList.push([
                        x + r, y
                        ]);
            }

            startAngle = math.degreeToRadian(startAngle);
            endAngle = math.degreeToRadian(endAngle);


            pointList.push([
                    math.cos(startAngle) * r0 + x,
                    y - math.sin(startAngle) * r0
                    ]);

            pointList.push([
                    math.cos(startAngle) * r + x,
                    y - math.sin(startAngle) * r
                    ]);

            pointList.push([
                    math.cos(endAngle) * r + x,
                    y - math.sin(endAngle) * r
                    ]);

            pointList.push([
                    math.cos(endAngle) * r0 + x,
                    y - math.sin(endAngle) * r0
                    ]);

                
            style.pointList = pointList;
            
            return Polygon.prototype.getRect(style);

        }

   });

   return Sector;

},{
   requires:[
     "canvax/display/Shape",
     "canvax/utils/Math",
     "canvax/shape/Polygon",
     "canvax/core/Base"
   ]
});
