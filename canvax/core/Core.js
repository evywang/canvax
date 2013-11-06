KISSY.add("canvax/core/Core" , function(S , Base ){


    /**
     * HitTestPoint 检测专用代码 begin
     **/
    var _canvas;
    var _pixelCtx;
    
     /**
     * HitTestPoint 检测专用代码 end
     **/
    var classTypes = {};
    "Boolean Number String Function Array Date RegExp Object Error".replace(/[^, ]+/g, function(name) {
        classTypes["[object " + name + "]"] = name.toLowerCase()
    });




    var Core = {
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
            newDom.style.width = _width + 'px';
            newDom.style.height = _height + 'px';
            //newDom.setAttribute('width', _width );
            //newDom.setAttribute('height', _height );
            newDom.setAttribute('width', _width * this._devicePixelRatio);
            newDom.setAttribute('height', _height * this._devicePixelRatio);


            newDom.setAttribute('id', id);
            return newDom;
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


        getContext : function(_ctx) {
            if (!_ctx) {
                if (window.G_vmlCanvasManager) {
                    var _div = document.createElement('div');
                    _div.style.position = 'absolute';
                    _div.style.top = '-1000px';
                    document.body.appendChild(_div);

                    _ctx = G_vmlCanvasManager.initElement(_div)
                        .getContext('2d');
                } else {
                    _ctx = document.createElement('canvas').getContext('2d');
                }
            }
            return _ctx;
        },

        _UID  : 0, //该值为向上的自增长整数值
        getUID:function(){
            return this._UID++;
        },
        createId : function(name) {
            //if end with a digit, then append an underscore before appending
            var charCode = name.charCodeAt(name.length - 1);
            if (charCode >= 48 && charCode <= 57) name += "_";
            return name + Core.getUID();
        },
        getType : function(obj) { //取得类型
            if (obj == null) {
                return String(obj)
            }
            // 早期的webkit内核浏览器实现了已废弃的ecma262v4标准，可以将正则字面量当作函数使用，因此typeof在判定正则时会返回function
            return typeof obj === "object" || typeof obj === "function" ?
                classTypes[Object.prototype.toString.call(obj)] || "object" :
                typeof obj
        }

    }

    return Core

},{
    requires : [
        "base"
        ]
})
