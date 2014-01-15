KISSY.add("demo/goldenEgg/eggGame" , function( S , Canvax , ImagesLoader , Animation ){
   var eggGame = function( el , urls ){
       this.el     = el ;
       this.urls   = urls;
       this.images = [];
       this.width  = el.width() ;
       this.height = el.height();
       this.init();

       this.hummer = null;//锤子
       this.eggMovie=null;//蛋动画

       this.gameBegin = false; 

       };

   var timer   = null

   var animate = function() {
       timer   = requestAnimationFrame( animate ); //js/RequestAnimationFrame.js needs to be included too.
       Animation.update();
   }

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
               
               imgLoad.on("success" , function( e ){
                  //alert("ok");
                  self.images = e.images;
                  self.draw();
               });

               imgLoad.start(); 
           }
       },
       draw : function(){
           this.triggers = [];
           this.sprites  = [];
           var pOrigins = [[ 97 , 103 ] , [ 303 , 121 ] , [ 513 , 103 ]]; //三个椭圆的原点坐标
           for(var i=0 ; i<3 ; i++ ){
                this.triggers.push( new Canvax.Shapes.Ellipse(
                   {
                     id : "t"+i , 
                     context : {
                         x         : pOrigins[i][0] + 63,
                         y         : pOrigins[i][1] + 83,
                         hr        : 63,
                         vr        : 83,
                         cursor    : "pointer"
                     }
                   }
                ) );

                var self = this;
                this.triggers[i].on("click" , function(event){
                   self.eggClick( this , event);
                });
                this.triggers[i].on("mouseover" , function(event){
                   self.eggHover( this , event);
                });
                this.stage.addChild( this.triggers[i] );

                this.sprites.push( new Canvax.Display.Sprite({
                    context : {
                        x         : pOrigins[i][0],
                        y         : pOrigins[i][1],
                        width     : 126,
                        height    : 166
                    }
                }) );
                
                this.stage.addChild( this.sprites[i] );

           };

           this.hummer = new Canvax.Display.Bitmap({
                id  : "hummer",
                img : this.images[0],
                context : {
                    x : 20,
                    y : -100,
                    width : 150,
                    height: 150,
                    rotateOrigin : {
                       x : 120,
                       y : 100
                    }
                }
           });

           //准备蛋破裂的动画
           this.eggMovie = new Canvax.Display.Movieclip({
               autoPlay:true,
               overPlay:true,
               context : {
                   x         : 0,
                   y         : 0,
                   width     : 126,
                   height    : 166
               }
           });
           this.eggMovie.setFrameRate( 3 );

           //创建三张bitmap
           var sl_l = new Canvax.Display.Bitmap({
                img : this.images[3],
                context : {
                    x : 20,
                    y : 40,
                    width : 35,
                    height: 32
                }
           });

           var sl_m = new Canvax.Display.Bitmap({
                img : this.images[4],
                context : {
                    x : 45,
                    y : 10,
                    width : 40,
                    height: 160
                }
           });

           var sl_r = new Canvax.Display.Bitmap({
                img : this.images[5],
                context : {
                    x : 65,
                    y : 40,
                    width : 56,
                    height: 78
                }
           });

           //光
           var sl_light = new Canvax.Display.Bitmap({
                img : this.images[2],
                context : {
                    x : -70,
                    y : -200,
                    width : 300,
                    height: 300
                }
           });

           //设置第一帧
           this.eggMovie.addChild( sl_l );
           this.eggMovie.addChild( sl_m );
           this.eggMovie.addChild( sl_r );
           this.eggMovie.addChild( sl_light );


           this.canvax.addChild( this.stage );
       },
       eggClick : function( obj , event ){
            if(this.gameBegin){
              return;
            }
            this.gameBegin = true;
            var self = this;
            //开始动画
            var tween1 = new Animation.Tween( { rotation : 0 } )
            .to( { rotation : 20 }, 200 )
            .onUpdate( function () {
                self.hummer.context.rotation = this.rotation;
            } )
            .start();

            var tween2 = new Animation.Tween( { rotation : 2 } )
            .to( { rotation : -20 }, 100 )
            .onUpdate( function () {
                self.hummer.context.rotation = this.rotation;
            } )
            .onComplete( function(){
                cancelAnimationFrame(timer); 
                self.egg_slit( obj , event );
            })
            tween1.chain( tween2 );

            animate();
       },
       //播放蛋破裂动画
       egg_slit : function( obj , e ){
            this.sprites[ _.indexOf( this.triggers , obj ) ].addChild( this.eggMovie ); 
            this.eggMovie.autoPlay = true;
            //this.eggMovie.play();
       },
       eggHover : function( obj , e ){
            if( this.gameBegin ) {
              //游戏已经开始了
              return;
            }
            this.sprites[ _.indexOf( this.triggers , obj ) ].addChild( this.hummer ); 
       },
       reset    : function(){
            this.gameBegin = false;
            
            this.hummer.remove();
            
            this.eggMovie.remove();
            this.eggMovie.gotoAndStop(0);
       }
   }

   return eggGame;
} , {
   requires : [
     "canvax/",
     "canvax/utils/ImagesLoader",
     "canvax/animation/animation"
   ]
})
