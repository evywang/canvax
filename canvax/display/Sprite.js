KISSY.add("canvax/display/Sprite" , function(S , DisplayObjectContainer){
  var Sprite = function(){
      arguments.callee.superclass.constructor.call(this, name);
      var self = this;
      self.type = "sprite";

  };

  S.extend(Sprite , DisplayObjectContainer , {
      init : function(){
      
      }
  });

  return Sprite;

} , {
  requires:[
    "canvax/display/DisplayObjectContainer"  
  ]
})
