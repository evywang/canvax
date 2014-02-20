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


KISSY.add("canvax/shape/Sector" , function(S , Shape , myMath , Base){
 
   var Sector = function(opt){
       var self  = this;
       self.type = "sector";

       opt = Base.checkOpt( opt );
       self._context  = {
           pointList  : [],//边界点的集合,私有，从下面的属性计算的来
           r0         : opt.context.r0         || 0,// 默认为0，内圆半径指定后将出现内弧，同时扇边长度 = r - r0
           r          : opt.context.r          || 0,//{number},  // 必须，外圆半径
           startAngle : myMath.degreeTo360( opt.context.startAngle ) || 0,//{number},  // 必须，起始角度[0, 360)
           endAngle   : myMath.degreeTo360( opt.context.endAngle )   || 0, //{number},  // 必须，结束角度(0, 360]
           clockwise  : opt.context.clockwise  || false //是否顺时针，默认为false(顺时针)
       }
       arguments.callee.superclass.constructor.apply(this , arguments);
       
       this.getRegAngle();

   };

   Base.creatClass(Sector , Shape , {
       draw : function(ctx, context) {
           
           // 形内半径[0,r)
           var r0 = typeof context.r0 == 'undefined' ? 0 : context.r0;
           var r = context.r;                            // 扇形外半径(0,r]
           var startAngle = context.startAngle;          // 起始角度[0,360)
           var endAngle   = context.endAngle;              // 结束角度(0,360]

           if( startAngle == endAngle &&  startAngle*endAngle !=0 ) {
               //如果两个角度相等，那么就认为是个圆环了，那么就改写角度为从0-360
               startAngle = 0;
               endAngle   = 360;
           }

           startAngle = myMath.degreeToRadian(startAngle);
           endAngle   = myMath.degreeToRadian(endAngle);

           
           ctx.arc( 0 , 0 , r, startAngle, endAngle, this.context.clockwise);
           if (r0 !== 0) {
               ctx.arc( 0 , 0 , r0, endAngle , startAngle, !this.context.clockwise);
           }
        },
        getRegAngle : function(){
            this.regIn      = true;  //如果在start和end的数值中，end大于start而且是顺时针则regIn为true
            var c           = this.context;
            if ( ( c.startAngle > c.endAngle && !c.clockwise ) || (c.startAngle < c.endAngle && c.clockwise ) ) {
                this.regIn  = false; //out
            };
            //度的范围，从小到大
            this.regAngle   = [ 
                Math.min( c.startAngle , c.endAngle ) , 
                Math.max( c.startAngle , c.endAngle ) 
            ];
        },
        getRect : function(context){
            var context = context ? context : this.context;
            var r0 = typeof context.r0 == 'undefined'     // 形内半径[0,r)
                ? 0 : context.r0;
            var r = context.r;                            // 扇形外半径(0,r]
            
            /*
            var startAngle = myMath.degreeTo360(context.startAngle);            // 起始角度[0,360)
            var endAngle   = myMath.degreeTo360(context.endAngle);              // 结束角度(0,360]

            var regIn      = true;  //如果在start和end的数值中，end大于start而且是顺时针则regIn为true
            if ( (startAngle > endAngle && !this.context.clockwise ) || (startAngle < endAngle && this.context.clockwise ) ) {
                regIn      = false; //out
            }
            //度的范围，从小到大
            var regAngle   = [ 
                Math.min( startAngle , endAngle ) , 
                Math.max( startAngle , endAngle ) 
            ];
            */ 

            var isCircle = false;
            if( Math.abs( this.context.startAngle - this.context.endAngle ) == 360 
                    || ( this.context.startAngle == this.context.endAngle && this.context.startAngle * this.context.endAngle != 0 ) ){
                isCircle = true;
            }

            var pointList  = [];

            var p4Direction= {
                "90" : [ 0 , r ],
                "180": [ -r, 0 ],
                "270": [ 0 , -r],
                "360": [ r , 0 ] 
            };

            for ( var d in p4Direction ){
                var inAngleReg = parseInt(d) > this.regAngle[0] && parseInt(d) < this.regAngle[1];
                if( isCircle || (inAngleReg && this.regIn) || (!inAngleReg && !this.regIn) ){
                    pointList.push( p4Direction[ d ] );
                }
            }

            if( !isCircle ) {
                startAngle = myMath.degreeToRadian( this.context.startAngle );
                endAngle   = myMath.degreeToRadian( this.context.endAngle   );

                pointList.push([
                        myMath.cos(startAngle) * r0 , myMath.sin(startAngle) * r0
                        ]);

                pointList.push([
                        myMath.cos(startAngle) * r  , myMath.sin(startAngle) * r
                        ]);

                pointList.push([
                        myMath.cos(endAngle)   * r  ,  myMath.sin(endAngle)  * r
                        ]);

                pointList.push([
                        myMath.cos(endAngle)   * r0 ,  myMath.sin(endAngle)  * r0
                        ]);
            }

            context.pointList = pointList;
            return this.getRectFormPointList( context );
        }

   });

   return Sector;

},{
   requires:[
     "canvax/display/Shape",
     "canvax/utils/Math",
     "canvax/core/Base"
   ]
});
