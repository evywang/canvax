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


KISSY.add("canvax/shape/Sector" , function(S , Shape , Math , Polygon , Base){
 
   var Sector = function(opt){
       var self  = this;
       self.type = "sector";

       opt = Base.checkOpt( opt );
       self.clockwise =  opt.clockwise || false;//是否顺时针，默认为false(顺时针)

       self._context  = {
           pointList  : [],//边界点的集合,私有，从下面的属性计算的来
           r0         : opt.context.r0         || 0,// 默认为0，内圆半径指定后将出现内弧，同时扇边长度 = r - r0
           r          : opt.context.r          || 0,//{number},  // 必须，外圆半径
           startAngle : opt.context.startAngle || 0,//{number},  // 必须，起始角度[0, 360)
           endAngle   : opt.context.endAngle   || 0 //{number},  // 必须，结束角度(0, 360]
       }
       arguments.callee.superclass.constructor.apply(this , arguments);
   };



   Base.creatClass(Sector , Shape , {
       draw : function(ctx, style) {
           
           // 形内半径[0,r)
           var r0 = typeof style.r0 == 'undefined' ? 0 : style.r0;
           var r = style.r;                            // 扇形外半径(0,r]
           var startAngle = style.startAngle;          // 起始角度[0,360)
           var endAngle   = style.endAngle;              // 结束角度(0,360]

           startAngle = Math.degreeToRadian(startAngle);
           endAngle   = Math.degreeToRadian(endAngle);

           ctx.arc( 0 , 0 , r, startAngle, endAngle, this.clockwise);
           if (r0 !== 0) {
               ctx.arc( 0 , 0 , r0, endAngle , startAngle, !this.clockwise);
           }
        },
        getRect : function(style){
            var style = style ? style : this.context;
            var r0 = typeof style.r0 == 'undefined'     // 形内半径[0,r)
                ? 0 : style.r0;
            var r = style.r;                            // 扇形外半径(0,r]
            var startAngle = style.startAngle;          // 起始角度[0,360)
            var endAngle   = style.endAngle;              // 结束角度(0,360]
            var pointList  = [];
            if (startAngle < 90 && endAngle  > 90) {
                pointList.push([ 0 , r ]);
            }
            if (startAngle < 180 && endAngle > 180) {
                pointList.push([ -r, 0  ]);
            }
            if (startAngle < 270 && endAngle > 270) {
                pointList.push([ 0, -r ]);
            }
            if (startAngle < 360 && endAngle > 360) {
                pointList.push([ r, 0 ]);
            }

            startAngle = Math.degreeToRadian(startAngle);
            endAngle   = Math.degreeToRadian(endAngle);

            pointList.push([
                    Math.cos(startAngle) * r0 , Math.sin(startAngle) * r0
                    ]);

            pointList.push([
                    Math.cos(startAngle) * r  , Math.sin(startAngle) * r
                    ]);

            pointList.push([
                    Math.cos(endAngle)   * r  ,  Math.sin(endAngle)  * r
                    ]);

            pointList.push([
                    Math.cos(endAngle)   * r0 ,  Math.sin(endAngle)  * r0
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
