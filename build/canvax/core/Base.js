/**
 * Canvax
 *
 * @author 释剑 (李涛, litao.lt@alibaba-inc.com)
 */

window.FlashCanvasOptions = {
    swfPath: "http://g.tbcdn.cn/thx/canvax/1.0.0/canvax/library/flashCanvas/"
};

define(
    "canvax/core/Base",
    [

    "canvax/animation/AnimationFrame",
    ( 'ontouchstart' in window ) ? "canvax/library/hammer" : "",
    !window._ ? "canvax/library/underscore" : "",
    !document.createElement('canvas').getContext ? "canvax/library/flashCanvas/flashcanvas" : ""

    ],
    function(){

    var classTypes = {};
    "Boolean Number String Function Array Date RegExp Object Error".replace(/[^, ]+/g, function(name) {
        classTypes["[object " + name + "]"] = name.toLowerCase()
    });

    var Base = {
        mainFrameRate   : 60,//默认主帧率
        now : 0,
        // dom操作相关代码
        getEl : function(el){
            if(_.isString(el)){
               return document.getElementById(el)
            }
            if(el.nodeType == 1){
               //则为一个element本身
               return el
            }
            if(el.length){
               return el[0]
            }
            return null;
        },
        getOffset : function(el){
            var box = el.getBoundingClientRect(), 
            doc = el.ownerDocument, 
            body = doc.body, 
            docElem = doc.documentElement, 

            // for ie  
            clientTop = docElem.clientTop || body.clientTop || 0, 
            clientLeft = docElem.clientLeft || body.clientLeft || 0, 

            // In Internet Explorer 7 getBoundingClientRect property is treated as physical, 
            // while others are logical. Make all logical, like in IE8. 
            zoom = 1; 
            if (body.getBoundingClientRect) { 
                var bound = body.getBoundingClientRect(); 
                zoom = (bound.right - bound.left)/body.clientWidth; 
            } 
            if (zoom > 1){ 
                clientTop = 0; 
                clientLeft = 0; 
            } 
            var top = box.top/zoom + (window.pageYOffset || docElem && docElem.scrollTop/zoom || body.scrollTop/zoom) - clientTop, 
                left = box.left/zoom + (window.pageXOffset|| docElem && docElem.scrollLeft/zoom || body.scrollLeft/zoom) - clientLeft; 

            return { 
                top: top, 
                left: left 
            }; 
        },
        //dom相关代码结束
        
        /*像素检测专用*/
        _pixelCtx   : null,
        __emptyFunc : function(){},
        //retina 屏幕优化
        _devicePixelRatio : window.devicePixelRatio || 1,
        /**
         * 创建dom
         * @param {string} id dom id 待用
         * @param {string} type : dom type， such as canvas, div etc.
         */
        _createCanvas : function(id, _width , _height) {
            var newDom = document.createElement("canvas");

            newDom.style.position = 'absolute';
            newDom.style.width  = _width + 'px';
            newDom.style.height = _height + 'px';
            newDom.style.left   = 0;
            newDom.style.top    = 0;
            //newDom.setAttribute('width', _width );
            //newDom.setAttribute('height', _height );
            newDom.setAttribute('width', _width * this._devicePixelRatio);
            newDom.setAttribute('height', _height * this._devicePixelRatio);
            newDom.setAttribute('id', id);
            return newDom;
        },
        canvasSupport : function() {
            return !!document.createElement('canvas').getContext;
        },
        createObject : function( proto , constructor ) {
            var newProto;
            var ObjectCreate = Object.create;
            if (ObjectCreate) {
                newProto = ObjectCreate(proto);
            } else {
                Base.__emptyFunc.prototype = proto;
                newProto = new Base.__emptyFunc();
            }
            newProto.constructor = constructor;
            return newProto;
        },
        setContextStyle : function( ctx , style ){
            // 简单判断不做严格类型检测
            for (p in style){
                //text的textBaseline 不使用系统自带的，而是采用自己来计算，所以抛弃
                if( p == "textBaseline" ){
                    continue;
                }
                if( p in ctx ){
                    if ( style[p] || _.isNumber( style[p] ) ) {
                        if( p == "globalAlpha" ){
                            //透明度要从父节点继承
                            ctx[p] *= style[p];
                        } else {
                            ctx[p] = style[p];
                        }
                    }
                }
            }
            return;
        },
        creatClass : function(r, s, px){
            if (!s || !r) {
                return r;
            }
            var sp = s.prototype, rp;
            // add prototype chain
            rp = Base.createObject(sp, r);
            r.prototype = _.extend(rp, r.prototype);
            r.superclass = Base.createObject(sp, s);
            // add prototype overrides
            if (px) {
                _.extend(rp, px);
            }
            return r;
        },
        debugMode : false,
        log : function() {
            var self = this;
            if (!self.debugMode) {
                return;
            } else if ( "Error" in window ) {
                for (var k in arguments) {
                    throw new Error(arguments[k]);
                }
            } else if ("console" in window && console.log) {
                for (var k in arguments) {
                    console.log(arguments[k]);
                }
            }

            return self;
        },
        initElement : function( canvas ){
            if(typeof FlashCanvas != "undefined" && FlashCanvas.initElement){
                FlashCanvas.initElement( canvas );
            }
        },
        //做一次简单的opt参数校验，保证在用户不传opt的时候 或者传了opt但是里面没有context的时候报错
        checkOpt    : function(opt){
            if( !opt ){
              return {
                context : {
                
                }
              }   
            } else if( opt && !opt.context ) {
              opt.context = {}
              return opt;
            } else {
              return opt;
            }
        },
        _UID  : 0, //该值为向上的自增长整数值
        getUID:function(){
            return this._UID++;
        },
        createId : function(name) {
            //if end with a digit, then append an undersBase before appending
            var charCode = name.charCodeAt(name.length - 1);
            if (charCode >= 48 && charCode <= 57) name += "_";
            return name + Base.getUID();
        },
        getType : function(obj) { //取得类型
            if (obj == null) {
                return String(obj)
            }
            // 早期的webkit内核浏览器实现了已废弃的ecma262v4标准，可以将正则字面量当作函数使用，因此typeof在判定正则时会返回function
            return typeof obj === "object" || typeof obj === "function" ?
                classTypes[Object.prototype.toString.call(obj)] || "object" :
                typeof obj
        },
        /**
         * 简单的浅复制对象。
         * @param strict  当为true时只覆盖已有属性
         */
        copy: function(target, source, strict){ 
            if ( _.isEmpty(source) ){
                return target;
            }
            for(var key in source){
                if(!strict || target.hasOwnProperty(key) || target[key] !== undefined){
                    target[key] = source[key];
                }
            }
            return target;
        },
        /**
         * 把系统event copy到 canvax的event上面
         * @cavnaxE  canvax的event
         * @E        系统的event
         */
        copyEvent : function( canvaxE , E ){
            //TODO： 在ie11 和 firefox 中，type已经不在event的自身属性上面
            /*
            !E.hasOwnProperty && ( E.hasOwnProperty = Object.prototype.hasOwnProperty ) ;
            for(var key in E){
                if( E.hasOwnProperty( key ) ){
                    canvaxE[ key ] = E[ key ];
                }
            }
            */
            var eps = ["type"];
            for( var i=0,l=eps.length ; i < l ; i++ ){
                var key = eps[i];
                canvaxE[key] = E[key];
            }
            return canvaxE;
        },
        /**
         * 按照css的顺序，返回一个[上,右,下,左]
         */
        getCssOrderArr : function( r ){
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
            return [r1,r2,r3,r4];
        }
    };
    return Base

});
