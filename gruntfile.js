module.exports = function(grunt){
  "use strict";

  // ----------------------------------------------------
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    clean: {
      dist: ["dist"]
    },

    uglify: {
      options: {
        preserveComments: false,
        banner: "/*\n" +
          " * tinySelect ( http://mcfizh.github.io/tinySelect/ )\n" +
          " *\n" +
          " * Licensed under MIT license.\n" +
          " *\n" +
          " * @version <%= pkg.version %>\n" +
          " * @author Pekka Harjamäki\n" +
          " */"
      },
      main: {
        src: "src/tinyselect.js",
        dest: "dist/js/tinyselect.min.js"
      }
    },

    copy: {
      css: {
        expand: true,
        cwd: "src/",
        src: "css/*",
        dest: "dist",
        filter: "isFile"
      }
    },
    qunit: {
      all: [ "tests/*.test.html" ]
    }
  });

  // ----------------------------------------------------
  grunt.loadNpmTasks( "grunt-contrib-clean" );
  grunt.loadNpmTasks( "grunt-contrib-uglify" );
  grunt.loadNpmTasks( "grunt-contrib-copy" );
  grunt.loadNpmTasks( "grunt-contrib-qunit" );

  // ----------------------------------------------------
  grunt.registerTask( "default", [ "clean:dist", "uglify:main", "copy:css" ] );
  grunt.registerTask( "test", [ "qunit:all" ] );
};
