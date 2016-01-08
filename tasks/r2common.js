/*
 * Copyright (c) 2016 @释剑
 */

module.exports = function(grunt) {
    grunt.registerMultiTask('htmlmin', 'Minify HTML', function() {
        var options = this.options();
        grunt.verbose.writeflags(options, 'Options');

        this.files.forEach(function(file) {
            var html = grunt.file.read(file.src) //
            .replace(/\n+/g, '') //
            .replace(/\r+/g, '') //
            .replace(/>\s{2,}</g, '> <') //
            .replace(/>(.+)</g, function(all, $1) {
                return '>' + $1.replace(/\s{2,}/g, ' ') + '<'
            })
            .replace(/<!\-\-.*?\-\->/g, '') //

            grunt.file.write(file.dest, html)
            grunt.log.writeln('File ' + file.dest + ' created.')

        });

    });
};