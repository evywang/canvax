KISSY.add("demo/flappyBird/index" , function( S , Canvax , Bird , Ready ){

    var animate  = function(){
        timer   = requestAnimationFrame( animate ); 
        Canvax.Animation.update();
    };

    var flappyBird = function( el , files ){
        this.el    = el;
        
        //缩放比例
        this.scale = 0.4;

        this.files = {
            bg           : files[0],
            flappyPacker : files[1],
            ground       : files[2]
        }

        this.width   = S.all(el).width();
        this.height  = S.all(el).height();

        this.grount  = null;
        this.groundH = 241 * this.scale;

        //初始化一只鸟
        this.bird  = new Bird({
           scale : this.scale,
           img   : this.files.flappyPacker
        });
        this.birdReadyY        = (this.height - this.groundH)/2 + this.bird.sp.context.height / 2;
        this.bird.sp.context.x = this.width/4*1;
        this.bird.sp.context.y = this.birdReadyY
        //鸟组装完毕
        
        this.readyState = true;

        //树
        this.tree = {};
       
        //这里是canvax的常规代码。
        this.canvax = new Canvax({
             el     : this.el
        });
        this.stage  = new Canvax.Display.Stage();
        this.canvax.addChild( this.stage );
        //canvax常规代码结束

        this.init();
    };

    flappyBird.prototype = {
        init  : function(){
           var self  = this;

           //先创建背景
           this.stage.addChild( new Canvax.Display.Bitmap({
              id  : "bg",
              img : this.files.bg,
              context : {
                  width : self.width,
                  height: self.height
              }
           }));

           //创建树
           this.stage.addChild( this.initTrees() );

           //创建永不停歇的地板
           this.creatGround();

           //创建ready界面
           this.stage.addChild( Ready.init( this ).sp );

           //把鸟放进来
           this.stage.addChild( this.bird.sp );
           
           this.canvax.on("tap" , function(){
               if( !self.bird.fly ) {
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
                       if(!self.bird.fly) {
                           self.gameStart();
                       }
                       self.resetBirdSpeed();
                    
                       break;
               }
           })

           Ready.show( function(){
               self.readyState = true;
               self.bird.$readyFly( self.readyState , self.birdReadyY );
               animate();
           } );

     
        },
        /**
         * 创建地板
         */
        creatGround : function(){
           //创建滚动的地板
           var self    = this;
           this.ground = new Canvax.Display.Sprite({
              context  : {
                width  : this.width*2,
                height : this.groundH,
                y      : this.height - this.groundH
              }
           });
           for( var i=0 ; i < 2 ; i++ ){
             this.ground.addChild(new Canvax.Display.Bitmap({
                 img      : this.files.ground,
                 context  : {
                    x     : this.width*i,
                    width : this.width,
                    height: this.groundH
                 }
             }));
           };
           this.stage.addChild( this.ground );
           new Canvax.Animation.Tween( {x:0} )
               .to( { x : -self.width }, 3000 )
               .repeat( Infinity )
               .onUpdate( function () {
                   self.ground.context.x = this.x;
               } ).start();
           //创建滚动的地板结束
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

                var birdHitTree = treeG.x < ( self.bird.sp.context.x + self.bird.sp.context.width ) && treeG.x > ( self.bird.sp.context.x - tree.context.width ); 

                
                //还在屏幕内的。就做碰撞检测
                if( birdHitTree ) {
                    //好，就是这个根柱子了，然后看是否在缺口内
                    if( self.bird.sp.context.y < ( treeG.y + tree.children[0].context.height )
                        || self.bird.sp.context.y > ( treeG.y + tree.children[1].context.y - self.bird.sp.context.height )
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
            var gapH = parseInt( this.bird.upH * ( 1.8 + Math.random()*3/10 ) );//Math.random()*3/10
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
            var self = this;
            Ready.hide( function(){
                self.readyState = false;
                self.bird.readyFly.stop();
            } );
            this.treesTween();
            //this.bird.sp.play();
        },
        gameOver : function(){
            clearTimeout( this.bird.fly );
            //this.bird.sp.context.y = this.height - this.groundH - this.bird.height;

            //停止掉所有在跑的tween动画
            Canvax.Animation.removeAll();
            clearTimeout( this.bird.fly );
            this.bird.fall = null;
            this.bird.up   = null;
            this.bird.sp.stop();
        },
        resetBirdSpeed : function(){
            var self = this;
            this.bird.resetBirdSpeed( self.getV , function( y ){
                if( y > ( self.height - self.groundH - self.bird.sp.context.height ) ){
                    self.gameOver();
                    return;
                }
                self.bird.sp.context.y = y;
            } );
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
      "canvax/",
      "demo/flappyBird/bird",
      "demo/flappyBird/ready"
    ]
})
