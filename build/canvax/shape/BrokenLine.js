/**
 * Canvax
 *
 * @author 释剑 (李涛, litao.lt@alibaba-inc.com)
 *
 * 折线 类
 *
 * 对应context的属性有
 * @pointList 各个顶角坐标
 **/
 
define(
    "canvax/shape/BrokenLine",
    [
        "canvax/display/Shape",
        "canvax/core/Base",
        "canvax/geom/SmoothSpline"
    ],
    function(Shape , Base , SmoothSpline){
        var BrokenLine = function(opt){
            var self = this;
            self.type = "brokenLine";
            self.drawTypeOnly = "stroke";
     
            opt = Base.checkOpt( opt );
     
            if( opt.context.smooth && opt.context.pointList ){
                opt.context.pointList = SmoothSpline( opt.context.pointList );
            }
            
            self._context = {
                lineType   : opt.context.lineType  || null,
                smooth     : opt.context.smooth    || false,
                pointList  : opt.context.pointList || [] //{Array}  // 必须，各个顶角坐标
            }
     
            self.pointsLen = self._context.pointList.length;
            
            arguments.callee.superclass.constructor.apply(this, arguments);
        }
     
        Base.creatClass(BrokenLine , Shape , {
            draw : function(ctx, context) {
                var pointList = context.pointList;
                if (pointList.length < 2) {
                    // 少于2个点就不画了~
                    return;
                }
     
                if (!context.lineType || context.lineType == 'solid' || context.smooth) {
                    //默认为实线
                    //TODO:目前如果 有设置smooth 的情况下是不支持虚线的
                    ctx.moveTo( parseInt(pointList[0][0]) , parseInt(pointList[0][1]) );
                    for (var i = 1, l = pointList.length; i < l; i++) {
                        ctx.lineTo( parseInt(pointList[i][0]) , parseInt(pointList[i][1]) );
                    }
                } else if (context.lineType == 'dashed' || context.lineType == 'dotted') {
                    //画虚线的方法  
                    ctx.moveTo( parseInt(pointList[0][0]) , parseInt(pointList[0][1]) );
                    for (var i = 1, l = pointList.length; i < l; i++) {
                        var fromX = pointList[i - 1][0];
                        var toX   = pointList[i][0];
                        var fromY = pointList[i - 1][1];
                        var toY   = pointList[i][1];
     
                        this.dashedLineTo( ctx , fromX , fromY , toX , toY , 5 );
                    }
                }
                return;
            },
            getRect :  function(context) {
                var context = context ? context : this.context;
                return this.getRectFormPointList( context );
            }
        });
     
        return BrokenLine;
     
    }
)
