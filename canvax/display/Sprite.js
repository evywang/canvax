KISSY.add("canvax/display/Sprite" , function(S , DisplayObjectContainer,Base){
  var Sprite = function(){
      arguments.callee.superclass.constructor.call(this, name);
      var self = this;
      self.type = "sprite";

  };

  Base.creatClass(Sprite , DisplayObjectContainer , {
      init : function(){
      
      }
  });

  return Sprite;

} , {
  requires:[
    "canvax/display/DisplayObjectContainer",
    "canvax/core/Base"
  ]
})
