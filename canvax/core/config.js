KISSY.add("canvax/core/config",function(S){
  return {
      //属性改变的change处理函数的决定是否通知引擎重绘的过滤器，attrname在这个里面的就需要重绘，我好啰嗦
      mustDrawATTRS:{
         x : true,
         y : true,
         alpha:true,
         scaleX:true,
         scaleY:true,
         rotation:true,
         visible:true,
         style:true
         
      }
  }
},{
  requires:[]
})
