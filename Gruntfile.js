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
                 "canvax/**/*.js",
                 "!canvax/library/**/*.js"
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
                 expand: true, cwd: 'canvax/library', src: ['**'], dest: 'build/library'}
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

