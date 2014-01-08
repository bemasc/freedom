module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      src: ['src/libs/*.js', 'src/*.js', 'src/proxy/*.js', 'interface/*.js',
            'providers/core.unprivileged.js', 'providers/echo.unprivileged.js',
            'spec/util.js'],
      test: ['spec/*Spec.js', 'spec/providers/*Spec.js']
    },
    jasmine: {
      freedom: {
        src: '<%= meta.src %>',
        options: {
          specs: '<%= meta.test %>'
        }
      },
      coverage: {
        src: '<%= meta.src %>',
        options: {
          specs: '<%= meta.test %>',
          template: require('grunt-template-jasmine-istanbul'),
          templateOptions: {
            coverage: 'tools/lcov.info',
            report: [{type: 'lcovonly'}]
          }
        }
      },
    },
    jshint: {
      beforeconcat: [
        'src/libs/*.js',
        'src/*.js',
        'src/proxy/*.js',
        'providers/*.js',
        'interface/*.js',
      ],
      afterconcat: ['freedom.js'],
      providers: [
        'providers/storage/*.js',
        'providers/social/websocket-server/*.js',
      ],
      demo: [
        'demo/**/*.js'
      ],
      options: {
        '-W069': true
      }
    },
    concat: {
      dist: {
        options: {
          process: function(src) {
            return src.replace(/\/\*jslint/g,'/*');
          }
        },
        src: [
          'src/libs/*.js',
          'src/util/preamble.js',
          'src/*.js',
          'src/proxy/*.js',
          'providers/*.js',
          'interface/*.js',
          'src/util/postamble.js'
        ],
        dest: 'freedom.js'
      }
    },
    uglify: {
      options: {
        mangle: { except: ['global'] }
      },
      freedom: {
        files: {
          'freedom.min.js': ['freedom.js']
        }
      }
    },
    clean: ['freedom.js', 'freedom.min.js'],
    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        options: {
          paths: 'src/',
          outdir: 'tools/doc/'
        }
      }
    },
    coveralls: {
      report: {
        src: 'tools/lcov.info'
      }
    }
  });

  // Load tasks.
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-coveralls');

  // Custom Task for Chrome Test Runner
  grunt.registerTask('chromeTestRunner', "Runs tests in a Chrome App", function(){
    grunt.util.spawn({
      cmd: 'bash',
      args: ['tools/chromeTestRunner.sh'],
    }, function done(error, result, code) {
      grunt.log.ok('Failed to execute shell script:'+
        "\n\t"+error+
        "\n\tResult: "+result+
        "\n\tCode: "+code);
    });
  });

  // Default tasks.
  grunt.registerTask('freedom', [
    'jshint:beforeconcat',
    'concat',
    'jasmine:freedom',
    'jshint:afterconcat',
    'jshint:providers',
    'jshint:demo',
    'uglify'
  ]);
  grunt.registerTask('coverage', [
    'concat',
    'jasmine:coverage',
    'coveralls:report'
  ]);
  grunt.registerTask('default', ['freedom']);
};
