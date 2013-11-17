KISSY.add("canvax/event/EventManager" , function(S){
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

            if(typeof listener != "function"){
              //listener必须是个function呐亲
              return false;
            }
           
            if(type == "mouseover"){
               this._hoverable = true;
            }
            if(type == "click"){
               this._clickable = true;
            }

            var map = this._eventMap[type];
            if(!map){
              map = this._eventMap[type] = [];
              map.push(listener);
              this._eventEnabled = true;
              return true;
            }

            if(_.indexOf(map ,listener) == -1) {
              map.push(listener);
              this._eventEnabled = true;
              return true;
            }

            //addEventError
            return false;
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
                    if(map.length == 0) { 
                        delete this._eventMap[type];
                        if(type == "mouseover"){
                            this._hoverable = false;
                        }
                        if(type == "click" ){
                            this._clickable = false;
                        }

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
                if(type=="mouseover"){
                  this._hoverable = false;
                }
                if(type=="click"){
                  this._clickable = false;
                }
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
            this._hoverable = false;
            this._chickable = false;
            this._eventEnabled = false;
        },
        /**
        * 派发事件，调用事件侦听器。
        */
        _dispatchEvent : function(event) {
            var map = this._eventMap[event.type];
            if(!map){
                return false;
            }

            if(!event.target) event.target = this;
            map = map.slice();

            for(var i = 0; i < map.length; i++) {
                var listener = map[i];
                if(typeof(listener) == "function") {
                    listener.call(this, event);
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


},{
    requires:[
        ]
});
