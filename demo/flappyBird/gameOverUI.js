KISSY.add("demo/flappyBird/gameOverUI" , function( S , Canvax ){

   var gameOver = {
       own      : null, //指向游戏
       sp       : null,
       init     : function( own ){
          this.own = own ;
          viewWidth = 580 * own.scale;
          viewHeight= viewWidth * 1.1;

          this.sp  = new Canvax.Display.Sprite({
              context : {
               width : viewWidth,
               height: viewHeight,
               x     : (own.width - viewWidth) / 2 ,
               y     : (own.height - viewHeight) / 2
             }
          });
          this.sp.addChild( new Canvax.Display.Bitmap({
             id      : "top",
             img     : own.files.flappyPacker,
             context : {
                 width : 499 * own.scale ,
                 height: 118 * own.scale ,
                 dx    : 8,
                 dy    : 320,
                 dWidth: 499,
                 dHeight: 118,
                 x     : ( viewWidth - 499 * own.scale ) / 2
             }
          }) );

          this.sp.addChild( new Canvax.Display.Sprite({
             id      : "middle",
             context : {
                 y     : this.sp.getChildById("top").context.height,
                 height: 298 * own.scale 
             }
          }) );
          this.sp.getChildById("middle").addChild( new Canvax.Display.Bitmap({
             id      : "middle-bg",
             img     : own.files.flappyPacker,
             context : {
                 width : 580 * own.scale ,
                 height: 298 * own.scale ,
                 dx    : 8,
                 dy    : 1,
                 dWidth: 580,
                 dHeight: 298
             }
          }) );

          var middleContext = this.sp.getChildById("middle").context
          this.sp.addChild( new Canvax.Display.Sprite({
             id      : "bottom",
             context : {
                 width : viewWidth ,
                 y     : middleContext.y + middleContext.height
             }
          }) );
          var replayBtn = new Canvax.Display.Bitmap({
             id      : "replay",
             img     : own.files.flappyPacker,
             context : {
                 width : 272 * own.scale,
                 height: 153 * own.scale,
                 dx    : 459,
                 dy    : 461,
                 dWidth: 272,
                 dHeight: 153
             }
          }) ;
          replayBtn.on("click tap" , function(){
            console.log("replay")
          });
          this.sp.getChildById("bottom").addChild( replayBtn );
          



          return this.sp;
       }
   };

   return gameOver;

} , {
   requires : [
     "canvax/" 
   ]
})

