define("demo/flappyBird/gameOverUI", [
  "canvax/",
  "canvax/animation/Tween",
  "canvax/display/Bitmap"
], function(Canvax, Tween , Bitmap) {


  var gameOver = {
    own: null, //指向游戏
    sp: null,
    init: function(own) {
      this.own = own;
      var self = this;

      viewWidth = 580 * own.scale;
      viewHeight = viewWidth * 1.1;

      this.sp = new Canvax.Display.Sprite({
        context: {
          width: viewWidth,
          height: viewHeight,
          x: (own.width - viewWidth) / 2,
          y: (own.height - viewHeight) / 2,
          visible: false
        }
      });
      this.sp.addChild(new Bitmap({
        id: "top",
        img: own.files.flappyPacker,
        context: {
          width: 499 * own.scale,
          height: 118 * own.scale,
          dx: 8,
          dy: 320,
          dWidth: 499,
          dHeight: 118,
          x: (viewWidth - 499 * own.scale) / 2,
          y: -10
        }
      }));

      this.sp.addChild(new Canvax.Display.Sprite({
        id: "middle",
        context: {
          y: this.sp.getChildById("top").context.height,
          height: 298 * own.scale
        }
      }));
      this.sp.getChildById("middle").addChild(new Bitmap({
        id: "middle-bg",
        img: own.files.flappyPacker,
        context: {
          width: 580 * own.scale,
          height: 298 * own.scale,
          dx: 8,
          dy: 1,
          dWidth: 580,
          dHeight: 298
        }
      }));

      var middleContext = this.sp.getChildById("middle").context
      this.sp.addChild(new Canvax.Display.Sprite({
        id: "bottom",
        context: {
          width: viewWidth,
          y: middleContext.y + middleContext.height + 20,
          visible: false
        }
      }));
      var replayBtn = new Bitmap({
        id: "replay",
        img: own.files.flappyPacker,
        context: {
          width: 272 * own.scale,
          height: 153 * own.scale,
          dx: 459,
          dy: 461,
          dWidth: 272,
          dHeight: 153
        }
      });
      replayBtn.on("click tap", function(e) {
        self.own.resetToReady();
        e.stopPropagation()
          //console.log("replay")
      });
      this.sp.getChildById("bottom").addChild(replayBtn);

      var rankBtn = new Bitmap({
        id: "rankBtn",
        img: own.files.flappyPacker,
        context: {
          width: 264 * own.scale,
          height: 146 * own.scale,
          dx: 1570,
          dy: 7,
          dWidth: 264,
          dHeight: 146,
          x: replayBtn.context.width + 15,
          y: 2
        }
      });
      rankBtn.on("click tap", function(e) {
        console.log("rankBtn")
        e.stopPropagation();
      });
      this.sp.getChildById("bottom").addChild(rankBtn);
      return this.sp;
    },
    show: function() {
      var self = this;
      this.sp.context.visible = true;

      //ui全部准备完毕
      //overui的出场动画begin
      var topS = this.sp.getChildById("top").context;
      var topY = topS.y;
      var tweenTop1 = new Tween.Tween({
          y: topY
        })
        .to({
          y: topY - 10
        }, 100)
        .onUpdate(function() {
          topS.y = this.y;
        });

      var tweenTop2 = new Tween.Tween({
          y: topY - 10
        })
        .to({
          y: topY
        }, 100)
        .onUpdate(function() {
          topS.y = this.y;
        });

      var middleS = this.sp.getChildById("middle").context;
      var middleY = middleS.y;
      middleS.y = middleY + this.own.height - middleS.$owner.localToGlobal({
        x: 0,
        y: 0
      }).y;
      var tweenMiddle = new Tween.Tween({
          y: middleS.y
        })
        .to({
          y: middleY
        }, 400)
        .onUpdate(function() {
          middleS.y = this.y;
        }).onComplete(function() {
          self.sp.getChildById("bottom").context.visible = true;
        });
      tweenTop1.chain(tweenTop2);
      tweenTop2.chain(tweenMiddle);
      tweenTop1.start();
      //overui的出场动画over

    },
    hide: function() {
      this.sp.context.visible = false;
      this.sp.getChildById("bottom").context.visible = false
    }
  };

  return gameOver;


})