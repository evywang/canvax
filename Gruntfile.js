module.exports = function(grunt) {
  //配置参数
  var buildPath = "build"
  grunt.initConfig({
     concat: {
         options: {
             separator: ';',
             stripBanners: true
         },
         dist: {
             src: [
                 //animationframe
                 buildPath + "/canvax/animation/AnimationFrame.js",
                 
                 //core
                 buildPath + "/canvax/core/*.js",

                 //CanvaxEvent依赖point
                 //event
                 buildPath + "/canvax/display/Point.js",
                 buildPath + "/canvax/event/CanvaxEvent.js",
                 buildPath + "/canvax/event/EventManager.js",
                 buildPath + "/canvax/event/EventDispatcher.js",
                 buildPath + "/canvax/event/EventHandler.js",
                 
                 //geom
                 buildPath + "/canvax/geom/Math.js",
                 buildPath + "/canvax/geom/HitTestPoint.js",
                 buildPath + "/canvax/geom/Matrix.js",
                 buildPath + "/canvax/geom/Vector.js",
                 buildPath + "/canvax/geom/SmoothSpline.js",

                 //display
                 buildPath + "/canvax/display/DisplayObject.js",
                 buildPath + "/canvax/display/DisplayObjectContainer.js",
                 buildPath + "/canvax/display/Shape.js",
                 buildPath + "/canvax/display/Sprite.js",
                 buildPath + "/canvax/display/Stage.js",
                 buildPath + "/canvax/display/Text.js",

                 //shape中只留下几个最常用的 
                 buildPath + "/canvax/shape/*.js",

                 "!"+ buildPath +"/canvax/shape/Beziercurve.js",
                 "!"+ buildPath +"/canvax/shape/Droplet.js",
                 "!"+ buildPath +"/canvax/shape/Ellipse.js",
                 "!"+ buildPath +"/canvax/shape/Isogon.js",
                 "!"+ buildPath +"/canvax/shape/Shapes.js",


                 buildPath + "/canvax/index.js"
             ],
             dest: buildPath + "/canvax/index.js"
         }
     },
     uglify: {
         options: {
             compress: {
                 drop_console: true
             }
         },
         dist: {
             files: [
               {
                   expand: true,
                   cwd: buildPath,
                   ext: '-min.js',
                   src: ['**/*.js', '!**/*-min.js'],
                   dest: buildPath 
               }
             ]
         }
     },
     copy: {
         main: {
             files: [
               { expand: true , cwd: "canvax/" , src:"**/*" , dest: buildPath + "/canvax/" }
             ]
         }
      },
      clean: { 
          build : {
             src : buildPath
          }
      }
  });
 
  //载入concat和uglify插件，分别对于合并和压缩
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
 
  //注册任务
  grunt.registerTask( 'default' , [ 'clean' , 'copy' , 'concat' , 'uglify' ] );
}

