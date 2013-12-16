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
                 "js/config.js",
                 "js/smeite.js",
                 "js/index.js"
             ],
             dest: "assets/js/default.js"
         }
     },
     uglify: {
         options: {
         },
         dist: {
             files: {
                 'assets/js/default.min.js': 'assets/js/default.js'
             }
         }
     }
  });
 
  //载入concat和uglify插件，分别对于合并和压缩
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
 
  //注册任务
  grunt.registerTask('default', ['concat', 'uglify']);
}

