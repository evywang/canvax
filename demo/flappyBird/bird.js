define("demo/flappyBird/bird", [
  "canvax/",
  "canvax/animation/Tween",
  "canvax/display/Movieclip",
  "canvax/display/Bitmap"
], function(Canvax, Tween, Movieclip , Bitmap) {
  var S = KISSY;


  var Bird = function(opt) {
    this.width = 83 * opt.scale;
    this.height = 60 * opt.scale;
    this.fly = null; //这个是整个鸟飞行的Interval
    this.readyFly = null; //ready的时候的fly

    //下面两个是鸟上升的时候抬头和下降的时候低头的动画tween对象
    this.fall = null;
    this.up = null;

    //一次跳跃的高度
    this.upH = 50;

    //bird的精灵对象
    this.sp = null;

    this.img = opt.img //self.files.flappyPacker

    this.init();

  }

  Bird.prototype = {
    init: function() {
      var self = this;
      
      self.sp = new Movieclip({
        id: "bird",
        autoPlay: true,
        repeat: true,
        context: {
          width: self.width,
          height: self.height,
          rotateOrigin: {
            x: self.width / 2,
            y: self.height / 2
          }
        }
      });
      self.sp.setFrameRate(8);
      var birdFrams = [
        [675, 1, 83, 60],
        [675, 62, 83, 60],
        [675, 123, 83, 60]
      ];
      _.each(birdFrams, function(fram, i) {
        self.sp.addChild(new Bitmap({
          img: self.img,
          context: {
            width: self.width,
            height: self.height,
            dx: fram[0],
            dy: fram[1],
            dWidth: fram[2],
            dHeight: fram[3]
          }
        }))
      });
    },
    $readyFly: function(birdReadyY) {
      var self = this;
      self.sp.play();
      self.sp.context.rotation = 0;
      var p1 = {
        y: birdReadyY
      };
      var p2 = {
        y: birdReadyY - this.sp.context.height / 2
      }
      var fly1 = new Tween.Tween(p1)
        .to({
          y: (birdReadyY - this.sp.context.height / 2)
        }, 500)
        .onUpdate(function() {
          self.sp.context.y = this.y;
        }).onComplete(function() {
          p1.y = birdReadyY;
          self.readyFly = fly2;
          //console.log("ready")
        });

      var fly2 = new Tween.Tween(p2)
        .to({
          y: birdReadyY
        }, 500)
        .onUpdate(function() {
          self.sp.context.y = this.y;
        }).onComplete(function() {
          p2.y = birdReadyY - self.sp.context.height / 2
          self.readyFly = fly1;
        });


      fly1.chain(fly2);
      fly2.chain(fly1);

      this.readyFly = fly1;

      this.readyFly.start();
    },
    resetBirdSpeed: function(getV, callback) {
      var self = this;
      var now_y = this.sp.context.y;

      if (!!this.fly) {
        clearInterval(this.fly);
        this.fly = null;
      }
      if (!!self.fall) {
        //如果这个时候正在旋转向下
        self.fall.stop();
        self.fall = null;
      };
      //然后如果发现角度没有-20的抬头，就
      if (!self.up && self.sp.context.rotation != -20) {
        //上升阶段，并且角度不为 -30
        var rUp = {
          r: self.sp.context.rotation
        };
        self.up = new Tween.Tween(rUp)
          .to({
            r: -20
          }, 200)
          .onUpdate(function() {
            self.sp.context.rotation = this.r;
          }).onComplete(function() {
            self.up = null;
          }).start();

        //往上飞比较吃力，要加快频率
        self.sp.setFrameRate(20);

      }

      var bird_t = 0;
      this.fly = setInterval(function() {
        bird_t++;

        var y = getV(now_y, self.upH, bird_t, 0.8);

        if (now_y < y && bird_t > 0 && !self.fall) {
          //下降阶段
          var r = {
            r: self.sp.context.rotation
          }
          self.fall = new Tween.Tween(r)
            .to({
              r: 90
            }, 350)
            .onUpdate(function() {
              self.sp.context.rotation = this.r;
            }).start();
        }

        callback(y);

      }, 30);

    },
    stop: function() {
      clearInterval(this.fly);
      this.fly = null;
      this.fall = null;
      this.up = null;
      this.sp.stop();

      //回到8fps的休闲状态
      this.sp.setFrameRate(8);
    }
  }

  return Bird;

});