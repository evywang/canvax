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
                 buildPath + "/canvax/**/*.js",
                 "!"+ buildPath +"/canvax/library/**/*.js",
                 "!"+ buildPath +"/canvax/animation/Tween.js",
                 "!"+ buildPath +"/canvax/shape/**/*.js",
                 "!"+ buildPath +"/canvax/utils/**/*.js",
                 "!"+ buildPath +"/canvax/geom/SmoothSpline.js",
                 "!"+ buildPath +"/canvax/geom/Vector.js"
             ],
             dest: buildPath + "/canvax/index.js"
         }
     },
     uglify: {
         options: {

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

