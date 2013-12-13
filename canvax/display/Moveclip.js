/**
 * Canvax
 *
 * @author 释剑 (李涛, litao.lt@alibaba-inc.com)
 *
 * 模拟as3 中 的sprite类，目前还只是个简单的容易。
 */


KISSY.add("canvax/display/Moveclip" , function(S , DisplayObjectContainer,Base){
  var Moveclip = function(){
      arguments.callee.superclass.constructor.call(this, name);
      var self = this;
      self.type = "Moveclip";

  };

  Base.creatClass(Moveclip , DisplayObjectContainer , {
      init : function(){
      
      }
  });

  return Moveclip;

} , {
  requires:[
    "canvax/display/DisplayObjectContainer",
    "canvax/core/Base"
  ]
})
