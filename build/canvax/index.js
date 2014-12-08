define(
    "canvax/animation/AnimationFrame",
    [],
    function(){
        /**
         * 设置 AnimationFrame begin
         */
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
            || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame){
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
        if (!window.cancelAnimationFrame){
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }
    }
);
;window.FlashCanvasOptions = {
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
        getStyle : function(el , cssName){
            var len=arguments.length, sty, f, fv;  
                              
            'currentStyle' in el ? sty=el.currentStyle : 'getComputedStyle' in window   
                                 ? sty=window.getComputedStyle(el,null) : null;  
  
            sty = (len==2) ? sty[cssName] : sty;                                  
            return sty;  
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
            !E.hasOwnProperty && ( E.hasOwnProperty = Object.prototype.hasOwnProperty ) ;
            for(var key in E){
                if( E.hasOwnProperty( key ) ){
                    canvaxE[ key ] = E[ key ];
                }
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
;define(
    "canvax/core/PropertyFactory",
    [
        "canvax/core/Base" 
    ],
    function(Base){
    //定义封装好的兼容大部分浏览器的defineProperties 的 属性工厂

    unwatchOne = {
        "$skipArray" : 0,
        "$watch"     : 1,
        "$fire"      : 2,//主要是get set 显性设置的 触发
        "$model"     : 3,
        "$accessor"  : 4,
        "$owner"     : 5,
        //"path"       : 6, //这个应该是唯一一个不用watch的不带$的成员了吧，因为地图等的path是在太大
        "$parent"    : 7  //用于建立数据的关系链
    }

    function PropertyFactory(scope, model, watchMore) {

        var stopRepeatAssign=true;

        var skipArray = scope.$skipArray, //要忽略监控的属性名列表
            pmodel = {}, //要返回的对象
            accessores = {}, //内部用于转换的对象
            VBPublics = _.keys( unwatchOne ); //用于IE6-8

            model = model || {};//这是pmodel上的$model属性
            watchMore = watchMore || {};//以$开头但要强制监听的属性
            skipArray = _.isArray(skipArray) ? skipArray.concat(VBPublics) : VBPublics;

        function loop(name, val) {
            if ( !unwatchOne[name] || (unwatchOne[name] && name.charAt(0) !== "$") ) {
                model[name] = val
            };
            var valueType = Base.getType(val);
            if (valueType === "function") {
                if(!unwatchOne[name]){
                  VBPublics.push(name) //函数无需要转换
                }
            } else {
                if (_.indexOf(skipArray,name) !== -1 || (name.charAt(0) === "$" && !watchMore[name])) {
                    return VBPublics.push(name)
                }
   
                var accessor = function(neo) { //创建监控属性或数组，自变量，由用户触发其改变
                    var value = accessor.value, preValue = value, complexValue;
                    
                    if (arguments.length) {
                        //写操作
                        //set 的 值的 类型
                        var neoType = Base.getType(neo);

                        if (stopRepeatAssign) {
                            return //阻止重复赋值
                        }
                        if (value !== neo) {

                            if( neoType === "object" ){
                                value = neo.$model ? neo : PropertyFactory(neo , neo);
                                complexValue = value.$model;
                            } else {//如果是其他数据类型
                                value = neo
                            }
                            accessor.value = value;
                            model[name] = complexValue ? complexValue : value;//更新$model中的值
                            if (!complexValue) {
                                pmodel.$fire && pmodel.$fire(name, value, preValue)
                            }
                            if(valueType != neoType){
                                //如果set的值类型已经改变，
                                //那么也要把对应的valueType修改为对应的neoType
                                valueType = neoType;
                            }
                            var hasWatchModel = pmodel;
                            //所有的赋值都要触发watch的监听事件
                            if ( !pmodel.$watch ) {
                              while( hasWatchModel.$parent ){
                                 hasWatchModel = hasWatchModel.$parent;
                              }
                            }
                            if ( hasWatchModel.$watch ) {
                              hasWatchModel.$watch.call(hasWatchModel , name, value, preValue);
                            }
                        }
                    } else {
                        //读操作
                        //读的时候，发现value是个obj，而且还没有defineProperty
                        //那么就临时defineProperty一次
                        if ((valueType === "object") && !value.$model) {
                            //建立和父数据节点的关系
                            value.$parent = pmodel;
                            value = PropertyFactory(value , value);

                            //accessor.value 重新复制为defineProperty过后的对象
                            accessor.value = value;
                        }
                        return value;
                    }
                }
                accessor.value = val;
                
                accessores[name] = {
                    set: accessor,
                    get: accessor,
                    enumerable: true
                }
            }
        };
        
        for (var i in scope) {
            loop(i, scope[i])
        };

        pmodel = defineProperties(pmodel, accessores, VBPublics);//生成一个空的ViewModel

        _.forEach(VBPublics,function(name) {
            if (scope[name]) {//先为函数等不被监控的属性赋值
                if(typeof scope[name] == "function" ){
                   pmodel[name] = function(){
                      scope[name].apply(this , arguments);
                   }
                } else {
                   pmodel[name] = scope[name];
                }
            }
        });

        pmodel.$model = model;
        pmodel.$accessor = accessores;

        pmodel.hasOwnProperty = function(name) {
            return name in pmodel.$model
        };

        stopRepeatAssign = false;

        return pmodel
    }
    var defineProperty = Object.defineProperty
        //如果浏览器不支持ecma262v5的Object.defineProperties或者存在BUG，比如IE8
        //标准浏览器使用__defineGetter__, __defineSetter__实现
        try {
            defineProperty({}, "_", {
                value: "x"
            })
            var defineProperties = Object.defineProperties
        } catch (e) {
            if ("__defineGetter__" in Object) {
                defineProperty = function(obj, prop, desc) {
                    if ('value' in desc) {
                        obj[prop] = desc.value
                    }
                    if ('get' in desc) {
                        obj.__defineGetter__(prop, desc.get)
                    }
                    if ('set' in desc) {
                        obj.__defineSetter__(prop, desc.set)
                    }
                    return obj
                };
                defineProperties = function(obj, descs) {
                    for (var prop in descs) {
                        if (descs.hasOwnProperty(prop)) {
                            defineProperty(obj, prop, descs[prop])
                        }
                    }
                    return obj
                };
            }
        }
    //IE6-8使用VBScript类的set get语句实现
    if (!defineProperties && window.VBArray) {
        window.execScript([
                "Function parseVB(code)",
                "\tExecuteGlobal(code)",
                "End Function"
                ].join("\n"), "VBScript");

        function VBMediator(description, name, value) {
            var fn = description[name] && description[name].set;
            if (arguments.length === 3) {
                fn(value);
            } else {
                return fn();
            }
        };
        defineProperties = function(publics, description, array) {
            publics = array.slice(0);
            publics.push("hasOwnProperty");
            var className = "VBClass" + setTimeout("1"), owner = {}, buffer = [];
            buffer.push(
                    "Class " + className,
                    "\tPrivate [__data__], [__proxy__]",
                    "\tPublic Default Function [__const__](d, p)",
                    "\t\tSet [__data__] = d: set [__proxy__] = p",
                    "\t\tSet [__const__] = Me", //链式调用
                    "\tEnd Function");
            _.forEach(publics,function(name) { //添加公共属性,如果此时不加以后就没机会了
                if (owner[name] !== true) {
                    owner[name] = true //因为VBScript对象不能像JS那样随意增删属性
                buffer.push("\tPublic [" + name + "]") //你可以预先放到skipArray中
                }
            });
            for (var name in description) {
                owner[name] = true
                    buffer.push(
                            //由于不知对方会传入什么,因此set, let都用上
                            "\tPublic Property Let [" + name + "](val)", //setter
                            "\t\tCall [__proxy__]([__data__], \"" + name + "\", val)",
                            "\tEnd Property",
                            "\tPublic Property Set [" + name + "](val)", //setter
                            "\t\tCall [__proxy__]([__data__], \"" + name + "\", val)",
                            "\tEnd Property",
                            "\tPublic Property Get [" + name + "]", //getter
                            "\tOn Error Resume Next", //必须优先使用set语句,否则它会误将数组当字符串返回
                            "\t\tSet[" + name + "] = [__proxy__]([__data__],\"" + name + "\")",
                            "\tIf Err.Number <> 0 Then",
                            "\t\t[" + name + "] = [__proxy__]([__data__],\"" + name + "\")",
                            "\tEnd If",
                            "\tOn Error Goto 0",
                            "\tEnd Property")
            }
            buffer.push("End Class"); //类定义完毕
            buffer.push(
                    "Function " + className + "Factory(a, b)", //创建实例并传入两个关键的参数
                    "\tDim o",
                    "\tSet o = (New " + className + ")(a, b)",
                    "\tSet " + className + "Factory = o",
                    "End Function");
            window.parseVB(buffer.join("\r\n"));//先创建一个VB类工厂
            return  window[className + "Factory"](description, VBMediator);//得到其产品
        }
    }
    window.PropertyFactory = PropertyFactory;

    return PropertyFactory;

    
});
;define(
    "canvax/display/Bitmap",
    [
        "canvax/display/Shape",
        "canvax/core/Base"
    ],
    function(Shape , Base){
        var Bitmap = function(opt){
            var self = this;
            self.type = "bitmap";
      
            //TODO:这里不负责做img 的加载，所以这里的img是必须已经准备好了的img元素
            //如果img没准备好，会出现意想不到的错误，我不给你负责
            self.img  = opt.img || null; //bitmap的图片来源，可以是页面上面的img 也可以是某个canvas
      
            opt = Base.checkOpt( opt );
            self._context = {
                dx     : opt.context.dx, //图片切片的x位置
                dy     : opt.context.dy, //图片切片的y位置
                dWidth : opt.context.dWidth || 0, //切片的width
                dHeight: opt.context.dHeight|| 0  //切片的height
            }
      
            arguments.callee.superclass.constructor.apply(this, arguments);
      
        };
      
        Base.creatClass( Bitmap , Shape , {
            draw : function(ctx, style) {
                if (!this.img) {
                    //img都没有画个毛
                    return;
                };
                var image = this.img;
                if(!style.width || !style.height ){
                    ctx.drawImage(image, 0, 0);
                } else {
                    if( style.dx == undefined || style.dy == undefined  ){
                       ctx.drawImage(image, 0, 0, style.width, style.height);
                    } else {
                       !style.dWidth  && ( style.dWidth  = style.width  );
                       !style.dHeight && ( style.dHeight = style.height );
                       ctx.drawImage(image , style.dx , style.dy , style.dWidth , style.dHeight , 0 , 0 , style.width, style.height );
                    }
                }
            }
        });
      
        return Bitmap;

    }
)
;define(
    "canvax/display/DisplayObject",
    [
        "canvax/event/EventDispatcher",
        "canvax/geom/Matrix",
        "canvax/display/Point",
        "canvax/core/Base",
        "canvax/geom/HitTestPoint",
        "canvax/core/PropertyFactory"
    ],
    function(EventDispatcher , Matrix , Point , Base , HitTestPoint , PropertyFactory){

        var DisplayObject = function(opt){
            arguments.callee.superclass.constructor.apply(this, arguments);
            var self = this;
    
            //如果用户没有传入context设置，就默认为空的对象
            opt      = Base.checkOpt( opt );
    
            //设置默认属性
            self.id  = opt.id || null;
    
            //相对父级元素的矩阵
            self._transform      = null;
    
            //心跳次数
            self._heartBeatNum   = 0;
    
            //元素对应的stage元素
            self.stage           = null;
    
            //元素的父元素
            self.parent          = null;
    
            self._eventEnabled   = false; //是否响应事件交互,在添加了事件侦听后会自动设置为true
    
            self.dragEnabled     = false;   //是否启用元素的拖拽
    
            //创建好context
            self._createContext( opt );
    
            var UID = Base.createId(self.type);
    
            //如果没有id 则 沿用uid
            if(self.id == null){
                self.id = UID ;
            }
    
            self.init.apply(self , arguments);
    
            //所有属性准备好了后，先要计算一次this._updateTransform()得到_tansform
            this._updateTransform();
        };
        Base.creatClass( DisplayObject , EventDispatcher , {
            init : function(){},
            _createContext : function( opt ){
                var self = this;
                //所有显示对象，都有一个类似canvas.context类似的 context属性
                //用来存取改显示对象所有和显示有关的属性，坐标，样式等。
                //该对象为Coer.PropertyFactory()工厂函数生成
                self.context = null;
    
                //提供给Coer.PropertyFactory() 来 给 self.context 设置 propertys
                var _contextATTRS = Base.copy( {
                    width         : 0,
                    height        : 0,
                    x             : 0,
                    y             : 0,
                    scaleX        : 1,
                    scaleY        : 1,
                    scaleOrigin   : {
                        x : 0,
                        y : 0
                    },
                    rotation      : 0,
                    rotateOrigin  :  {
                        x : 0,
                        y : 0
                    },
                    visible       : true,
                    cursor        : "default",
                    //canvas context 2d 的 系统样式。目前就知道这么多
                    fillStyle     : null,//"#000000",
                    lineCap       : null,
                    lineJoin      : null,
                    lineWidth     : null,
                    miterLimit    : null,
                    shadowBlur    : null,
                    shadowColor   : null,
                    shadowOffsetX : null,
                    shadowOffsetY : null,
                    strokeStyle   : null,
                    globalAlpha   : 1,
                    font          : null,
                    textAlign     : "left",
                    textBaseline  : "top", 
                    arcScaleX_    : null,
                    arcScaleY_    : null,
                    lineScale_    : null,
                    globalCompositeOperation : null
                } , opt.context , true );            
    
                //然后看继承者是否有提供_context 对象 需要 我 merge到_context2D_context中去的
                if (self._context) {
                    _contextATTRS = _.extend(_contextATTRS , self._context );
                }
    
                //有些引擎内部设置context属性的时候是不用上报心跳的，比如做hitTestPoint热点检测的时候
                self._notWatch = false;
    
                _contextATTRS.$owner = self;
                _contextATTRS.$watch = function(name , value , preValue){
    
                    //下面的这些属性变化，都会需要重新组织矩阵属性_transform 
                    var transFormProps = [ "x" , "y" , "scaleX" , "scaleY" , "rotation" , "scaleOrigin" , "rotateOrigin, lineWidth" ];
    
                    if( _.indexOf( transFormProps , name ) >= 0 ) {
                        this.$owner._updateTransform();
                    }
    
                    if( this.$owner._notWatch ){
                        return;
                    };
    
                    if( this.$owner.$watch ){
                        this.$owner.$watch( name , value , preValue );
                    }
    
                    this.$owner.heartBeat( {
                        convertType:"context",
                        shape      : this.$owner,
                        name       : name,
                        value      : value,
                        preValue   : preValue
                    });
                    
                };
    
                //执行init之前，应该就根据参数，把context组织好线
                self.context = PropertyFactory( _contextATTRS );
            },
            /* @myself 是否生成自己的镜像 
             * 克隆又两种，一种是镜像，另外一种是绝对意义上面的新个体
             * 默认为绝对意义上面的新个体，新对象id不能相同
             * 镜像基本上是框架内部在实现  镜像的id相同 主要用来把自己画到另外的stage里面，比如
             * mouseover和mouseout的时候调用*/
            clone : function( myself ){
                var conf   = {
                    id      : this.id,
                    context : this.context.$model
                }
                if( this.img ){
                    conf.img = this.img;
                }
                var newObj = new this.constructor( conf );
                if (!myself){
                    newObj.id       = Base.createId(newObj.type);
                }
                return newObj;
            },
            heartBeat : function(opt){
                //stage存在，才说self代表的display已经被添加到了displayList中，绘图引擎需要知道其改变后
                //的属性，所以，通知到stage.displayAttrHasChange
                var stage = this.getStage();
                if( stage ){
                    this._heartBeatNum ++;
                    stage.heartBeat && stage.heartBeat( opt );
                }
            },
            getCurrentWidth : function(){
               return Math.abs(this.context.width * this.context.scaleX);
            },
            getCurrentHeight : function(){
    	       return Math.abs(this.context.height * this.context.scaleY);
            },
            getStage : function(){
                if( this.stage ) {
                    return this.stage;
                }
                var p = this;
                if (p.type != "stage"){
                  while(p.parent) {
                    p = p.parent;
                    if (p.type == "stage"){
                      break;
                    }
                  };
      
                  if (p.type !== "stage") {
                    //如果得到的顶点display 的type不是Stage,也就是说不是stage元素
                    //那么只能说明这个p所代表的顶端display 还没有添加到displayList中，也就是没有没添加到
                    //stage舞台的childen队列中，不在引擎渲染范围内
                    return false;
                  }
                } 
                //一直回溯到顶层object， 即是stage， stage的parent为null
                this.stage = p;
                return p;
            },
            localToGlobal : function( point , container ){
                !point && ( point = new Point( 0 , 0 ) );
                var cm = this.getConcatenatedMatrix( container );
    
                if (cm == null) return Point( 0 , 0 );
                var m = new Matrix(1, 0, 0, 1, point.x , point.y);
                m.concat(cm);
                return new Point( m.tx , m.ty ); //{x:m.tx, y:m.ty};
            },
            globalToLocal : function( point , container) {
                !point && ( point = new Point( 0 , 0 ) );
    
                var cm = this.getConcatenatedMatrix( container );
    
                if (cm == null) return new Point( 0 , 0 ); //{x:0, y:0};
                cm.invert();
                var m = new Matrix(1, 0, 0, 1, point.x , point.y);
                m.concat(cm);
                return new Point( m.tx , m.ty ); //{x:m.tx, y:m.ty};
            },
            localToTarget : function( point , target){
                var p = localToGlobal( point );
                return target.globalToLocal( p );
            },
            getConcatenatedMatrix : function( container ){
                var cm = new Matrix();
                for (var o = this; o != null; o = o.parent) {
                    cm.concat( o._transform );
                    if( !o.parent || ( container && o.parent && o.parent == container ) || ( o.parent && o.parent.type=="stage" ) ) {
                    //if( o.type == "stage" || (o.parent && container && o.parent.type == container.type ) ) {
                        break;
                    }
                }
                return cm;
            },
            /*
             *设置元素的是否响应事件检测
             *@bool  Boolean 类型
             */
            setEventEnable : function( bool ){
                if(_.isBoolean(bool)){
                    this._eventEnabled = bool
                    return true;
                };
                return false;
            },
            /*
             *查询自己在parent的队列中的位置
             */
            getIndex   : function(){
                if(!this.parent) {
                  return;
                };
                return _.indexOf(this.parent.children , this)
            },
            /*
             *元素在z轴方向向下移动
             *@num 移动的层级
             */
            toBack : function( num ){
                if(!this.parent) {
                  return;
                }
                var fromIndex = this.getIndex();
                var toIndex = 0;
                
                if(_.isNumber( num )){
                  if( num == 0 ){
                     //原地不动
                     return;
                  };
                  toIndex = fromIndex - num;
                }
                var me = this.parent.children.splice( fromIndex , 1 )[0];
                if( toIndex < 0 ){
                    toIndex = 0;
                };
                this.parent.addChildAt( me , toIndex );
            },
            /*
             *元素在z轴方向向上移动
             *@num 移动的层数量 默认到顶端
             */
            toFront : function( num ){
    
                if(!this.parent) {
                  return;
                }
                var fromIndex = this.getIndex();
                var pcl = this.parent.children.length;
                var toIndex = pcl;
                
                if(_.isNumber( num )){
                  if( num == 0 ){
                     //原地不动
                     return;
                  }
                  toIndex = fromIndex + num + 1;
                }
                var me = this.parent.children.splice( fromIndex , 1 )[0];
                if(toIndex > pcl){
                    toIndex = pcl;
                }
                this.parent.addChildAt( me , toIndex-1 );
            },
            _transformHander : function( ctx ){
    
                var transForm = this._transform;
                if( !transForm ) {
                    transForm = this._updateTransform();
                }
    
                //运用矩阵开始变形
                ctx.transform.apply( ctx , transForm.toArray() );
     
                //设置透明度
                //ctx.globalAlpha *= this.context.globalAlpha;
            },
            _updateTransform : function() {
            
                var _transform = new Matrix();
    
                _transform.identity();
    
                var ctx = this.context;
    
                //是否需要Transform
                if(ctx.scaleX !== 1 || ctx.scaleY !==1 ){
                    //如果有缩放
                    //缩放的原点坐标
                    var origin = new Point(ctx.scaleOrigin);
                    if( origin.x || origin.y ){
                        _transform.translate( -origin.x , -origin.y );
                    }
                    _transform.scale( ctx.scaleX , ctx.scaleY );
                    if( origin.x || origin.y ){
                        _transform.translate( origin.x , origin.y );
                    };
                };
    
    
                var rotation = ctx.rotation;
                if( rotation ){
                    //如果有旋转
                    //旋转的原点坐标
                    var origin = new Point(ctx.rotateOrigin);
                    if( origin.x || origin.y ){
                        _transform.translate( -origin.x , -origin.y );
                    }
                    _transform.rotate( rotation % 360 * Math.PI/180 );
                    if( origin.x || origin.y ){
                        _transform.translate( origin.x , origin.y );
                    }
                };
    
                //如果有位移
                var x = Math.round(ctx.x);
                var y = Math.round(ctx.y);
    
                if( parseInt(ctx.lineWidth , 10) % 2 == 1 && ctx.strokeStyle ){
                    x += 0.5;
                    y += 0.5;
                }
    
                if( x != 0 || y != 0 ){
                    _transform.translate( x , y );
                }
                this._transform = _transform;
    
                return _transform;
            },
            getRect:function(style){
                return {
                   x      : 0,
                   y      : 0,
                   width  : style.width,
                   height : style.height
                }
            },
            //显示对象的选取检测处理函数
            getChildInPoint : function( point ){
                var result; //检测的结果
                
                //debugger;
                //先把鼠标转换到stage下面来
                /*
                var stage = this.getStage();
                if( stage._transform ){
                    console.log( "dom:"+point.x+"||"+point.y )
                    var inverseMatrixStage = stage._transform.clone();
                    inverseMatrixStage.scale( 1 / stage.context.$model.scaleX , 1 / stage.context.$model.scaleY );
                    inverseMatrixStage     = inverseMatrixStage.invert();
                    var originPosStage     = [ point.x , point.y ];
                    inverseMatrixStage.mulVector( originPosStage , [ point.x , point.y ] );
    
                    point.x = originPosStage[0] ;
                    point.y = originPosStage[1] ;
                    console.log( "stage:"+point.x+"||"+point.y )
                }
                */
                
    
                //第一步，吧glob的point转换到对应的obj的层级内的坐标系统
                if( this.type != "stage" && this.parent && this.parent.type != "stage" ) {
                    point = this.parent.globalToLocal( point );
                }
    
                var x = point.x ;
                var y = point.y ;
    
                //这个时候如果有对context的set，告诉引擎不需要watch，因为这个是引擎触发的，不是用户
                //用户set context 才需要触发watch
                this._notWatch = true;
            
                //对鼠标的坐标也做相同的变换
                if( this._transform ){
                    var inverseMatrix = this._transform.clone().invert();
    
                    var originPos = [x, y];
                    inverseMatrix.mulVector( originPos , [ x , y ] );
    
                    x = originPos[0];
                    y = originPos[1];
                }
    
                var _rect = this._rect = this.getRect(this.context);
    
                if(!_rect){
                    return false;
                };
                if( !this.context.width && !!_rect.width ){
                    this.context.width = _rect.width;
                };
                if( !this.context.height && !!_rect.height ){
                    this.context.height = _rect.height;
                };
                if(!_rect.width || !_rect.height) {
                    return false;
                };
                //正式开始第一步的矩形范围判断
                if (x    >= _rect.x
                    && x <= (_rect.x + _rect.width)
                    && y >= _rect.y
                    && y <= (_rect.y + _rect.height)
                ) {
                   //那么就在这个元素的矩形范围内
                   result = HitTestPoint.isInside( this , {
                       x : x,
                       y : y
                   } );
                } else {
                   //如果连矩形内都不是，那么肯定的，这个不是我们要找的shap
                   result = false;
                }
                this._notWatch = false;
    
                return result;
    
            },
            _render : function( ctx ){	
                if( !this.context.visible || this.context.globalAlpha <= 0 ){
                    return;
                }
                ctx.save();
                this._transformHander( ctx );
    
                //文本有自己的设置样式方式
                if( this.type != "text" ) {
                    Base.setContextStyle( ctx , this.context.$model );
                }
    
                this.render( ctx );
                ctx.restore();
            },
            render : function( ctx ) {
                //基类不提供render的具体实现，由后续具体的派生类各自实现
            },
            //从树中删除
            remove : function(){
                if( this.parent ){
                    this.parent.removeChild(this);
                }
            },
            //元素的自我销毁
            destroy : function(){ 
                this.remove();
                //把自己从父节点中删除了后做自我清除，释放内存
                this.context = null;
                delete this.context;
            }
        } );
        return DisplayObject;
    } 
);
;define(
    "canvax/display/DisplayObjectContainer",
    [
        "canvax/core/Base",
        "canvax/display/DisplayObject",
        "canvax/display/Point"
    ],
    function(Base , DisplayObject , Point){

        DisplayObjectContainer = function(opt){
           var self = this;
           self.children = [];
           self.mouseChildren = [];
           arguments.callee.superclass.constructor.apply(this, arguments);
    
           //所有的容器默认支持event 检测，因为 可能有里面的shape是eventEnable是true的
           //如果用户有强制的需求让容器下的所有元素都 不可检测，可以调用
           //DisplayObjectContainer的 setEventEnable() 方法
           self._eventEnabled = true;
        };
    
        Base.creatClass( DisplayObjectContainer , DisplayObject , {
            addChild : function(child){
                if( !child ) {
                    return;
                } 
                if(this.getChildIndex(child) != -1) {
                    child.parent = this;
                    return child;
                }
                //如果他在别的子元素中，那么就从别人那里删除了
                if(child.parent) {
                    child.parent.removeChild(child);
                }
                this.children.push( child );
                child.parent = this;
                if(this.heartBeat){
                   this.heartBeat({
                     convertType : "children",
                     target      : child,
                     src         : this
                   });
                }
    
                if(this._afterAddChild){
                   this._afterAddChild(child);
                }
    
                return child;
            },
            addChildAt : function(child, index) {
                if(this.getChildIndex(child) != -1) {
                    child.parent = this;
                    return child;
                }
    
                if(child.parent) {
                    child.parent.removeChild(child);
                }
                this.children.splice(index, 0, child);
                child.parent = this;
                
                //上报children心跳
                if(this.heartBeat){
                   this.heartBeat({
                     convertType : "children",
                     target       : child,
                     src      : this
                   });
                }
                
                if(this._afterAddChild){
                   this._afterAddChild(child,index);
                }
    
                return child;
            },
            removeChild : function(child) {
                return this.removeChildAt(_.indexOf( this.children , child ));
            },
            removeChildAt : function(index) {
    
                if (index < 0 || index > this.children.length - 1) {
                    return false;
                }
                var child = this.children[index];
                if (child != null) {
                    child.parent = null;
                }
                this.children.splice(index, 1);
                
                if(this.heartBeat){
                   this.heartBeat({
                     convertType : "children",
                     target       : child,
                     src      : this
                   });
                };
                
                if(this._afterDelChild){
                   this._afterDelChild(child , index);
                }
    
                return child;
            },
            removeChildById : function( id ) {	
                for(var i = 0, len = this.children.length; i < len; i++) {
                    if(this.children[i].id == id) {
                        return this.removeChildAt(i);
                    }
                }
                return false;
            },
            removeAllChildren : function() {
                while(this.children.length > 0) {
                    this.removeChildAt(0);
                }
            },
            //集合类的自我销毁
            destroy : function(){
                if( this.parent ){
                    this.parent.removeChild(this);
                }
                //依次销毁所有子元素
                //TODO：这个到底有没有必要。还有待商榷
                _.each( this.children , function( child ){
                    child.destroy();
                } );
            },
            /*
             *@id 元素的id
             *@boolen 是否深度查询，默认就在第一层子元素中查询
             **/
            getChildById : function(id , boolen){
                if(!boolen) {
                    for(var i = 0, len = this.children.length; i < len; i++){
                        if(this.children[i].id == id) {
                            return this.children[i];
                        }
                    }
                } else {
                    //深度查询
                    //TODO:暂时未实现
                    return null
                }
                return null;
            },
            getChildAt : function(index) {
                if (index < 0 || index > this.children.length - 1) return null;
                return this.children[index];
            },
            getChildIndex : function(child) {
                return _.indexOf( this.children , child );
            },
            setChildIndex : function(child, index){
                if(child.parent != this) return;
                var oldIndex = _.indexOf( this.children , child );
                if(index == oldIndex) return;
                this.children.splice(oldIndex, 1);
                this.children.splice(index, 0, child);
            },
            contains : function(child) {
                return this.getChildIndex(child) != -1;
            },
            getNumChildren : function() {
                return this.children.length;
            },
            //获取x,y点上的所有object  num 需要返回的obj数量
            getObjectsUnderPoint : function( point , num) {
                var result = [];
                
                for(var i = this.children.length - 1; i >= 0; i--) {
                    var child = this.children[i];
    
                    if( child == null || !child._eventEnabled || !child.context.visible ) {
                        continue;
                    }
    
                    if( child instanceof DisplayObjectContainer ) {
                        //是集合
                        if (child.mouseChildren && child.getNumChildren() > 0){
                           var objs = child.getObjectsUnderPoint( point );
                           if (objs.length > 0){
                              result = result.concat( objs );
                           }
                        }		
                    } else {
                        //非集合，可以开始做getChildInPoint了
                        if (child.getChildInPoint( point )) {
                            result.push(child);
                            if (num != undefined && !isNaN(num)){
                               if(result.length == num){
                                  return result;
                               }
                            }
                        }
                    }
                }
                return result;
            },
            render : function( ctx ) {
                for(var i = 0, len = this.children.length; i < len; i++) {
                    this.children[i]._render( ctx );
                }
            }
        });
        return DisplayObjectContainer;
    }
)
;define(
    "canvax/display/Moveclip",
    [
        "canvax/display/DisplayObjectContainer",
        "canvax/core/Base"
    ],
    function(S , DisplayObjectContainer , Base){
        var Movieclip = function( opt ){
      
            var self = this;
            opt = Base.checkOpt( opt );
            self.type = "movieclip";
            self.currentFrame  = 0;
            self.autoPlay      = opt.autoPlay   || false;//是否自动播放
            self.repeat        = opt.repeat     || 0;//是否循环播放,repeat为数字，则表示循环多少次，为true or !运算结果为true 的话表示永久循环
      
            self.overPlay      = opt.overPlay   || false; //是否覆盖播放，为false只播放currentFrame 当前帧,true则会播放当前帧 和 当前帧之前的所有叠加
      
            self._frameRate    = Base.mainFrameRate;
            self._speedTime    = parseInt(1000/self._frameRate);
            self._preRenderTime= 0;
      
            self._context = {
                //r : opt.context.r || 0   //{number},  // 必须，圆半径
            }
            arguments.callee.superclass.constructor.apply(this, [ opt ] );
        };
      
        Base.creatClass(Movieclip , DisplayObjectContainer , {
            init : function(){
               
            },
            getStatus    : function(){
                //查询Movieclip的autoPlay状态
                return this.autoPlay;
            },
            getFrameRate : function(){
                return this._frameRate;
            },
            setFrameRate : function(frameRate) {
                
                var self = this;
                if(self._frameRate  == frameRate) {
                    return;
                }
                self._frameRate  = frameRate;
      
                //根据最新的帧率，来计算最新的间隔刷新时间
                self._speedTime = parseInt( 1000/self._frameRate );
            }, 
            afterAddChild:function(child , index){
               if(this.children.length==1){
                  return;
               }
      
               if( index != undefined && index <= this.currentFrame ){
                  //插入当前frame的前面 
                  this.currentFrame++;
               }
            },
            afterDelChild:function(child,index){
               //记录下当前帧
               var preFrame = this.currentFrame;
      
               //如果干掉的是当前帧前面的帧，当前帧的索引就往上走一个
               if(index < this.currentFrame){
                  this.currentFrame--;
               }
      
               //如果干掉了元素后当前帧已经超过了length
               if((this.currentFrame >= this.children.length) && this.children.length>0){
                  this.currentFrame = this.children.length-1;
               };
            },
            _goto:function(i){
               var len = this.children.length;
               if(i>= len){
                  i = i%len;
               }
               if(i<0){
                  i = this.children.length-1-Math.abs(i)%len;
               }
               this.currentFrame = i;
            },
            gotoAndStop:function(i){
               this._goto(i);
               if(!this.autoPlay){
                 //再stop的状态下面跳帧，就要告诉stage去发心跳
                 this._preRenderTime = 0;
                 this.getStage().heartBeat();
                 return;
               }
               this.autoPlay = false;
            },
            stop:function(){
               if(!this.autoPlay){
                 return;
               }
               this.autoPlay = false;
            },
            gotoAndPlay:function(i){
               this._goto(i);
               this.play();
            },
            play:function(){
               if(this.autoPlay){
                 return;
               }
               this.autoPlay = true;
               var canvax = this.getStage().parent;
               if(!canvax._heartBeat && canvax._taskList.length==0){
                   //手动启动引擎
                   canvax.__startEnter();
               }
               this._push2TaskList();
               
               this._preRenderTime = new Date().getTime();
            },
            _push2TaskList : function(){
               //把enterFrame push 到 引擎的任务列表
               if(!this._enterInCanvax){
                 this.getStage().parent._taskList.push( this );
                 this._enterInCanvax=true;
               }
            },
            //autoPlay为true 而且已经把__enterFrame push 到了引擎的任务队列，
            //则为true
            _enterInCanvax:false, 
            __enterFrame:function(){
               var self = this;
               if((Base.now-self._preRenderTime) >= self._speedTime ){
                   //大于_speedTime，才算完成了一帧
                   //上报心跳 无条件心跳吧。
                   //后续可以加上对应的 Movieclip 跳帧 心跳
                   self.getStage().heartBeat();
               }
      
            },
            next  :function(){
               var self = this;
               if(!self.autoPlay){
                   //只有再非播放状态下才有效
                   self.gotoAndStop(self._next());
               }
            },
            pre   :function(){
               var self = this;
               if(!self.autoPlay){
                   //只有再非播放状态下才有效
                   self.gotoAndStop(self._pre());
               }
            },
            _next : function(){
               var self = this;
               if(this.currentFrame >= this.children.length-1){
                   this.currentFrame = 0;
               } else {
                   this.currentFrame++;
               }
               return this.currentFrame;
            },
      
            _pre : function(){
               var self = this;
               if(this.currentFrame == 0){
                   this.currentFrame = this.children.length-1;
               } else {
                   this.currentFrame--;
               }
               return this.currentFrame;
            },
            render:function(ctx){
                //这里也还要做次过滤，如果不到speedTime，就略过
                //console.log("moveclip_reder_ready")
      
                //TODO：如果是改变moviclip的x or y 等 非帧动画 属性的时候加上这个就会 有漏帧现象，先注释掉
                /* 
                if( (Base.now-this._preRenderTime) < this._speedTime ){
                   return;
                }
                */
      
                //因为如果children为空的话，Movieclip 会把自己设置为 visible:false，不会执行到这个render
                //所以这里可以不用做children.length==0 的判断。 大胆的搞吧。
      
                if( !this.overPlay ){
                    this.getChildAt(this.currentFrame)._render(ctx);
                } else {
                    for(var i=0 ; i <= this.currentFrame ; i++){
                        this.getChildAt(i)._render(ctx);
                    }
                }
      
                if(this.children.length == 1){
                    this.autoPlay = false;
                }
      
                //如果不循环
                if( this.currentFrame == this.getNumChildren()-1 ){
                    //那么，到了最后一帧就停止
                    if(!this.repeat) {
                        this.stop();
                        if( this.hasEvent("end") ){
                            this.fire("end");
                        }
                    }
                    //使用掉一次循环
                    if( _.isNumber( this.repeat ) && this.repeat > 0 ) {
                       this.repeat -- ;
                    }
                }
      
                if(this.autoPlay){
                    //如果要播放
                    if( (Base.now-this._preRenderTime) >= this._speedTime ){
                        //先把当前绘制的时间点记录
                        this._preRenderTime = Base.now;
                        this._next();
                    }
                    this._push2TaskList();
                } else {
                    //暂停播放
                    if(this._enterInCanvax){
                        //如果这个时候 已经 添加到了canvax的任务列表
                        this._enterInCanvax=false;
                        var tList = this.getStage().parent._taskList;
                        tList.splice( _.indexOf(tList , this) , 1 ); 
                    }
                }
      
            } 
        });
      
        return Movieclip;
      
    }
)
;define(
    "canvax/display/Point",
    [],
    function(){
        var Point = function(x,y){
            if(arguments.length==1 && typeof arguments[0] == 'object' ){
               var arg=arguments[0]
               if( "x" in arg && "y" in arg ){
                  this.x = arg.x*1;
                  this.y = arg.y*1;
               } else {
                  var i=0;
                  for (var p in arg){
                      if(i==0){
                        this.x = arg[p]*1;
                      } else {
                        this.y = arg[p]*1;
                        break;
                      }
                      i++;
                  }
               }
               return;
            }
            x || (x=0);
            y || (y=0);
            this.x = x*1;
            this.y = y*1;
        };
        return Point;
    }
);
;define(
    "canvax/display/Shape",
    [
        "canvax/display/DisplayObject",
        "canvax/core/Base"
    ],
    function( DisplayObject , Base  ){

        var Shape = function(opt){
            
            var self = this;
            //元素是否有hover事件 和 chick事件，由addEvenetLister和remiveEventLister来触发修改
            self._hoverable = false;
            self._clickable = false;
     
            //over的时候如果有修改样式，就为true
            self._hoverClass = false;
     
            //拖拽drag的时候显示在activShape的副本
            self._dragDuplicate = null;
     
            //元素是否 开启 drag 拖动，这个有用户设置传入
            //self.draggable = opt.draggable || false;
     
            self.type = self.type || "shape" ;
            opt.draw && (self.draw=opt.draw);
            arguments.callee.superclass.constructor.apply(this , arguments);
            self._rect = null;
        };
     
        Base.creatClass(Shape , DisplayObject , {
           init : function(){
           },
           /*
            *下面两个方法为提供给 具体的 图形类覆盖实现，本shape类不提供具体实现
            *draw() 绘制   and   setRect()获取该类的矩形边界
           */
           draw:function(){
           
           },
           drawEnd : function(ctx){
               if(this._hasFillAndStroke){
                   //如果在子shape类里面已经实现stroke fill 等操作， 就不需要统一的d
                   return;
               }
     
               //style 要从diaplayObject的 context上面去取
               var style = this.context;
             
               //fill stroke 之前， 就应该要closepath 否则线条转角口会有缺口。
               //drawTypeOnly 由继承shape的具体绘制类提供
               if ( this.drawTypeOnly != "stroke" ){
                  ctx.closePath();
               }
     
               if ( style.strokeStyle && style.lineWidth ){
                   ctx.stroke();
               }
               //比如贝塞尔曲线画的线,drawTypeOnly==stroke，是不能使用fill的，后果很严重
               if (style.fillStyle && this.drawTypeOnly!="stroke"){
                   ctx.fill();
               }
               
           },
     
     
           render : function(){
              var ctx  = this.getStage().context2D;
              
              if (this.context.type == "shape"){
                  //type == shape的时候，自定义绘画
                  //这个时候就可以使用self.graphics绘图接口了，该接口模拟的是as3的接口
                  this.draw.apply( this );
              } else {
                  //这个时候，说明该shape是调用已经绘制好的 shape 模块，这些模块全部在../shape目录下面
                  if( this.draw ){
                      ctx.beginPath();
                      this.draw( ctx , this.context );
                      this.drawEnd( ctx );
                  }
              }
           }
           ,
           /*
            * 画虚线
            */
           dashedLineTo:function(ctx, x1, y1, x2, y2, dashLength) {
                 dashLength = typeof dashLength == 'undefined'
                              ? 5 : dashLength;
                 dashLength = Math.max( dashLength , this.context.lineWidth );
                 var deltaX = x2 - x1;
                 var deltaY = y2 - y1;
                 var numDashes = Math.floor(
                     Math.sqrt(deltaX * deltaX + deltaY * deltaY) / dashLength
                 );
                 for (var i = 0; i < numDashes; ++i) {
                     var x = parseInt(x1 + (deltaX / numDashes) * i);
                     var y = parseInt(y1 + (deltaY / numDashes) * i);
                     ctx[i % 2 === 0 ? 'moveTo' : 'lineTo']( x , y );
                     if( i == (numDashes-1) && i%2 === 0){
                         ctx.lineTo( x2 , y2 );
                     }
                 }
           },
           /*
            *从cpl节点中获取到4个方向的边界节点
            *@param  context 
            *
            **/
           getRectFormPointList : function( context ){
               var minX =  Number.MAX_VALUE;
               var maxX =  Number.MIN_VALUE;
               var minY =  Number.MAX_VALUE;
               var maxY =  Number.MIN_VALUE;
      
               var cpl = context.pointList; //this.getcpl();
               for(var i = 0, l = cpl.length; i < l; i++) {
                   if (cpl[i][0] < minX) {
                       minX = cpl[i][0];
                   }
                   if (cpl[i][0] > maxX) {
                       maxX = cpl[i][0];
                   }
                   if (cpl[i][1] < minY) {
                       minY = cpl[i][1];
                   }
                   if (cpl[i][1] > maxY) {
                       maxY = cpl[i][1];
                   }
               }
     
               var lineWidth;
               if (context.strokeStyle || context.fillStyle  ) {
                   lineWidth = context.lineWidth || 1;
               } else {
                   lineWidth = 0;
               }
               return {
                   x      : Math.round(minX - lineWidth / 2),
                   y      : Math.round(minY - lineWidth / 2),
                   width  : maxX - minX + lineWidth,
                   height : maxY - minY + lineWidth
               };
           }
        });
     
        return Shape;
     
     }
)
;define(
    "canvax/display/Sprite",
    [
        "canvax/display/DisplayObjectContainer",
        "canvax/core/Base"
    ],
    function( DisplayObjectContainer , Base){
        var Sprite = function(){
            var self = this;
            self.type = "sprite";
            arguments.callee.superclass.constructor.apply(this, arguments);
        };
      
        Base.creatClass(Sprite , DisplayObjectContainer , {
            init : function(){
            
            }
        });
      
        return Sprite;
      
    } 
)
;define(
    "canvax/display/Stage",
    [
        "canvax/display/DisplayObjectContainer",
        "canvax/core/Base"
    ],
    function( DisplayObjectContainer , Base ){
  
        var Stage = function( ){
            var self = this;
            self.type = "stage";
            self.context2D = null;
            //stage正在渲染中
            self.stageRending = false;
            self._isReady = false;
            arguments.callee.superclass.constructor.apply(this, arguments);
        };
        Base.creatClass( Stage , DisplayObjectContainer , {
            init : function(){},
            //由canvax的afterAddChild 回调
            initStage : function( context2D , width , height ){
               var self = this;
               self.context2D = context2D;
               self.context.width  = width;
               self.context.height = height;
               self.context.scaleX = Base._devicePixelRatio;
               self.context.scaleY = Base._devicePixelRatio;
               self._isReady = true;
            },
            render : function( context ){
                this.stageRending = true;
                //TODO：
                //clear 看似 很合理，但是其实在无状态的cavnas绘图中，其实没必要执行一步多余的clear操作
                //反而增加无谓的开销，如果后续要做脏矩阵判断的话。在说
                this.clear();
                Stage.superclass.render.call( this, context );
                this.stageRending = false;
            },
            heartBeat : function( opt ){
                //shape , name , value , preValue 
                //displayList中某个属性改变了
                if (!this._isReady) {
                   //在stage还没初始化完毕的情况下，无需做任何处理
                   return;
                };
                opt || ( opt = {} ); //如果opt为空，说明就是无条件刷新
                opt.stage   = this;

                //TODO临时先这么处理
                this.parent && this.parent.heartBeat(opt);
            },
            clear : function(x, y, width, height) {
                if(arguments.length >= 4) {
                    this.context2D.clearRect(x, y, width, height);
                } else {
                    this.context2D.clearRect(0, 0, this.context2D.canvas.width, this.context2D.canvas.height);
                }
            }
        });

        return Stage;

    }
);
         
;define(
    "canvax/display/Text",
    [
        "canvax/display/DisplayObject",
        "canvax/core/Base"
    ],
    function(DisplayObject , Base) {
        var Text = function( text , opt ) {
            var self = this;
            self.type = "text";
            self._reNewline = /\r?\n/;
            self.fontProperts = [ "fontStyle" , "fontVariant" , "fontWeight" , "fontSize" , "fontFamily"];


            //做一次简单的opt参数校验，保证在用户不传opt的时候 或者传了opt但是里面没有context的时候报错
            opt = Base.checkOpt( opt );
            
            self._context = {
                fontSize       : opt.context.fontSize       || 13 , //字体大小默认13
                fontWeight     : opt.context.fontWeight     || "normal",
                fontFamily     : opt.context.fontFamily     || "微软雅黑",
                textDecoration : opt.context.textDecoration,  
                fillStyle      : opt.context.fontColor      || opt.context.fillStyle   || 'blank',
                lineHeight     : opt.context.lineHeight     || 1.3,
                backgroundColor     : opt.context.backgroundColor ,
                textBackgroundColor : opt.context.textBackgroundColor
            };

            self._context.font = self._getFontDeclaration();

            self.text  = text.toString();

            arguments.callee.superclass.constructor.apply(this, [opt]);

        };
        

        Base.creatClass(Text , DisplayObjectContainer , {
            $watch : function( name , value , preValue ){
                 //context属性有变化的监听函数
                 if( name in  this.fontProperts){
                     //如果修改的是font的某个内容，就重新组装一遍font的值，
                     //然后通知引擎这次对context的修改不需要上报心跳
                     this._notWatch    = false;
                     this.context.font = this._getFontDeclaration();
                 }
            },
            init : function(text , opt){
               var self = this;
            },
            render : function( ctx ){
               var textLines = this._getTextLines();

               this.context.width  = this._getTextWidth( ctx, textLines);
               this.context.height = this._getTextHeight(ctx, textLines);

               for (p in this.context.$model){
                   if(p in ctx){
                       if ( p != "textBaseline" && this.context.$model[p] ) {
                           ctx[p] = this.context.$model[p];
                       }
                   }
               }

               this._renderTextBackground(ctx, textLines);
               this._renderText(ctx, textLines);
              
            },
            resetText     : function( text ){
               this.text  = text.toString();
               this.heartBeat();
            },
            getTextWidth  : function(){
               var width = 0;
               Base._pixelCtx.save();
               Base._pixelCtx.font = this.context.font;
               width = this._getTextWidth(  Base._pixelCtx , this._getTextLines() );
               Base._pixelCtx.restore();
               return width;
            },
            getTextHeight : function(){
               return this._getTextHeight( Base._pixelCtx , this._getTextLines() );
            },
            _getTextLines : function(){
               return this.text.split( this._reNewline );
            },
            _renderText: function(ctx, textLines) {
                ctx.save();
                this._renderTextFill(ctx, textLines);
                this._renderTextStroke(ctx, textLines);
                ctx.restore();
            },
            _getFontDeclaration: function() {
                var self         = this;
                var fontArr      = [];
                    
                _.each( this.fontProperts , function( p ){
                    var fontP    =  self._context[p];
                    if( p == "fontSize" ) { 
                        fontP = parseFloat( fontP ) + "px"
                    }
                    fontP && fontArr.push( fontP );
                } );

                return fontArr.join(' ');

            },
            _renderTextFill: function(ctx, textLines) {
                if (!this.context.fillStyle ) return;

                this._boundaries = [ ];
                var lineHeights = 0;

                for (var i = 0, len = textLines.length; i < len; i++) {
                    var heightOfLine = this._getHeightOfLine(ctx, i, textLines);
                    lineHeights += heightOfLine;

                    this._renderTextLine(
                            'fillText',
                            ctx,
                            textLines[i],
                            0,//this._getLeftOffset(),
                            this._getTopOffset() + lineHeights,
                            i
                            );
                }
            },
            _renderTextStroke: function(ctx, textLines) {
                if ( (!this.context.strokeStyle || !this.context.lineWidth ) && !this._skipFillStrokeCheck) return;

                var lineHeights = 0;

                ctx.save();
                if (this.strokeDashArray) {
                    if (1 & this.strokeDashArray.length) {
                        this.strokeDashArray.push.apply(this.strokeDashArray, this.strokeDashArray);
                    }
                    supportsLineDash && ctx.setLineDash(this.strokeDashArray);
                }

                ctx.beginPath();
                for (var i = 0, len = textLines.length; i < len; i++) {
                    var heightOfLine = this._getHeightOfLine(ctx, i, textLines);
                    lineHeights += heightOfLine;

                    this._renderTextLine(
                            'strokeText',
                            ctx,
                            textLines[i],
                            0, //this._getLeftOffset(),
                            this._getTopOffset() + lineHeights,
                            i
                            );
                }
                ctx.closePath();
                ctx.restore();
            },
            _renderTextLine: function(method, ctx, line, left, top, lineIndex) {
                top -= this.context.fontSize / 4;

                if (this.context.textAlign !== 'justify') {
                    this._renderChars(method, ctx, line, left, top, lineIndex);
                    return;
                }

                var lineWidth = ctx.measureText(line).width;
                var totalWidth = this.context.width;

                if (totalWidth > lineWidth) {
                    var words = line.split(/\s+/);
                    var wordsWidth = ctx.measureText(line.replace(/\s+/g, '')).width;
                    var widthDiff = totalWidth - wordsWidth;
                    var numSpaces = words.length - 1;
                    var spaceWidth = widthDiff / numSpaces;

                    var leftOffset = 0;
                    for (var i = 0, len = words.length; i < len; i++) {
                        this._renderChars(method, ctx, words[i], left + leftOffset, top, lineIndex);
                        leftOffset += ctx.measureText(words[i]).width + spaceWidth;
                    }
                }
                else {
                    this._renderChars(method, ctx, line, left, top, lineIndex);
                }
            },
            _renderChars: function(method, ctx, chars, left, top) {
                ctx[method]( chars , 0 , top );
            },
            _getHeightOfLine: function() {
                return this.context.fontSize * this.context.lineHeight;
            },
            _getTextWidth: function(ctx, textLines) {
                
                var maxWidth = ctx.measureText(textLines[0] || '|').width;

                for (var i = 1, len = textLines.length; i < len; i++) {
                    var currentLineWidth = ctx.measureText(textLines[i]).width;
                    if (currentLineWidth > maxWidth) {
                        maxWidth = currentLineWidth;
                    }
                }
                return maxWidth;
            },
            _getTextHeight: function(ctx, textLines) {
                return this.context.fontSize * textLines.length * this.context.lineHeight;
            },
            _renderTextBackground: function(ctx, textLines) {
                this._renderTextBoxBackground(ctx);
                this._renderTextLinesBackground(ctx, textLines);
            },
            _renderTextBoxBackground: function(ctx) {
                if (!this.context.backgroundColor) return;

                ctx.save();
                ctx.fillStyle = this.context.backgroundColor;
                ctx.fillRect(
                    this._getLeftOffset(),
                    this._getTopOffset(),
                    this.context.width,
                    this.context.height
                    );
                ctx.restore();
            },
            _renderTextLinesBackground: function(ctx, textLines) {
                if (!this.context.textBackgroundColor) return;
                ctx.save();
                ctx.fillStyle = this.context.textBackgroundColor;
                for (var i = 0, len = textLines.length; i < len; i++) {
                    if (textLines[i] !== '') {
                        var lineWidth      = this._getLineWidth(ctx, textLines[i]);
                        var lineLeftOffset = this._getLineLeftOffset(lineWidth);
                        ctx.fillRect(
                            this._getLeftOffset() + lineLeftOffset,
                            this._getTopOffset() + (i * this.context.fontSize * this.context.lineHeight),
                            lineWidth,
                            this.context.fontSize * this.context.lineHeight
                            );
                    }
                }
                ctx.restore();
            },
            _getLineWidth: function(ctx, line) {
                return this.context.textAlign === 'justify'
                    ? this.context.width
                    : ctx.measureText(line).width;
            },
            _getLineLeftOffset: function(lineWidth) {
                if (this.context.textAlign === 'center') {
                    return (this.context.width - lineWidth) / 2;
                }
                if (this.context.textAlign === 'right') {
                    return this.context.width - lineWidth;
                }
                return 0;
            },
            _getLeftOffset: function() {
                var l = 0;
                switch(this.context.textAlign){
                    case "left":
                         l = 0;
                         break; 
                    case "center":
                         l = -this.context.width / 2;
                         break;
                    case "right":
                         l = -this.context.width;
                         break;
                }
                return l;
            },

            /**
             * @private
             * @return {Number} Top offset
             */
            _getTopOffset: function() {
                var t = 0;
                switch(this.context.textBaseline){
                    case "top":
                         t = 0;
                         break; 
                    case "middle":
                         t = -this.context.height / 2;
                         break;
                    case "bottom":
                         t = -this.context.height;
                         break;
                }
                return t;
            }
        });
        return Text;
    }
);
;define(
    "canvax/event/CanvaxEvent",
    [
         "canvax/event/EventBase",
         "canvax/core/Base"
    ],
    function(EventBase,Base){
        var CanvaxEvent = function(type, bubbles, cancelable) {
            EventBase.call(this, type, bubbles, cancelable);
    
            this.mouseX = 0;
            this.mouseY = 0;
        }
    
        Base.creatClass( CanvaxEvent , EventBase , {
            toString : function() {
            return "[CanvaxEvent type=" + this.type + ", mouseX=" + this.mouseX + ", mouseY=" + this.mouseY + "]";
        }
    
        });
    
        CanvaxEvent.EVENTS = [
           "click" , "mousedown" , "mousemove" , "mouseup" , "mouseout"    
        ];
    
        var addOrRmoveEventHand = function( domHand , ieHand ){
            if( document[ domHand ] ){
                return function( el , type , fn ){
                    if( el.length ){
                        for(var i=0 ; i < el.length ; i++){
                            arguments.callee( el[i] , type , fn );
                        }
                    } else {
                        el[ domHand ]( type , fn , false );
                    }
                };
            } else {
                return function( el , type , fn ){
                    if( el.length ){
                        for(var i=0 ; i < el.length ; i++){
                            arguments.callee( el[i],type,fn );
                        }
                    } else {
                        el[ ieHand ]( "on"+type , function(){
                            return fn.call( el , window.event );
                        });
                    }
                };
            }
        }
    
    
    
        /*
         * 添加事件侦听
         */
        CanvaxEvent.addEvent    = addOrRmoveEventHand( "addEventListener" , "attachEvent" );
         /*
         * 删除事件侦听
         */
        CanvaxEvent.removeEvent = addOrRmoveEventHand( "removeEventListener" , "detachEvent" );
        
        //阻止浏览器的默认行为 
        CanvaxEvent.stopDefault = function( e ) { 
                //阻止默认浏览器动作(W3C) 
                    if ( e && e.preventDefault ) 
                        e.preventDefault(); 
                //IE中阻止函数器默认动作的方式 
                    else
                        window.event.returnValue = false; 
                return false; 
        }
    
        return CanvaxEvent;
    
    } 
)


;define(
    "canvax/event/EventBase",
    [
        "canvax/core/Base"
    ],
    function(core){
        var EventBase = function(type, bubbles, cancelable) {
            this.type = type;
            this.target = null;
            this.currentTarget = null;	
            this.params = null;
    
            this.bubbles = bubbles != undefined ? bubbles : false; //TODO Not implemented yet.
            this.cancelable = cancelable != undefined ? cancelable : false;	//TODO Not implemented yet.
    
            this._stopPropagation = false ; //默认不阻止事件冒泡
        }
    
        /**
         * @private Not implemented yet.
         */
        EventBase.prototype.stopPropagation = function() {
            //TODO
            this._stopPropagation = true;
        }
    
        /**
         * @private Not implemented yet.
         */
        EventBase.prototype.preventDefault = function() {
            //TODO
        }
    
        /**
         * Duplicates an instance of the Event object.
         */
        EventBase.prototype.clone = function() {
            return Base.copy(this);
        }
    
        /**
         * Deletes all properties of the Event object.
         */
        EventBase.prototype.dispose = function() {
            delete this.type;
            delete this.target;
            delete this.currentTarget;
            delete this.params;
        }
    
        /**
         * Returns a string of the Event object.
         */
        EventBase.prototype.toString = function() {
            return "[EventBase type=" + this.type + "]";
        }
    
    
        return EventBase;
    
    
    } 
);
;define(
    "canvax/event/EventDispatcher",
    [
        "canvax/core/Base",
        "canvax/event/EventManager"
    ],
    function( Base ,EventManager){

        var EventDispatcher = function(){
            arguments.callee.superclass.constructor.call(this, name);
        };
      
        Base.creatClass(EventDispatcher , EventManager , {
            on : function(type, listener){
                this._addEventListener( type, listener);
                return this;
            },
            addEventListener:function(type, listener){
                this._addEventListener( type, listener);
                return this;
            },
            un : function(type,listener){
                this._removeEventListener( type, listener);
                return this;
            },
            removeEventListener:function(type,listener){
                this._removeEventListener( type, listener);
                return this;
            },
            removeEventListenerByType:function(type){
                this._removeEventListenerByType( type);
                return this;
            },
            removeAllEventListeners:function(){
                this._removeAllEventListeners();
                return this;
            },
            fire : function(event){
                if(_.isString(event)){
                    //如果是str，比如mouseover
                    event = { type : event };
                } else {
          
                }
                this.dispatchEvent(event);
                return this;
            },
            dispatchEvent:function(event){
                if(event.type == "mouseover"){
                   //记录dispatchEvent之前的心跳
                   var preHeartBeat = this._heartBeatNum;
                   this._dispatchEvent( event );
                   if( preHeartBeat != this._heartBeatNum ){
                       this._hoverClass = true;

                       var canvax = this.getStage().parent;
    

                       /*
                       //如果前后心跳不一致，说明有mouseover 属性的修改，也就是有hover态
                       //那么该该心跳包肯定已经 巴shape添加到了canvax引擎的convertStages队列中
                       //把该shape从convertStages中干掉，重新添加到专门渲染hover态shape的_hoverStage中
                       if(_.values(canvax.convertStages[this.getStage().id].convertShapes).length > 1){
                           //如果还有其他元素也上报的心跳，那么该画的还是得画，不管了
                       } else {
                           delete canvax.convertStages[ this.getStage().id ];
                           this._heart = false;
                       }
                       */

                       

                       //然后clone一份obj，添加到_hoverStage 中
                       var activShape = this.clone(true);                     
                       activShape._transform = this.getConcatenatedMatrix();
                       canvax._hoverStage.addChildAt( activShape , 0 ); 

                       //然后把自己visible=false隐藏了
                       //this.context.visible = false;
                       this._globalAlpha = this.context.globalAlpha;
                       this.context.globalAlpha = 0

                   }
                   return;
                }
      
                this._dispatchEvent( event );
      
                if(event.type == "mouseout"){
                    if(this._hoverClass){
                        //说明刚刚over的时候有添加样式
                        var canvax = this.getStage().parent;
                        this._hoverClass = false;
                        canvax._hoverStage.removeChildById(this.id);
                        
                        //this.context.visible = true;
                        this.context.globalAlpha = this._globalAlpha;
                        delete this._globalAlpha;

                    }
                }
      
                return this;
            },
            hasEvent:function(type){
                return this._hasEventListener(type);
            },
            hasEventListener:function(type){
                return this._hasEventListener(type);
            },
            hover : function( overFun , outFun ){
                this.on("mouseover" , overFun);
                this.on("mouseout"  , outFun );
                return this;
            },
            once : function(type, listener){
                this.on(type , function(){
                    listener.apply(this , arguments);
                    this.un(type , arguments.callee);
                });
                return this;
            }
        });
      
        return EventDispatcher;
      
    }
);
;define(
    "canvax/event/EventManager",
    [ ],
    function(){
        /**
         * 构造函数.
         * @name EventDispatcher
         * @class EventDispatcher类是可调度事件的类的基类，它允许显示列表上的任何对象都是一个事件目标。
         */
        var EventManager = function() {
            //事件映射表，格式为：{type1:[listener1, listener2], type2:[listener3, listener4]}
            this._eventMap = {};
        };
    
        EventManager.prototype = { 
            /*
             * 注册事件侦听器对象，以使侦听器能够接收事件通知。
             */
            _addEventListener : function(type, listener) {
    
                if( typeof listener != "function" ){
                  //listener必须是个function呐亲
                  return false;
                }
                var addResult = true;
                var self      = this;
                _.each( type.split(" ") , function(type){
                    var map = self._eventMap[type];
                    if(!map){
                        map = self._eventMap[type] = [];
                        map.push(listener);
                        self._eventEnabled = true;
                        return true;
                    }
    
                    if(_.indexOf(map ,listener) == -1) {
                        map.push(listener);
                        self._eventEnabled = true;
                        return true;
                    }
    
                    addResult = false;
                });
                return addResult;
            },
            /**
             * 删除事件侦听器。
             */
            _removeEventListener : function(type, listener) {
                if(arguments.length == 1) return this.removeEventListenerByType(type);
    
                var map = this._eventMap[type];
                if(!map){
                    return false;
                }
    
                for(var i = 0; i < map.length; i++) {
                    var li = map[i];
                    if(li === listener) {
                        map.splice(i, 1);
                        if(map.length    == 0) { 
                            delete this._eventMap[type];
                            //如果这个如果这个时候child没有任何事件侦听
                            if(_.isEmpty(this._eventMap)){
                                //那么该元素不再接受事件的检测
                                this._eventEnabled = false;
                            }
                        }
                        return true;
                    }
                }
                
                return false;
            },
            /**
             * 删除指定类型的所有事件侦听器。
             */
            _removeEventListenerByType : function(type) {
                var map = this._eventMap[type];
                if(!map) {
                    delete this._eventMap[type];
    
                    //如果这个如果这个时候child没有任何事件侦听
                    if(_.isEmpty(this._eventMap)){
                        //那么该元素不再接受事件的检测
                        this._eventEnabled = false;
                    }
    
                    return true;
                }
                return false;
            },
            /**
             * 删除所有事件侦听器。
             */
            _removeAllEventListeners : function() {	
                this._eventMap = {};
                this._eventEnabled = false;
            },
            /**
            * 派发事件，调用事件侦听器。
            */
            _dispatchEvent : function(e) {
                var map = this._eventMap[e.type];
                
                if( map ){
                    if(!e.target) e.target = this;
                    map = map.slice();
    
                    for(var i = 0; i < map.length; i++) {
                        var listener = map[i];
                        if(typeof(listener) == "function") {
                            listener.call(this, e);
                        }
                    }
                }
    
                if( !e._stopPropagation ) {
                    //向上冒泡
                    if( this.parent ){
                        e.currentTarget = this.parent;
                        this.parent._dispatchEvent( e );
                    }
                } 
                return true;
            },
            /**
               * 检查是否为指定事件类型注册了任何侦听器。
               */
            _hasEventListener : function(type) {
                var map = this._eventMap[type];
                return map != null && map.length > 0;
            }
        }
    
        return EventManager;
    }
);
;define(
    "canvax/geom/HitTestPoint",
    [
        "canvax/core/Base",
        "canvax/geom/Math"
    ],
    function(Base , myMath){
        /**
         * 图形空间辅助类
         * isInside：是否在区域内部
         * isOutside：是否在区域外部
         * getTextWidth：测算单行文本宽度
         * TODO:本检测只为进一步的 详细 检测。也就是说 进过了基本的矩形范围检测后才会
         * 使用本检测方法
         */
        var HitTestPoint={};
    
        /**
         * 包含判断
         * @param {string} shape : 图形
         * @param {number} x ： 横坐标
         * @param {number} y ： 纵坐标
         */
        function isInside(shape , point) {
            var x = point.x;
            var y = point.y;
            if( shape.type == "bitmap" ){
                //如果是bitmap
                return true;
            }
    
            if (!shape || !shape.type) {
                // 无参数或不支持类型
                return false;
            }
            var zoneType = shape.type;
    
    
            // 未实现或不可用时则数学运算，主要是line，brokenLine
            var _mathReturn = _mathMethod(zoneType, shape, x, y);
    
            if (typeof _mathReturn != 'undefined') {
                return _mathReturn;
            }
    
            if (zoneType != 'beziercurve'&& shape.buildPath && Base._pixelCtx.isPointInPath) {
                   return _buildPathMethod(shape, Base._pixelCtx, x, y);
            } else if (Base._pixelCtx.getImageData) {
                return _pixelMethod(shape, x, y);
            }
    
            // 上面的方法都行不通时
            switch (zoneType) {
                //心形----------------------10
                case 'heart':
                    return true;    // Todo，不精确
                    //水滴----------------------11
                case 'droplet':
                    return true;    // Todo，不精确
                case 'ellipse':
                    return true;     // Todo，不精确
                    //路径，椭圆，曲线等-----------------13
                default:
                    return false;   // Todo，暂不支持
            }
        }
    
        /**
         * 用数学方法判断，三个方法中最快，但是支持的shape少
         *
         * @param {string} zoneType ： 图形类型
         * * @param {number} x ： 横坐标
         * @param {number} y ： 纵坐标
         * @return {boolean=} true表示坐标处在图形中
         */
        function _mathMethod(zoneType,shape,x, y) {
            // 在矩形内则部分图形需要进一步判断
            switch (zoneType) {
                //线-----------------------1
                case 'line':
                    return _isInsideLine(shape.context, x, y);
                    //折线----------------------2
                case 'brokenLine':
                    return _isInsideBrokenLine(shape, x, y);
                    //文本----------------------3
                case 'text':
                    return true;
                    //圆环----------------------4
                case 'ring':
                    return _isInsideRing(shape , x, y);
                    //矩形----------------------5
                case 'rect':
                    return true;
                    //圆形----------------------6
                case 'circle':
                    return _isInsideCircle(shape , x, y);
                    //椭圆
                case 'ellipse':
                    return _isPointInElipse(shape , x , y);
                    //扇形----------------------7
                case 'sector':
                    return _isInsideSector(shape , x, y);
                    //path---------------------8
                case 'path':
                    return _isInsidePath(shape , x, y);
                    //多边形-------------------9
                case 'polygon':
                case 'star':
                case 'isogon':
                    return _isInsidePolygon(shape , x, y);
                    //图片----------------------10
                case 'image':
                    return true;
            }
        }
    
        /**
         * 通过buildPath方法来判断，三个方法中较快，但是不支持线条类型的shape，
         * 而且excanvas不支持isPointInPath方法
         *
         * @param {Object} shapeClazz ： shape类
         * @param {Object} context : 上下文
         * @param {Object} context ：目标区域
         * @param {number} x ： 横坐标
         * @param {number} y ： 纵坐标
         * @return {boolean} true表示坐标处在图形中
         */
        function _buildPathMethod(shape, context, x, y) {
            var context = shape.context;
            // 图形类实现路径创建了则用类的path
            context.beginPath();
            shape.buildPath(context, context);
            context.closePath();
            return context.isPointInPath(x, y);
        }
    
        /**
         * 通过像素值来判断，三个方法中最慢，但是支持广,不足之处是excanvas不支持像素处理,flashCanvas支持还好
         *
         * @param {Object} shapeClazz ： shape类
         * @param {Object} context ：目标区域
         * @param {number} x ： 横坐标
         * @param {number} y ： 纵坐标
         * @return {boolean} true表示坐标处在图形中
         */
        function _pixelMethod(shape, x, y) {
            var context  = shape.context;
            
            var _context = Base._pixelCtx;
                
            _context.save();
            _context.beginPath();
            Base.setContextStyle( _context , context.$model );
           
            _context.transform.apply( _context , shape.getConcatenatedMatrix().toArray() );
    
            //这个时候肯定是做过矩形范围检测过来的
            //所以，shape._rect 肯定都是已经有值的
            _context.clearRect( shape._rect.x-10 , shape._rect.y-10 , shape._rect.width+20 , shape._rect.height+20 );
    
    
            shape.draw( _context,  context );

            _context.globalAlpha = 1;

            shape.drawEnd(_context);
            _context.closePath();
            _context.restore();
    
            //对鼠标的坐标也做相同的变换
            var _transformStage = shape.getConcatenatedMatrix()
            if( _transformStage ){
                var inverseMatrix = _transformStage.clone();
    
                var originPos = [x, y];
                inverseMatrix.mulVector( originPos , [ x , y , 1 ] );
    
                x = originPos[0];
                y = originPos[1];
            }
    
            return _isPainted(_context, x , y);
        };
    
        /**
         * 坐标像素值，判断坐标是否被作色
         *
         * @param {Object} context : 上下文
         * @param {number} x : 横坐标
         * @param {number} y : 纵坐标
         * @param {number=} unit : 触发的精度，越大越容易触发，可选，缺省是为1
         * @return {boolean} 已经被画过返回true
         */
        function _isPainted(context, x, y, unit) {
            var pixelsData;
    
            if (typeof unit != 'undefined') {
                unit = Math.floor((unit || 1 )/ 2);
                pixelsData = context.getImageData(
                        x - unit,
                        y - unit,
                        unit + unit,
                        unit + unit
                        ).data;
            }
            else {
                pixelsData = context.getImageData(x, y, 1, 1).data;
            }
    
            var len = pixelsData.length;
            while (len--) {
                if (pixelsData[len] !== 0) {
                    return true;
                }
            }
    
            return false;
        };
    
        /**
         * !isInside
         */
        function isOutside(shape, x, y) {
            return !isInside(shape, x, y);
        };
    
        /**
         * 线段包含判断
         */
        function _isInsideLine( context , x , y ) {
            var _x1 = context.xStart;
            var _y1 = context.yStart;
            var _x2 = context.xEnd;
            var _y2 = context.yEnd;
            var _l  = context.lineWidth;
            var _a = 0;
            var _b = _x1;
    
            if (_x1 !== _x2) {
                _a = (_y1 - _y2) / (_x1 - _x2);
                _b = (_x1 * _y2 - _x2 * _y1) / (_x1 - _x2) ;
            }
            else {
                return Math.abs(x - _x1) <= _l / 2;
            }
    
            var _s = (_a * x - y + _b) * (_a * x - y + _b) / (_a * _a + 1);
            return  _s <= _l / 2 * _l / 2;
        };
    
        function _isInsideBrokenLine(shape, x, y) {
            var context   = shape.context;
            var pointList = context.pointList;
            var lineArea;
            var insideCatch = false;
            for (var i = 0, l = pointList.length - 1; i < l; i++) {
                lineArea = {
                    xStart : pointList[i][0],
                    yStart : pointList[i][1],
                    xEnd   : pointList[i + 1][0],
                    yEnd   : pointList[i + 1][1],
                    lineWidth : context.lineWidth
                };
                if (!_isInsideRectangle(
                            {
                                x : Math.min(lineArea.xStart, lineArea.xEnd)
                    - lineArea.lineWidth,
                   y : Math.min(lineArea.yStart, lineArea.yEnd)
                    - lineArea.lineWidth,
                   width : Math.abs(lineArea.xStart - lineArea.xEnd)
                    + lineArea.lineWidth,
                   height : Math.abs(lineArea.yStart - lineArea.yEnd)
                    + lineArea.lineWidth
                            },
                            x,y
                            )
                   ) {
                       // 不在矩形区内跳过
                       continue;
                   }
                insideCatch = _isInsideLine(lineArea, x, y);
                if (insideCatch) {
                    break;
                }
            }
            return insideCatch;
        };
    
        function _isInsideRing(shape , x, y) {
            var context = shape.context;
            if (_isInsideCircle(shape , x, y)
                    && !_isInsideCircle(
                        shape,
                        x, y,
                        context.r0 || 0
                        )
               ){
                   // 大圆内，小圆外
                   return true;
               }
            return false;
        };
    
        /**
         * 矩形包含判断
         */
        function _isInsideRectangle(shape, x, y) {
    
            if (x >= shape.x
                    && x <= (shape.x + shape.width)
                    && y >= shape.y
                    && y <= (shape.y + shape.height)
               ) {
                   return true;
               }
            return false;
        };
    
        /**
         * 圆形包含判断
         */
        function _isInsideCircle(shape, x, y , r) {
            var context = shape.context;
            !r && ( r = context.r );
            return (x * x + y * y) < r * r;
        };
    
        /**
         * 扇形包含判断
         */
        function _isInsideSector(shape, x, y) {
            var context = shape.context
            if (!_isInsideCircle(shape, x, y)
                    || ( context.r0 > 0 && _isInsideCircle( shape ,x, y , context.r0))
               ){
                   // 大圆外或者小圆内直接false
                   return false;
               }
            else {
                // 判断夹角
                var startAngle = myMath.degreeTo360(context.startAngle);            // 起始角度[0,360)
                var endAngle   = myMath.degreeTo360(context.endAngle);              // 结束角度(0,360]
    
                //计算该点所在的角度
                var angle      = myMath.degreeTo360( (Math.atan2(y , x ) / Math.PI * 180) % 360 );
                
                var regIn      = true;  //如果在start和end的数值中，end大于start而且是顺时针则regIn为true
                if ( (startAngle > endAngle && !context.clockwise ) || (startAngle < endAngle && context.clockwise ) ) {
                    regIn      = false; //out
                }
                //度的范围，从小到大
                var regAngle   = [ 
                    Math.min( startAngle , endAngle ) , 
                    Math.max( startAngle , endAngle ) 
                ];
    
                //console.log(angle+"|"+startAngle+"|"+endAngle)
    
                var inAngleReg = angle > regAngle[0] && angle < regAngle[1];
                return (inAngleReg && regIn) || (!inAngleReg && !regIn);
            }
        };
    
        /*
         *椭圆包含判断
         * */
        function _isPointInElipse(shape , x , y) {
            var context = shape.context;
            var center  = { x:0 , y:0 };
            //x半径
            var XRadius = context.hr;
            var YRadius = context.vr;
    
            var p = {
                x : x,
                y : y
            }
            
            var iRes;
    
            p.x -= center.x;
            p.y -= center.y;
    
            p.x *= p.x;
            p.y *= p.y;
    
            XRadius *= XRadius;
            YRadius *= YRadius;
    
            iRes = YRadius * p.x + XRadius * p.y - XRadius * YRadius;
    
            return (iRes < 0);
        };
    
        /**
         * 多边形包含判断
         * 警告：下面这段代码会很难看，建议跳过~
         */
        function _isInsidePolygon(shape, x, y) {
            /**
             * 射线判别法
             * 如果一个点在多边形内部，任意角度做射线肯定会与多边形要么有一个交点，要么有与多边形边界线重叠
             * 如果一个点在多边形外部，任意角度做射线要么与多边形有一个交点，
             * 要么有两个交点，要么没有交点，要么有与多边形边界线重叠。
             */
            var context = shape.context ? shape.context : shape;
            var polygon = context.pointList ;
            var i;
            var j;
            var N = polygon.length;
            var inside = false;
            var redo = true;
            var v;
    
            for (i = 0; i < N; ++i) {
                // 是否在顶点上
                if (polygon[i][0] == x && polygon[i][1] == y ) {
                    redo = false;
                    inside = true;
                    break;
                }
            }
    
            if (redo) {
                redo = false;
                inside = false;
                for (i = 0,j = N - 1;i < N;j = i++) {
                    if ((polygon[i][1] < y && y < polygon[j][1])
                            || (polygon[j][1] < y && y < polygon[i][1])
                       ) {
                           if (x <= polygon[i][0] || x <= polygon[j][0]) {
                               v = (y - polygon[i][1])
                                   * (polygon[j][0] - polygon[i][0])
                                   / (polygon[j][1] - polygon[i][1])
                                   + polygon[i][0];
                               if (x < v) {          // 在线的左侧
                                   inside = !inside;
                               }
                               else if (x == v) {   // 在线上
                                   inside = true;
                                   break;
                               }
                           }
                       }
                    else if (y == polygon[i][1]) {
                        if (x < polygon[i][0]) {    // 交点在顶点上
                            polygon[i][1] > polygon[j][1] ? --y : ++y;
                            //redo = true;
                            break;
                        }
                    }
                    else if (polygon[i][1] == polygon[j][1] // 在水平的边界线上
                            && y == polygon[i][1]
                            && ((polygon[i][0] < x && x < polygon[j][0])
                                || (polygon[j][0] < x && x < polygon[i][0]))
                            ) {
                                inside = true;
                                break;
                            }
                }
            }
            return inside;
        };
    
        /**
         * 路径包含判断，依赖多边形判断
         */
        function _isInsidePath(shape, x, y) {
            var context = shape.context;
            var pointList = context.pointList;
            var insideCatch = false;
            for (var i = 0, l = pointList.length; i < l; i++) {
                insideCatch = _isInsidePolygon(
                        { pointList : pointList[i] }, x, y
                        );
                if (insideCatch) {
                    break;
                }
            }
            return insideCatch;
        };
    
        /**
         * 测算单行文本宽度
         * @param {Object} text
         * @param {Object} textFont
         */
        function getTextWidth(text, textFont) {
            Base._pixelCtx.save();
            if (textFont) {
                Base._pixelCtx.font = textFont;
            }
            var width = Base._pixelCtx.measureText(text).width;
            Base._pixelCtx.restore();
    
            return width;
        };
    
        HitTestPoint = {
            isInside : isInside,
            isOutside : isOutside,
            getTextWidth : getTextWidth
        };
    
        return HitTestPoint;
    
    }
);
;define(
    "canvax/geom/Math",
    [],
    function(){
        var _cache = {
            sin : {},     //sin缓存
            cos : {}      //cos缓存
        };
        var _radians = Math.PI / 180;

        /**
         * @param angle 弧度（角度）参数
         * @param isDegrees angle参数是否为角度计算，默认为false，angle为以弧度计量的角度
         */
        function sin(angle, isDegrees) {
            angle = (isDegrees ? angle * _radians : angle).toFixed(4);
            if(typeof _cache.sin[angle] == 'undefined') {
                _cache.sin[angle] = Math.sin(angle);
            }
            return _cache.sin[angle];
        }

        /**
         * @param radians 弧度参数
         */
        function cos(angle, isDegrees) {
            angle = (isDegrees ? angle * _radians : angle).toFixed(4);
            if(typeof _cache.cos[angle] == 'undefined') {
                _cache.cos[angle] = Math.cos(angle);
            }
            return _cache.cos[angle];
        }

        /**
         * 角度转弧度
         * @param {Object} angle
         */
        function degreeToRadian(angle) {
            return angle * _radians;
        }

        /**
         * 弧度转角度
         * @param {Object} angle
         */
        function radianToDegree(angle) {
            return angle / _radians;
        }

        /*
         * 校验角度到360度内
         * @param {angle} number
         */
        function degreeTo360( angle ) {
            var reAng = Math.abs(360 + Math.ceil( angle ) % 360) % 360;
            if( reAng == 0 && angle !== 0 ){
                reAng = 360
            }
            return reAng;
        }

        return {
            PI  : Math.PI  ,
            sin : sin      ,
            cos : cos      ,
            degreeToRadian : degreeToRadian,
            radianToDegree : radianToDegree,
            degreeTo360    : degreeTo360   
        };
 
    }
)
;define(
    "canvax/geom/Matrix",
    [
        "canvax/core/Base"
    ],
    function(Base){
  
        var Matrix = function(a, b, c, d, tx, ty){
            this.a = a != undefined ? a : 1;
            this.b = b != undefined ? b : 0;
            this.c = c != undefined ? c : 0;
            this.d = d != undefined ? d : 1;
            this.tx = tx != undefined ? tx : 0;
            this.ty = ty != undefined ? ty : 0;
        };
    
        Base.creatClass( Matrix , function(){} , {
            concat : function(mtx){
                var a = this.a;
                var c = this.c;
                var tx = this.tx;
    
                this.a = a * mtx.a + this.b * mtx.c;
                this.b = a * mtx.b + this.b * mtx.d;
                this.c = c * mtx.a + this.d * mtx.c;
                this.d = c * mtx.b + this.d * mtx.d;
                this.tx = tx * mtx.a + this.ty * mtx.c + mtx.tx;
                this.ty = tx * mtx.b + this.ty * mtx.d + mtx.ty;
                return this;
            },
            concatTransform : function(x, y, scaleX, scaleY, rotation){
                var cos = 1;
                var sin = 0;
                if(rotation%360){
                    var r = rotation * Math.PI / 180;
                    cos = Math.cos(r);
                    sin = Math.sin(r);
                }
    
                this.concat(new Matrix(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, x, y));
                return this;
            },
            rotate : function(angle){
                //目前已经提供对顺时针逆时针两个方向旋转的支持
                var cos = Math.cos(angle);
                var sin = Math.sin(angle);
    
                var a = this.a;
                var c = this.c;
                var tx = this.tx;
    
                if (angle>0){
                    this.a = a * cos - this.b * sin;
                    this.b = a * sin + this.b * cos;
                    this.c = c * cos - this.d * sin;
                    this.d = c * sin + this.d * cos;
                    this.tx = tx * cos - this.ty * sin;
                    this.ty = tx * sin + this.ty * cos;
                } else {
                    var st = Math.sin(Math.abs(angle));
                    var ct = Math.cos(Math.abs(angle));
    
                    this.a = a*ct + this.b*st;
                    this.b = -a*st + this.b*ct;
                    this.c = c*ct + this.d*st;
                    this.d = -c*st + ct*this.d;
                    this.tx = ct*tx + st*this.ty;
                    this.ty = ct*this.ty - st*tx;
                }
                return this;
    
    
            },
            scale : function(sx, sy){
                this.a *= sx;
                this.d *= sy;
                this.tx *= sx;
                this.ty *= sy;
                return this;
            },
            translate : function(dx, dy){
                this.tx += dx;
                this.ty += dy;
                return this;
            },
            identity : function(){
                //初始化
                this.a = this.d = 1;
                this.b = this.c = this.tx = this.ty = 0;
                return this;
            },
            invert : function(){
                //逆向矩阵
                var a = this.a;
                var b = this.b;
                var c = this.c;
                var d = this.d;
                var tx = this.tx;
                var i = a * d - b * c;
    
                this.a = d / i;
                this.b = -b / i;
                this.c = -c / i;
                this.d = a / i;
                this.tx = (c * this.ty - d * tx) / i;
                this.ty = -(a * this.ty - b * tx) / i;
                return this;
            },
            clone : function(){
                return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
            },
            toString : function(){
                return "(a="+this.a+", b="+this.b+", c="+this.c+", d="+this.d+", tx="+this.tx+", ty="+this.ty+")";
            },
            toArray : function(){
                return [ this.a , this.b , this.c , this.d , this.tx , this.ty ];
            },
            /**
             * 矩阵左乘向量
             */
            mulVector : function(out , v) {
                var aa = this.a, ac = this.c, atx = this.tx;
                var ab = this.b, ad = this.d, aty = this.ty;
    
                out[0] = v[0] * aa + v[1] * ac + atx;
                out[1] = v[0] * ab + v[1] * ad + aty;
    
                return out;
            }
    
        } );
    
        return Matrix;
    
    }
);
;define(
    "canvax/index",
    [
    "canvax/core/Base",
    "canvax/event/CanvaxEvent",
    "canvax/event/EventBase",
    "canvax/event/EventDispatcher",
    "canvax/event/EventManager",

    "canvax/display/DisplayObjectContainer",
    "canvax/display/Stage",
    "canvax/display/Sprite",
    "canvax/display/Shape",
    "canvax/display/Point",
    "canvax/display/Text"
    ]
    , 
    function( 
        Base , CanvaxEvent , EventBase , EventDispatcher , EventManager , 
        DisplayObjectContainer , 
        Stage , Sprite , Shape , Point , Text   
    ) {

    var Canvax = function( opt ){
        this.type = "canvax";
        this._cid = new Date().getTime() + "_" + Math.floor(Math.random()*100); 
        
        this._rootDom   = Base.getEl(opt.el);
        this.width      = parseInt("width"  in opt || Base.getStyle(this._rootDom , "width")  , 10); 
        this.height     = parseInt("height" in opt || Base.getStyle(this._rootDom , "height") , 10); 

        //是否阻止浏览器默认事件的执行
        this.preventDefault = true;
        if( opt.preventDefault === false ){
            this.preventDefault = false
        }
 
        //如果这个时候el里面已经有东西了。嗯，也许曾经这个el被canvax干过一次了。
        //那么要先清除这个el的所有内容。
        //默认的el是一个自己创建的div，因为要在这个div上面注册n多个事件 来 在整个canvax系统里面进行事件分发。
        //所以不能直接用配置传进来的el对象。因为可能会重复添加很多的事件在上面。导致很多内容无法释放。
        var htmlStr = "<div id='cc-"+this._cid+"' class='canvax-c' ";
            htmlStr+= "style='position:relative;width:" + this.width + "px;height:" + this.height +"px;'>";
            htmlStr+= "   <div id='cdc-"+this._cid+"' class='canvax-dom-container' ";
            htmlStr+= "   style='position:absolute;width:" + this.width + "px;height:" + this.height +"px;'>";
            htmlStr+= "   </div>";
            htmlStr+= "</div>";

        //var docfrag = document.createDocumentFragment();
        //docfrag.innerHTML = htmlStr

        this._rootDom.innerHTML = htmlStr;
 
        this.el = Base.getEl("cc-"+this._cid);
 
        this.rootOffset      = Base.getOffset(this.el); //this.el.offset();
 
        this.curPoints       = [ new Point( 0 , 0 ) ] //X,Y 的 point 集合, 在touch下面则为 touch的集合，只是这个touch被添加了对应的x，y
 
        //当前激活的点对应的obj，在touch下可以是个数组,和上面的curPoints对应
        this.curPointsTarget = [];
 
        //每帧 由 心跳 上报的 需要重绘的stages 列表
        this.convertStages = {};
 
        this._heartBeat = false;//心跳，默认为false，即false的时候引擎处于静默状态 true则启动渲染
        
        //设置帧率
        this._speedTime = parseInt(1000/Base.mainFrameRate);
        this._preRenderTime = 0;
 
        //任务列表, 如果_taskList 不为空，那么主引擎就一直跑
        //为 含有__enterFrame 方法 DisplayObject 的对象列表
        //比如Movieclip的__enterFrame方法。
        this._taskList = [];
        
        this._hoverStage = null;
        
        this._isReady = false;
 
        /**
         *交互相关属性
         * */
        //接触canvas
        this._touching = false;
        //正在拖动，前提是_touching=true
        this._draging =false;
 
        //当前的鼠标状态
        this._cursor  = "default";
        
        arguments.callee.superclass.constructor.apply(this, arguments);
        
    };
    
    Base.creatClass(Canvax , DisplayObjectContainer , {
        init : function(){
            this.context.width  = this.width;
            this.context.height = this.height; 
 
            //然后创建一个用于绘制激活shape的 stage到activation
            this._creatHoverStage();
 
            //初始化事件委托到root元素上面
            this._initEvent();
 
            //创建一个如果要用像素检测的时候的容器
            this._createPixelContext();
            
            this._isReady = true;
        },
        resize : function(){
            //重新设置坐标系统 高宽 等。
            this.width    = parseInt(Base.getStyle(this._rootDom , "width" ));
            this.height   = parseInt(Base.getStyle(this._rootDom , "height"));
 
            this.el.style.width  = this.width +"px";
            this.el.style.height = this.height+"px";
 
            this.rootOffset     = Base.getOffset(this.el);
            this._notWatch      = true;
            this.context.width  = this.width;
            this.context.height = this.height;
            this._notWatch      = false;
 
            var me = this;
            var reSizeCanvas    = function(ctx){
                var canvas = ctx.canvas;
                canvas.style.width = me.width + "px";
                canvas.style.height= me.height+ "px";
                canvas.setAttribute("width"  , me.width * Base._devicePixelRatio);
                canvas.setAttribute("height" , me.height* Base._devicePixelRatio);
 
                //如果是swf的话就还要调用这个方法。
                if (ctx.resize) {
                    ctx.resize(me.width , me.height);
                }
            }; 
 
            _.each(this.children , function(s , i){
                s._notWatch     = true;
                s.context.width = me.width;
                s.context.height= me.height;
                reSizeCanvas(s.context2D);
                s._notWatch     = false;
            });

            var canvaxDOMc = Base.getEl("cdc-"+this._cid);
            canvaxDOMc.style.width  = this.width  + "px";
            canvaxDOMc.style.height = this.height + "px";
 
        },
        getDomContainer  : function(){
            return Base.getEl("cdc-"+this._cid);
        },
        getHoverStage : function(){
            return this._hoverStage;
        },
        _creatHoverStage : function(){
            //TODO:创建stage的时候一定要传入width height  两个参数
            this._hoverStage = new Stage( {
                id : "activCanvas"+(new Date()).getTime(),
                context : {
                    width : this.context.width,
                    height: this.context.height
                }
            } );
            //该stage不参与事件检测
            this._hoverStage._eventEnabled = false;
            this.addChild( this._hoverStage );
        },
        /**
         * 获取像素拾取专用的上下文
         * @return {Object} 上下文
        */
        _createPixelContext : function() {
            
            var _pixelCanvas = Base.getEl("_pixelCanvas");
            if(!_pixelCanvas){
                _pixelCanvas = Base._createCanvas("_pixelCanvas" , this.context.width , this.context.height); 
            } else {
                //如果又的话 就不需要在创建了
                return;
            }

            document.body.appendChild( _pixelCanvas );
 
            Base.initElement( _pixelCanvas );
 
            if( Base.canvasSupport() ){
                //canvas的话，哪怕是display:none的页可以用来左像素检测和measureText文本width检测
                _pixelCanvas.style.display    = "none";
            } else {
                //flashCanvas 的话，swf如果display:none了。就做不了measureText 文本宽度 检测了
                _pixelCanvas.style.zIndex     = -1;
                _pixelCanvas.style.position   = "absolute";
                _pixelCanvas.style.left       = - this.context.width  + "px";
                _pixelCanvas.style.top        = - this.context.height + "px";
                _pixelCanvas.style.visibility = "hidden";
            }
            Base._pixelCtx = _pixelCanvas.getContext('2d');
        },
        _initEvent : function(){
            //初始绑定事件，为后续的displayList的事件分发提供入口
            var self = this;
            var _moveStep = 0; //move的时候的频率设置
            if( !(window.Hammer && Hammer.NO_MOUSEEVENTS) ) {
                //依次添加上浏览器的自带事件侦听
                _.each( CanvaxEvent.EVENTS , function( type ){
                    CanvaxEvent.addEvent( self.el , type , function( e ){
                        //如果发现是mousemove的话，要做mousemove的频率控制
                        if( e.type == "mousemove" ){
                            if(_moveStep<1){
                                _moveStep++;
                                return;
                            }
                            _moveStep = 0;
                        }
                        self.__mouseHandler( e );
                    } ); 
                } );
            } 
 
            //触屏系统则引入Hammer
            if( window.Hammer && Hammer.HAS_TOUCHEVENTS ){
                var el = self.el
                self._hammer = Hammer( el ).on( Hammer.EventsTypes , function( e ){
                   
                   //console.log(e.type)
                   //同样的，如果是drag事件，则要频率控制
                   if( e.type == "drag" ){
                        if(_moveStep<1){
                            _moveStep++;
                            return;
                        }
                        _moveStep = 0;
                   }
 
                   if( e.type == "touch" ){
                        //再移动端，每次touch的时候重新计算rootOffset
                        //无奈之举，因为宿主rootOffset不是一直再那个位置。
                        //经常再一些业务场景下面。会被移动了position
                        self.rootOffset = Base.getOffset(self.el);
                   }
 
                   self.__touchHandler( e );
                } );
            }
 
        },
        
        /*
         *触屏事件处理函数
         * */
        __touchHandler : function( e ) {
            var self = this;
 
            //用hamer的方式来阻止执行浏览器默认事件
            if( this.preventDefault ) {
                this._hammer.options.prevent_default = true
            } else {
                this._hammer.options.prevent_default = false
            }
 
            //touch下的curPointsTarget 从touches中来
            //获取canvax坐标系统里面的坐标
            self.curPoints = self.__getCanvaxPointInTouchs( e );
 
            if( e.type == "release" ) {
                if(!self.__dispatchEventInChilds( e , self.curPointsTarget )){
                   //如果当前没有一个target，就把事件派发到canvax上面
                   self.__dispatchEventInChilds( e , [ self ] );
                }
            } else {
                //drag开始
                if( e.type == "dragstart"){
                    //dragstart的时候touch已经准备好了target，curPointsTarget里面只要有一个是有效的
                    //就认为drags开始
                    _.each( self.curPointsTarget , function( child , i ){
                        if( child && child.dragEnabled ){
                           //只要有一个元素就认为正在准备drag了
                           self._draging = true;
                           //然后克隆一个副本到activeStage
                           self._clone2hoverStage( child ,i );
                           //先把本尊给隐藏了
                           child.context.visible = false;
 
                           return false;
                        }
                    } ) 
                }
 
                //dragIng
                if( e.type == "drag"){
                    if( self._draging ){
                        _.each( self.curPointsTarget , function( child , i ){
                            if( child && child.dragEnabled) {
                               self._dragHander( e , child , i);
                            }
                        } )
                    }
                }
 
                //drag结束
                if( e.type == "dragend"){
                    if( self._draging ){
                        _.each( self.curPointsTarget , function( child , i ){
                            if( child && child.dragEnabled) {
                                self._dragEnd( e , child , 0 );
                            }
                        } );
                        self._draging = false;
                    }
                }
 
                var childs = self.__getChildInTouchs( self.curPoints );
                if(self.__dispatchEventInChilds( e , childs )){
                    if( e.type == "touch" ) {
                        self.curPointsTarget = childs;
                    }
                } else {
                    //如果当前没有一个target，就把事件派发到canvax上面
                    self.__dispatchEventInChilds( e , [ self ] );
                };
            }
        },
        /*
         *@param {array} childs 
         * */
        __dispatchEventInChilds : function( e , childs ){
            if( !childs && !("length" in childs) ){
              return false;
            }
            var self = this;
            var hasChild = false;
            _.each( childs , function( child , i){
                if( child ){
                    hasChild = true;
                    var ce         = Base.copyEvent( new CanvaxEvent() , e);
                    ce.target      = ce.currentTarget = child || this;
                    ce.stagePoint  = self.curPoints[i];
                    ce.point       = ce.target.globalToLocal( ce.stagePoint );
                    child.dispatchEvent( ce );
                }
            } );
            return hasChild;
        },
        //从touchs中获取到对应touch , 在上面添加上canvax坐标系统的x，y
        __getCanvaxPointInTouchs : function( e ){
            var self          = this;
            var curTouchs    = [];
            _.each( e.gesture.touches , function( touch ){
               touch.x = touch.pageX - self.rootOffset.left , 
               touch.y = touch.pageY - self.rootOffset.top
               curTouchs.push( touch );
            });
            return curTouchs;
        },
        __getChildInTouchs : function( touchs ){
            var self = this;
            var touchesTarget = [];
            _.each( touchs , function(touch){
                touchesTarget.push( self.getObjectsUnderPoint( touch , 1)[0] );
            } );
            return touchesTarget;
        },
        /*
         *触屏类处理结束
         * */
 
 
        /*
         * 鼠标事件处理函数
         * */
        __mouseHandler : function(e) {
            var self = this;
            self.curPoints = [ new Point( 
                    ( e.pageX || e.x ) - self.rootOffset.left , 
                    ( e.pageY || e.y ) - self.rootOffset.top
                    )];
 
            var curMousePoint  = self.curPoints[0]; 
            var curMouseTarget = self.curPointsTarget[0];
 
            //mousedown的时候 如果 curMouseTarget.dragEnabled 为true。就要开始准备drag了
            if( e.type == "mousedown" ){
               //如果curTarget 的数组为空或者第一个为falsh ，，，
               if( !curMouseTarget ){
                 var obj = self.getObjectsUnderPoint( curMousePoint , 1)[0];
                 if(obj){
                   self.curPointsTarget = [ obj ];
                 }
               }
               curMouseTarget = self.curPointsTarget[0];
               if ( curMouseTarget && self.dragEnabled ){
                   self._touching = true
               }
            }
 
            var contains = document.compareDocumentPosition ? function (parent, child) {
                return !!(parent.compareDocumentPosition(child) & 16);
            } : function (parent, child) {
                return child !== child && (parent.contains ? parent.contains(child) : true);
            }
 
            if( e.type == "mouseup" || (e.type == "mouseout" && !contains(self.el , (e.toElement || e.relatedTarget) )) ){
               if(self._draging == true){
                  //说明刚刚在拖动
                  self._dragEnd( e , curMouseTarget , 0 );
               }
               self._draging  = false;
               self._touching = false;
            }
 
            if( e.type == "mouseout" ){
                if( !contains(self.el , (e.toElement || e.relatedTarget) ) ){
                    self.__getcurPointsTarget(e , curMousePoint);
                }
            } else if( e.type == "mousemove" ){  //|| e.type == "mousedown" ){
                //拖动过程中就不在做其他的mouseover检测，drag优先
                if(self._touching && e.type == "mousemove" && curMouseTarget){
                    //说明正在拖动啊
                    if(!self._draging){
                        //begin drag
                        curMouseTarget.dragBegin && curMouseTarget.dragBegin(e);
                        
                        //先把本尊给隐藏了
                        curMouseTarget.context.visible = false;
                                             
                        //然后克隆一个副本到activeStage
                        self._clone2hoverStage( curMouseTarget , 0 );
                    } else {
                        //drag ing
                        self._dragHander( e , curMouseTarget , 0 );
                    }
                    self._draging = true;
                } else {
                    //常规mousemove检测
                    //move事件中，需要不停的搜索target，这个开销挺大，
                    //后续可以优化，加上和帧率相当的延迟处理
                    self.__getcurPointsTarget( e , curMousePoint );
                }
 
            } else {
                //其他的事件就直接在target上面派发事件
                var child = curMouseTarget;
                if( !child ){
                    child = self;
                };
 
                self.__dispatchEventInChilds( e , [ child ] );
            }
 
            if( this.preventDefault ) {
                CanvaxEvent.stopDefault( e );
            }
 
        },
        __getcurPointsTarget : function(e , point ) {
            var oldObj = this.curPointsTarget[0];
 
            var e = Base.copyEvent( new CanvaxEvent() , e );
 
            if( e.type=="mousemove" && oldObj && oldObj._hoverClass && oldObj.getChildInPoint( point ) ){
                //小优化,鼠标move的时候。计算频率太大，所以。做此优化
                //如果有target存在，而且当前元素正在hoverStage中，而且当前鼠标还在target内,就没必要取检测整个displayList了
                //开发派发常规mousemove事件
                e.target = e.currentTarget = oldObj;
                e.point  = oldObj.globalToLocal( point );
                this._mouseEventDispatch( oldObj , e );
                return;
            }
            
 
            var obj = this.getObjectsUnderPoint( point , 1)[0];
 
            this._cursorHander( obj , oldObj );
 
            if(oldObj && oldObj != obj || e.type=="mouseout") {
                if(!oldObj){
                   return;
                }
                this.curPointsTarget[0] = null;
                e.type = "mouseout";
                e.target = e.currentTarget = oldObj;
                e.point  = oldObj.globalToLocal( point );
                //之所以放在dispatchEvent(e)之前，是因为有可能用户的mouseout处理函数
                //会有修改visible的意愿
                if(!oldObj.context.visible){
                   oldObj.context.visible = true;
                }
                this._mouseEventDispatch( oldObj , e );
            };
 
            if( obj && oldObj != obj ){ //&& obj._hoverable 已经 干掉了
                this.curPointsTarget[0] = obj;
                e.type = "mouseover";
                e.target = e.currentTarget = obj;
                e.point  = obj.globalToLocal( point );
 
                this._mouseEventDispatch( obj , e );
            };
 
            if( e.type == "mousemove" && obj ){
                e.target = e.currentTarget = oldObj;
                e.point  = oldObj.globalToLocal( point );
                this._mouseEventDispatch( oldObj , e );
            };
 
        },
        _mouseEventDispatch : function( obj , e ){
            obj.dispatchEvent( e );
        },
        //克隆一个元素到hover stage中去
        _clone2hoverStage : function( target , i ){
            var self = this;
            
            var _dragDuplicate = self._hoverStage.getChildById( target.id );
            if(!_dragDuplicate){
                _dragDuplicate             = target.clone(true);
                _dragDuplicate._transform  = target.getConcatenatedMatrix();

                /**
                 *TODO: 因为后续可能会有手动添加的 元素到_hoverStage 里面来
                 *比如tips
                 *这类手动添加进来的肯定是因为需要显示在最外层的。在hover元素之上。
                 *所有自动添加的hover元素都默认添加在_hoverStage的最底层
                 **/
                
                self._hoverStage.addChildAt( _dragDuplicate , 0 );
            }
            _dragDuplicate.context.visible = true;
            _dragDuplicate._dragPoint = target.globalToLocal( self.curPoints[ i ] );
        },
        //drag 中 的处理函数
        _dragHander  : function( e , target , i ){
            var self = this;
            var _dragDuplicate = self._hoverStage.getChildById( target.id );
            var gPoint = new Point( self.curPoints[i].x - _dragDuplicate._dragPoint.x , self.curPoints[i].y - _dragDuplicate._dragPoint.y );
            _dragDuplicate.context.x = gPoint.x; 
            _dragDuplicate.context.y = gPoint.y;  
            target.drag && target.drag( e );
 
            //要对应的修改本尊的位置，但是要告诉引擎不要watch这个时候的变化
            var tPoint = gPoint;
            if( target.type != "stage" && target.parent && target.parent.type != "stage" ){
                tPoint = target.parent.globalToLocal( gPoint );
            }
            target._notWatch = true;
            target.context.x = tPoint.x;
            target.context.y = tPoint.y;
            target._notWatch = false;
            //同步完毕本尊的位置
        },
        //drag结束的处理函数
        _dragEnd  : function( e , target , i ){
 
            //_dragDuplicate 复制在_hoverStage 中的副本
            var _dragDuplicate     = this._hoverStage.getChildById( target.id );
 
            target.context.visible = true;
            if( e.type == "mouseout" || e.type == "dragend"){
                _dragDuplicate.destroy();
            }
        },
        _cursorHander    : function( obj , oldObj ){
            if(!obj && !oldObj ){
                this.setCursor("default");
            }
            if(obj && oldObj != obj){
                this.setCursor(obj.context.cursor);
            }
        },
        setCursor : function(cursor) {
            if(this._cursor == cursor){
              //如果两次要设置的鼠标状态是一样的
              return;
            }
            this.el.style.cursor = cursor;
            this._cursor = cursor;
        },
        setFrameRate : function(frameRate) {
           if(Base.mainFrameRate == frameRate) {
               return;
           }
           Base.mainFrameRate = frameRate;
 
           //根据最新的帧率，来计算最新的间隔刷新时间
           this._speedTime = parseInt(1000/Base.mainFrameRate);
        },
        getFrameRate : function(){
           return  Base.mainFrameRate;
        },
 
        //如果引擎处于静默状态的话，就会启动
        __startEnter : function(){
           var self = this;
           if( !self.requestAid ){
               self.requestAid = requestAnimationFrame( _.bind( self.__enterFrame , self) );
           }
        },
        __enterFrame : function(){
            
            var self = this;
            //不管怎么样，__enterFrame执行了就要把
            //requestAid null 掉
            self.requestAid = null;
            Base.now = new Date().getTime();
 
            if( self._heartBeat ){
 
                //console.log(self._speedTime)
                if(( Base.now - self._preRenderTime ) < self._speedTime ){
                    //事件speed不够，下一帧再来
                    self.__startEnter();
                    return;
                }
 
                //开始渲染的事件
                self.fire("beginRender");
 
                _.each(_.values( self.convertStages ) , function(convertStage){
                   convertStage.stage._render( convertStage.stage.context2D );
                });
 
                self._heartBeat = false;
                
                //debugger;
                self.convertStages = {};
 
                //渲染完了，打上最新时间挫
                self._preRenderTime = new Date().getTime();
 
                //渲染结束
                self.fire("afterRender");
            }
            
            //先跑任务队列,因为有可能再具体的hander中会把自己清除掉
            //所以跑任务和下面的length检测分开来
            if(self._taskList.length > 0){
               for(var i=0,l = self._taskList.length ; i < l ; i++ ){
                  var obj = self._taskList[i];
                  if(obj.__enterFrame){
                     obj.__enterFrame();
                  } else {
                     self.__taskList.splice(i-- , 1);
                  }
               }  
            }
            //如果依然还有任务。 就继续enterFrame.
            if(self._taskList.length > 0){
               self.__startEnter();
            }
        },
        _afterAddChild : function( stage , index ){
            var canvas;
            var contextInit = true;
 
            if(!stage.context2D){
                contextInit = false;
                canvas = Base._createCanvas( stage.id , this.context.width , this.context.height );
            } else {
                canvas = stage.context2D.canvas;
            }

            var canvaxDOMc = Base.getEl("cdc-"+this._cid);

            if(this.children.length == 1){
                //this.el.append( canvas );
                this.el.insertBefore( canvas , canvaxDOMc );
            } else if(this.children.length>1) {
                if( index == undefined ) {
                    //如果没有指定位置，那么就放到_hoverStage的下面。
                    this.el.insertBefore( canvas , this._hoverStage.context2D.canvas);
                } else {
                    //如果有指定的位置，那么就指定的位置来
                    if( index >= this.children.length-1 ){
                       //this.el.append( canvas );
                       this.el.insertBefore( canvas , canvaxDOMc );
                    } else {
                       this.el.insertBefore( canvas , this.children[ index ].context2D.canvas );
                    }
                }
            };
 
            if( !contextInit ) {
                Base.initElement( canvas );
            }
            stage.initStage( canvas.getContext("2d") , this.context.width , this.context.height ); 
        },
        _afterDelChild : function(stage){
            this.el.removeChild( stage.context2D.canvas );
        },
        _convertCanvax : function(opt){
            _.each( this.children , function(stage){
                stage.context[opt.name] = opt.value; 
            } );  
        },
        heartBeat : function( opt ){
            //displayList中某个属性改变了
            var self = this;
            //心跳包有两种，一种是某元素的可视属性改变了。一种是children有变动
            //分别对应convertType  为 context  and children
            if (opt.convertType == "context"){
                var stage   = opt.stage;
                var shape   = opt.shape;
                var name    = opt.name;
                var value   = opt.value;
                var preValue=opt.preValue;
 
                if (!self._isReady) {
                    //在还没初始化完毕的情况下，无需做任何处理
                    return;
                }
 
                if( shape.type == "canvax" ){
                    self._convertCanvax(opt)
                } else {
                    if(!self.convertStages[stage.id]){
                        self.convertStages[stage.id]={
                            stage : stage,
                            convertShapes : {}
                        }
                    };
 
                    if(shape){
                        if (!self.convertStages[ stage.id ].convertShapes[ shape.id ]){
                            self.convertStages[ stage.id ].convertShapes[ shape.id ]={
                                shape : shape,
                                convertType : opt.convertType
                            }
                        } else {
                            //如果已经上报了该shape的心跳。
                            return;
                        }
                    }
                }
            }
 
            if (opt.convertType == "children"){
                //元素结构变化，比如addchild removeChild等
                var target = opt.target;
                var stage = opt.src.getStage();
                if( stage || (target.type=="stage") ){
                    //如果操作的目标元素是Stage
                    stage = stage || target;
                    if(!self.convertStages[stage.id]) {
                        self.convertStages[stage.id]={
                            stage : stage ,
                            convertShapes : {}
                        }
                    }
                }
            }
 
            if(!opt.convertType){
                //无条件要求刷新
                var stage = opt.stage;
                if(!self.convertStages[stage.id]) {
                    self.convertStages[stage.id]={
                        stage : stage ,
                        convertShapes : {}
                    }
                }
            }
 
            if (!self._heartBeat){
               //如果发现引擎在静默状态，那么就唤醒引擎
               self._heartBeat = true;
               self.__startEnter();
               //self.requestAid = requestAnimationFrame( _.bind(self.__enterFrame,self) );
            } else {
               //否则智慧继续确认心跳
               self._heartBeat = true;
            }
        }
    } );
 
 
    Canvax.Display = {
        Stage  : Stage,
        Sprite : Sprite,
        Shape  : Shape,
        Point  : Point,
        Text   : Text
    }
 
    Canvax.Event = {
        CanvaxEvent : CanvaxEvent,
        EventBase   : EventBase,
        EventDispatcher : EventDispatcher,
        EventManager : EventManager
    }
 
    return Canvax;
});
