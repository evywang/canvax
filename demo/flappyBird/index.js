KISSY.add("demo/flappyBird/index" , function( S , Canvax){

    var animate  = function(){
        timer   = requestAnimationFrame( animate ); 
        Canvax.Animation.update();
    };

    var flappyBird = function( el , files ){
        this.el    = el;
        
        //缩放比例
        this.scale = 0.4;

        this.width = S.all(el).width();
        this.height= S.all(el).height();
        this.birdW = 83 * this.scale;
        this.birdH = 60 * this.scale;
        this.birdFall = false;
        this.groundH = 241 * this.scale;

        this.birdReadyY = (this.height - this.groundH)/2 + this.birdH/2;

        this.readyState = true;
        this.readyFly   = null;

        this.files = {
             bg     : files[0],
             flappyPacker : files[1],
             ground : files[2]
        },
        this.canvax= new Canvax({
             el     : this.el
        });
        this.stage = new Canvax.Display.Stage();
        this.bird  = null;

        this.init();
    };

    flappyBird.prototype = {
        init  : function(){
           var self  = this;

           //先创建背景
           var bg   = new Canvax.Display.Bitmap({
              id  : "bg",
              img : this.files.bg,
              context : {
                  width : self.width,
                  height: self.height
              }
           });
           
           //创建滚动的地板
           var ground = new Canvax.Display.Bitmap({
              id : "ground",
              img: this.files.ground,
              context : {
                 y     : this.height - this.groundH,
                 width : self.width,
                 height: this.groundH
              }
           });
           
           
           this.bird = new Canvax.Display.Movieclip({
              id : "bird",
              autoPlay : true,
              repeat   : true,
              context  : {
                 x     : this.width/4*1,
                 y     : this.birdReadyY,
                 width : this.birdW,
                 height: this.birdH
              }
           });

           this.bird.setFrameRate(8);
           var birdFrams = [ [675 , 1 , 83 , 60 ] , [ 675 , 62 , 83 , 60 ] , [ 675 , 123 , 83 , 60 ] ];
           _.each( birdFrams , function( fram , i ){
               self.bird.addChild( new Canvax.Display.Bitmap({
                  img : self.files.flappyPacker ,
                  context : {
                     width  : self.bird.context.width,
                     height : self.bird.context.height,
                     dx     : fram[0],
                     dy     : fram[1],
                     dWidth : fram[2] , 
                     dHeight: fram[3]
                  }
               }) )
           } );

           //get Ready
           
           var readyW = 463 * this.scale;
           var readyH = ( 250 + 130 ) * this.scale
           var $ready = new Canvax.Display.Sprite({
              id        : "ready",
              context   : {
                  width : readyW , 
                  height: readyH ,
                  x     : this.width / 2 - readyW/2,
                  y     : (this.height - this.groundH)/2 - readyH/2
              }
           });

           
           $ready.addChild( new Canvax.Display.Bitmap({
              img     : self.files.flappyPacker,
              context : {
                  width : readyW,
                  height: 130 * this.scale,
                  dx  : 528,
                  dy  : 319,
                  dWidth : 463,
                  dHeight: 129
              } 
           }));
           

           
           $ready.addChild( new Canvax.Display.Bitmap({
              img     : self.files.flappyPacker,
              context : {
                  x   : ( 463 - 290 ) / 2 * this.scale,
                  y   : 130 * this.scale + 10,
                  width : 290 * this.scale,
                  height: 250 * this.scale,
                  dx  : 760,
                  dy  : 0,
                  dWidth : 290,
                  dHeight: 250
              }
           }));
           

           this.stage.addChild( bg );

           this.stage.addChild( ground );

           this.stage.addChild( $ready );

           this.stage.addChild( this.bird );
           this.canvax.addChild( this.stage );

           this.canvax.on("tap" , function(){
               //self.resetBirdSpeed();
               self.gameStart();
           });

           self.$readyShow();

        },
        $readyHide : function(){
           this.stage.getChildById("ready").context.visible = false;
           this.readyState = false;
           
           if( this.readyFly ){
               this.readyFly.stop();
               Canvax.Animation.remove( this.readyFly );
               this.readyFly = null;
           }
        },
        $readyShow : function( alpha ){
           this.stage.getChildById("ready").context.visible = true;
           this.readyState = true;
           //this.$readyFly();
           animate();
        },
        $readyFly  : function(){
            var self = this;
            if( !self.readyState ) {
              return;
            }
            var fly1 = new Canvax.Animation.Tween( { y : this.birdReadyY } )
                .to( { y : (this.birdReadyY - this.birdH/2) }, 500 )
                .onUpdate( function () {
                    self.bird.context.y = this.y;
                } ).onComplete( function(){
                    self.readyFly = fly2
                } );

            self.readyFly = fly1;
            
            var fly2 = new Canvax.Animation.Tween( { y :  this.birdReadyY - this.birdH/2} )
                .to( { y : this.birdReadyY }, 500 )
                .onUpdate( function () {
                    self.bird.context.y = this.y;
                } ).onComplete( function(){
                    self.$readyFly();
                } );
            
            fly1.chain( fly2 ).start();
        },
        gameStart  : function(){
            this.$readyHide();
            this.resetBirdSpeed(); 
        },

        gameOver : function(){
            clearTimeout( this.birdFall );

        },
        tabHand : function(){
            
        },
        resetBirdSpeed : function(){
            var self  = this;
            var now_y = this.bird.context.y;
            
            console.log( now_y )
            if(!!this.birdFall)
                clearTimeout( this.birdFall );
            var bird_t = 0;
            this.birdFall = setInterval( function(){
                bird_t ++;
                var q = -10;
                var y = now_y + Math.pow( ( bird_t + q ) , 2 ) - 100;

                if( y > ( self.height - self.groundH ) ){
                    self.gameOver();
                    return;
                }

                console.log(y)
                self.bird.context.y = y;
            } , 30 );

        }
    }
    return flappyBird;
} , {
    requires : [
      "canvax/"
    ]
})
