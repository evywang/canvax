KISSY.add("canvax/event/EventDispatcher" , function(S , EventManager){

  var EventDispatcher = function(){

      arguments.callee.superclass.constructor.call(this, name);

  };

  S.extend(EventDispatcher , EventManager , {
         
      on : function(type, listener){
        this._addEventListener( type, listener);
      },
      addEventListener:function(type, listener){
        this._addEventListener( type, listener);
      },
      un : function(type,listener){
        this._removeEventListener( type, listener);
      },
      removeEventListener:function(type,listener){
        this._removeEventListener( type, listener);
      },
      removeEventListenerByType:function(type){
        this._removeEventListenerByType( type);
      },
      removeAllEventListeners:function(){
        this._removeAllEventListeners();
      },
      fire : function(event){
        this._dispatchEvent(event);
      },
      dispatchEvent:function(event){
        this._dispatchEvent(event);
      },
      hasEvent:function(type){
        this._hasEventListener(type);
      },
      hasEventListener:function(type){
        this._hasEventListener(type);
      },
      hover : function( overFun , outFun ){
        this.on("mouseover" , overFun);
        this.on("mouseout"  , outFun );
      },
      once : function(type, listener){
        this.on(type , function(){
            listener.apply(this , arguments);
            this.un(type , arguments.callee);
        })
      }
  });

  return EventDispatcher;

},{
  requires:[
    "canvax/event/EventManager"
  ]
});
