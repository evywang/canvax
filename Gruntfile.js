module.exports = function(grunt) {
  //配置参数
  grunt.initConfig({
     concat: {
         options: {
             separator: ';',
             stripBanners: true
         },
         dist: {
             src: [
                 "canvax/**/*.js"
             ],
             dest: "build/index.js"
         }
     },
     uglify: {
         options: {
         },
         dist: {
             files: {
                 'build/index-min.js': 'build/index.js'
             }
         }
     },
     copy: {
         main: {
             files: [
             {
                 expand: true, src: ['library/underscore.js' , 'library/excanvas.js' , 'library/color.js'], dest: 'build/'
             },
             {
                 expand: true, cwd: 'library/flashCanvas', src: ['**'], dest: 'build/library/flashCanvas'}
             ]
         }
      }
  });
 
  //载入concat和uglify插件，分别对于合并和压缩
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
 
  //注册任务
  grunt.registerTask('default', ['concat', 'uglify' , 'copy']);
}

