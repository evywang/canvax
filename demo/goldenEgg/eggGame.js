KISSY.add("demo/goldenEgg/eggGame" , function( S , Canvax , ImagesLoader ){
   var eggGame = function( el , urls ){
       this.el     = el ;
       this.urls   = urls;
       this.images = [];
       this.width  = el.width() ;
       this.height = el.height();
       this.init();
   };
   
   eggGame.prototype = {
       init : function(){
           var self    = this;
           this.canvax = new Canvax({
               el : this.el
           });
           this.stage  = new Canvax.Display.Stage({
               context : {
                   width : this.width,
                   height: this.height
               }
           });
         

           //加载图片
           if( this.urls.length > 0 ){
               var imgLoad = new ImagesLoader( this.urls );
               
               imgLoad.on("success" , function(){
                  //alert("ok");
                  self.draw();
               });

               imgLoad.start(); 
           }
       },
       draw : function(){
           this.triggers = [];
           var pOrigins = [[ 160 , 186 ] , [ 369 , 204 ] , [ 579 , 186 ]]; //三个椭圆的原点坐标
           for(var i=0 ; i<3 ; i++ ){
                this.triggers.push( new Canvax.Shapes.Ellipse(
                   {
                     id : "t"+i , 
                     context : {
                         x         : pOrigins[i][0],
                         y         : pOrigins[i][1],
                         hr        : 63,
                         vr        : 83,
                         cursor    : "pointer"
                     }
                   }           
                ) );

                this.triggers[i].on("click" , function(event){
                   alert(this.id)
                });

                this.stage.addChild( this.triggers[i] );
           };
           this.canvax.addChild( this.stage );
           
       }
   }

   return eggGame;
} , {
   requires : [
     "canvax/",
     "canvax/utils/ImagesLoader"
   ]
})
