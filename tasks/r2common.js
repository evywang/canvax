/*
 * Copyright (c) 2016 @释剑
 */

 'use strict';

module.exports = function(grunt) {
    var fs = require('fs');
    var helper = require("./helper");
    //var esprima = require("esprima");
    //var escodegen = require("escodegen");
    var r2c = require('require2commonjs');

    grunt.registerTask('r2common', 'amd convert to commonjs', function() {
        var opts = this.options();
        var root = opts.root;
        var baseUrl = opts.baseUrl;
        var paths = opts.paths;

        var convertDir = opts.convertDir;

        var tarFiles = helper.getAllFiles(convertDir);
        var viewJsFiles = helper.getTypedFiles(tarFiles, ".js");

        console.log(viewJsFiles.length);
        return

        for (var i = 0; i < viewJsFiles.length; i++) {

            var jsFilePath = viewJsFiles[i];

            //如果该js文件存在
            if (fs.existsSync(jsFilePath)) {
                //计算出来moduleName  

                var moduleName = jsFilePath.replace(convertDir, "").replace(/\/?(.+?)(\.js)?$/, "$1");

                var jsFileContent = fs.readFileSync(jsFilePath, "utf8");

                //先序列化为ast对象( abstract syntax tree )
                var ast = esprima.parse(jsFileContent, {
                    attachComment: true
                });


                completeFullModuleFormat(ast, moduleName);

                //操作完后反序列化为字符串
                var newJsFileContent = escodegen.generate(ast, {
                    comment: true
                });

                fs.writeFileSync(jsFilePath, newJsFileContent, "utf8");


                //console.log( newJsFileContent );

            }
        }

        console.log(r2c( "canvax/index.js" , {
            root : null,
            baseUrl : null,
            paths : null
        }));

    });
};