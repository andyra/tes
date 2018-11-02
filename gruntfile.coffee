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

    uglify:
      public:
        src: "<%= concat.public.dest %>"
        dest: "<%= concat.public.dest %>" # Stomp over the file

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
        tasks: ["jshint", "concat", "uglify"]

    svg_sprite:
      basic:
        expand: true
        cwd: "public/assets/images/sprite"
        src: [ "**/*.svg" ]
        dest: "public/assets/images"
        options:
          mode:
            symbol: true

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
        formatting:
          indent_size: 2
      default:
        files:
          "<%= imgPath %>/sprite.svg": "<%= imgPath %>/sprite/*.svg"

  # Load all Grunt tasks automatically
  require("load-grunt-tasks") grunt

  # Register tasks
  grunt.registerTask "default", ["concat", "uglify", "sass", "autoprefixer", "watch"]
  grunt.registerTask "scripts", ["concat", "uglify"]
  grunt.registerTask "styles", ["sass", "autoprefixer"]
  grunt.registerTask "sprite", ["svgstore", "svgmin"]
