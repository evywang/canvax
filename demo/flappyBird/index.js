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

        //这个是整个鸟飞行的Interval
        this.birdFly = false;

        //下面两个是鸟上升的时候抬头和下降的时候低头的动画tween对象
        this.birdFall;
        this.birdUp;

        //一次跳跃的高度
        this.birdUpH = 50


        this.grount  = null;
        this.groundH = 241 * this.scale;

        this.birdReadyY = (this.height - this.groundH)/2 + this.birdH/2;

        this.readyState = true;

        //树
        this.tree = {};

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
           this.ground = new Canvax.Display.Sprite({
              context : {
                width : this.width*2,
                height: this.groundH,
                y     : this.height - this.groundH
              }
           });

           for( var i=0 ; i < 2 ; i++ ){
             this.ground.addChild(new Canvax.Display.Bitmap({
                 img : this.files.ground,
                 context  : {
                    x     : this.width*i,
                    width : this.width,
                    height: this.groundH
                 }
             }))
           }
           
           
           this.bird = new Canvax.Display.Movieclip({
              id : "bird",
              autoPlay : true,
              repeat   : true,
              context  : {
                 x     : this.width/4*1,
                 y     : this.birdReadyY,
                 width : this.birdW,
                 height: this.birdH,
                 rotateOrigin : {
                     x : this.birdW/2,
                     y : this.birdH/2
                 }
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
                     dWidth : fram[2], 
                     dHeight: fram[3]
                  }
               }) )
           } );
           
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

           //创建树
           this.stage.addChild( this.initTrees() );



           this.stage.addChild( this.ground );

           this.stage.addChild( $ready );

           this.stage.addChild( this.bird );
           this.canvax.addChild( this.stage );

           this.canvax.on("tap" , function(){
               if(!self.birdFly) {
                   self.gameStart();
               }
               self.resetBirdSpeed();
           });

           S.one(document).on('keydown',function(e){
               switch(e.keyCode){
                   case 27:
                       // clearTimeout(mainTime);
                       //resetAll();
                       break;
                   case 32:
                       if(!self.birdFly) {
                           self.gameStart();
                       }
                       self.resetBirdSpeed();
                    
                       break;
               }
           })

           self.$readyShow();

           new Canvax.Animation.Tween( {x:0} )
               .to( { x : -self.width }, 3000 )
               .repeat( Infinity )
               .onUpdate( function () {
                   self.ground.context.x = this.x;
               } ).start();

           //this.treesTween();


           
        },
        $readyHide : function(){
           var self = this;
           new Canvax.Animation.Tween( {a : 1} )
               .to( { a : 0 }, 500 )
               .onUpdate( function () {
                   self.stage.getChildById("ready").context.alpha = this.a;
               } ).start();

           this.readyState = false;
           
           this.fly1.stop();
           this.fly2.stop();
        },
        $readyShow : function( alpha ){
           this.stage.getChildById("ready").context.alpha = 1;
           this.readyState = true;
           this.$readyFly();
           animate();
        },
        $readyFly  : function(){
            var self = this;
            if( !self.readyState ) {
              return;
            }
            var p1 = { y : this.birdReadyY };
            var p2 = { y : this.birdReadyY - this.birdH/2 }
            this.fly1 = new Canvax.Animation.Tween( p1 )
                .to( { y : (this.birdReadyY - this.birdH/2) }, 500 )
                .onUpdate( function () {
                    self.bird.context.y = this.y;
                } ).onComplete( function(){
                    p1.y = self.birdReadyY;
                } );

            this.fly2 = new Canvax.Animation.Tween( p2 )
                .to( { y : this.birdReadyY }, 500 )
                .onUpdate( function () {
                    self.bird.context.y = this.y;
                } ).onComplete( function(){
                    p2.y = self.birdReadyY - self.birdH/2 
                } );

            
            this.fly1.chain( this.fly2 );
            this.fly2.chain( this.fly1 );

            this.fly1.start();
        },
        initTrees  : function(){
            this.tree.Sprite = new Canvax.Display.Sprite({
                id : "trees" , 
                context : {
                      x : this.width,
                      y : 0,
                  width : this.width*2
                }
            });

            this.tree.Sprite.addChild( this.creatTree() );

            return this.tree.Sprite;

        },
        treesTween : function(){
            var self = this;
            var t1 = new Canvax.Animation.Tween( { x : self.width } )
               .to( { x : 0 }, 5000 )
               .onUpdate( function () {
                   !self.checkPosition( ) && ( self.tree.Sprite.context.x = this.x );
               } );

            var p = { x : 0 }
            var t2 = new Canvax.Animation.Tween( p )
               .to( { x : -self.width }, 5000 )
               //.repeat( Infinity )
               .onUpdate( function () {
                   !self.checkPosition( ) && ( self.tree.Sprite.context.x = this.x );
               } ).onComplete(function(){
                   p.x = 0;
                   self.tree.Sprite.context.x = 0;
                   _.each( self.tree.Sprite.children , function( tree ){
                       tree.context.x -= self.width;
                   } );
               });

            t1.chain( t2 );
            t2.chain( t2 );
            t1.start();
        },
        checkPosition : function(){
            var self = this;
            var lastTreeInd = this.tree.Sprite.getNumChildren() - 1 ;
            var lastTree    = this.tree.Sprite.getChildAt( lastTreeInd );
            var lastTreeG   = lastTree.localToGlobal();
            
            var hitState = false; //返回的检测状态。默认为
            if( lastTreeG.x < (this.width - lastTree.context.width) ){
                //就在创建一棵树
                this.tree.Sprite.addChild( this.creatTree() );
            }

            _.each( this.tree.Sprite.children , function( tree ){
                var treeG = tree.localToGlobal();
                if( treeG.x < - tree.context.width ){
                    //离开了屏幕就把自己清除
                    tree.destroy();
                    return;
                }

                var birdHitTree = treeG.x < ( self.bird.context.x + self.bird.context.width ) && treeG.x > ( self.bird.context.x - tree.context.width ); 

                
                //还在屏幕内的。就做碰撞检测
                if( birdHitTree ) {
                    //好，就是这个根柱子了，然后看是否在缺口内
                    if( self.bird.context.y < ( treeG.y + tree.children[0].context.height )
                        || self.bird.context.y > ( treeG.y + tree.children[1].context.y - self.bird.context.height )
                        ) {
                          //肯定撞上了
                          //console.log("over");
                          self.gameOver();
                          hitState = true;
                          return false;
                        }
                }
            } );

            return hitState;
        },
        creatTree  : function(){
            var boxH        = this.height - this.groundH;
            var BarWidth    = 130 * this.scale;
            var spaceWidth  = parseInt( BarWidth * ( 1.5 + Math.random()*3/10) );
            var lastTreeInd = this.tree.Sprite.getNumChildren() -1 ;
            var lastTreeX   = lastTreeInd < 0 ? 0 : this.tree.Sprite.getChildAt( lastTreeInd ).context.x;
            var s = new Canvax.Display.Sprite({
                id : "tree" + ( lastTreeInd + 1 ),
                context : {
                    x  : lastTreeX + BarWidth + spaceWidth ,
                    width : BarWidth,
                    height: boxH
                }
            });
            
            //创建缺口位置
            var minBarHeight = BarWidth; //已bar的宽度来作为一个柱子的最小height
            var gapH = parseInt( this.birdUpH * ( 1.8 + Math.random()*3/10 ) );//Math.random()*3/10
            var gapY = minBarHeight + parseInt( Math.random() * (boxH - minBarHeight*2 - gapH) );

            var b1dH = gapY / this.scale;
            s.addChild( new Canvax.Display.Bitmap({
                img : this.files.flappyPacker,
                context : {
                    width : BarWidth,
                    height: gapY,
                    dx    : 160,
                    dy    : 484 + ( 802 - b1dH ),
                    dWidth: 130,
                    dHeight : b1dH
                }
            }) );

            var b2H = boxH - gapY - gapH; //下面的柱子的高度
            s.addChild( new Canvax.Display.Bitmap({
                img : this.files.flappyPacker,
                context : {
                    y     : gapY + gapH,
                    width : BarWidth,
                    height: b2H,
                    dx    : 10,
                    dy    : 480,
                    dWidth: 130,
                    dHeight : b2H / this.scale
                }
            }) );

            return s;
            
        },
        gameStart  : function(){
            this.bird.play();
            this.$readyHide();
            //this.resetBirdSpeed();

            this.treesTween();
            
        },
        gameOver : function(){
            clearTimeout( this.birdFly );
            //this.bird.context.y = this.height - this.groundH - this.birdH;

            //停止掉所有在跑的tween动画
            Canvax.Animation.removeAll();
            clearTimeout( this.birdFly );
            this.birdFall = null;
            this.birdUp = null;
            this.bird.stop();

            //然后把鸟旋转到90度
            //this.bird.context.rotation = 90;

        },
        resetBirdSpeed : function(){
            var self  = this;
            var now_y = this.bird.context.y;
            
            if(!!this.birdFly )
                clearInterval( this.birdFly );
            if(!!self.birdFall ) {
               //如果这个时候正在旋转向下
               self.birdFall.stop();
               self.birdFall = null;
            };
            //然后如果发现角度没有-20的抬头，就
            if( !self.birdUp && self.bird.context.rotation != -20 ){
                //上升阶段，并且角度不为 -30
                var rUp = { r : self.bird.context.rotation };
                self.birdUp   = new Canvax.Animation.Tween( rUp )
                    .to( { r : -20 }, 200 )
                    .onUpdate( function () {
                        self.bird.context.rotation = this.r;
                    } ).onComplete(function(){
                        self.birdUp = null;
                    }).start(); 

                //往上飞比较吃力，要加快频率
                self.bird.setFrameRate( 20 );

            }

            var bird_t = 0;
            this.birdFly = setInterval( function(){
                bird_t ++;
                
                var y = self.getV( now_y , self.birdUpH , bird_t  , 0.8 );

                if( now_y < y && bird_t > 0 && !self.birdFall) {
                    //下降阶段
                    var r = { r : self.bird.context.rotation }
                    self.birdFall = new Canvax.Animation.Tween( r )
                        .to( { r : 90 }, 350 )
                        .onUpdate( function () {
                           self.bird.context.rotation = this.r;
                        } ).start(); 
                }
                
                if( y > ( self.height - self.groundH - self.birdH) ){
                    self.gameOver();
                    return;
                }
                self.bird.context.y = y;
                
            } , 30 );

        },
        /**
         *上抛公式
         *
         */
        getV : function(y, h, t, g){
            g = g || 0.98;
            function fn(v, t){
                return v * t - 0.5 * g * t * t;
            }
            function v0(h){
                return Math.sqrt(2 * h * g);
            }

            return y - fn(v0(h), t);
        }
    }
    return flappyBird;
} , {
    requires : [
      "canvax/"
    ]
})
