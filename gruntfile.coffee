module.exports = (grunt) ->

  # Project configuration
  grunt.initConfig
    jsPath:       "./site/themes/tes/assets/javascripts"
    cssPath:      "./site/themes/tes/assets/stylesheets"
    imgPath:      "./site/themes/tes/assets/images"

    concat:
      public:
        src: [
          "<%= jsPath %>/vendor/*.js"
          "<%= jsPath %>/shared/*.js"
          "<%= jsPath %>/pages/*.js"
        ]
        dest: "<%= jsPath %>/tes.js"

    # Note: disabling for now since it doesn't support ES6. And I'm confused
    # what that means.
    uglify:
      public:
        src: "<%= concat.public.dest %>"
        dest: "<%= concat.public.dest %>" # Stomp over the file

    # This is turned off for now as well. Was in the Watch chain
    jshint:
      options:
        curly: true
        eqeqeq: true
        immed: true
        latedef: true
        newcap: true
        noarg: true
        sub: true
        undef: true
        unused: true
        boss: true
        eqnull: true
        browser: true
        globals: {}

    autoprefixer:
      options:
        browsers: ["last 2 versions", "> 5%", "Firefox ESR"]
      dist:
        src: [
          "<%= cssPath %>/tes.css"
        ]

    sass:
      options:
        style: "compressed"
        quiet: true
        sourcemap: "auto"
      dist:
        files: [
          "<%= cssPath %>/tes.css": "<%= cssPath %>/tes.scss"
        ]

    watch:
      options:
        livereload: true
      stylesheets:
        files: ["<%= cssPath %>/**/*.scss"]
        tasks: ["sass", "autoprefixer"]
      javascripts:
        files: [
          "<%= jsPath %>/vendor/**/*.js"
          "<%= jsPath %>/shared/**/*.js"
          "<%= jsPath %>/pages/**/*.js"
        ]
        tasks: ["concat"]

    svgmin:
      options:
        plugins: [
          { removeViewBox: false }
          { removeUselessStrokeAndFill: true }
          { cleanupIDs: false }
        ]
      dist:
        files:
          "<%= imgPath %>/sprite.svg" : "<%= imgPath %>/sprite.svg"

    svgstore:
      options:
        cleanup: ['fill']
        formatting:
          indent_size: 2
      default:
        files:
          "<%= imgPath %>/sprite.svg": "<%= imgPath %>/sprite/*.svg"

  # Load all Grunt tasks automatically
  require("load-grunt-tasks") grunt

  # Register tasks
  grunt.registerTask "default", ["concat", "sass", "autoprefixer", "watch"]
  grunt.registerTask "scripts", ["concat"]
  grunt.registerTask "styles", ["sass", "autoprefixer"]
  grunt.registerTask "sprite", ["svgstore", "svgmin"]
