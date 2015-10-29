define("demo/flappyBird/ready", [
  "canvax/",
  "canvax/animation/Tween",
  "canvax/display/Bitmap"
], function(Canvax, Tween, Bitmap) {


  var Ready = {
    sp: null,
    width: 0,
    height: 0,
    init: function(own) {
      this.width = 463 * own.scale;
      this.height = (250 + 130) * own.scale;
      this.sp = new Canvax.Display.Sprite({
        id: "ready",
        context: {
          width: this.width,
          height: this.height,
          x: own.width / 2 - this.width / 2,
          y: (own.height - own.groundH) / 2 - this.height / 2
        }
      });

      this.sp.addChild(new Bitmap({
        img: own.files.flappyPacker,
        context: {
          width: this.width,
          height: 130 * own.scale,
          dx: 528,
          dy: 319,
          dWidth: 463,
          dHeight: 129
        }
      }));

      this.sp.addChild(new Bitmap({
        img: own.files.flappyPacker,
        context: {
          x: (463 - 290) / 2 * own.scale,
          y: 130 * own.scale + 10,
          width: 290 * own.scale,
          height: 250 * own.scale,
          dx: 760,
          dy: 0,
          dWidth: 290,
          dHeight: 250
        }
      }));

      return this;
    },
    hide: function(callback) {
      var self = this;
      new Tween.Tween({
          a: 1
        })
        .to({
          a: 0
        }, 500)
        .onUpdate(function() {
          self.sp.context.globalAlpha = this.a;
        }).start();

      callback();
    },
    show: function(callback) {
      this.sp.context.globalAlpha = 1;
      callback();
    }
  };

  return Ready;


})