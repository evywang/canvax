/**
 * Canvax
 *
 * @author 释剑 (李涛, litao.lt@alibaba-inc.com)
 *
 * 模拟as3 中 的sprite类，目前还只是个简单的容易。
 */


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
