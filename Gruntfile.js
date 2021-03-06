module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-bumpup');
    grunt.loadNpmTasks('grunt-testem');
    grunt.loadNpmTasks('grunt-subgrunt');

    // Project configuration.
    grunt.initConfig({
        clean: {
            build: ['dist/*.js', 'dist/*.css'],
            test: ['test/dist/*', 'testem*json', 'test-result/*'],
            demo: ['demo/*.js', 'demo/*.css']
        },
        compass: {
            main: {
                options: {
                    config: 'assets/compass_config.rb'
                }
            }
        },
        concat: {
            demo: {
                src: [
                    './node_modules/inativ-x-*/dist/*.css',
                    './dist/inativ-x.css'
                ],
                dest: 'demo/main.css'
            },
            testcss: {
                src: [
                    './node_modules/*/dist/*.css',
                    './dist/inativ-x.css'
                ],
                dest: 'test/dist/main.css'
            },
            testjs: {
                src: [
                    './test/pieces/testStart.js',
                    './test/specs/*.js',
                    './test/pieces/testEnd.js'
                ],
                dest: 'test/dist/testConcat.js'
            }
        },
        copy: {
            dist: {
                files: [
                    {src : ['src/*.js'], dest: 'dist/', flatten: true, expand: true, filter: 'isFile'},
                ]
            }
        },
        connect: {
            demo: {
                options:{
                    port: 3001,
                    keepalive: true,
                    hostname: '*'
                }
            }
        },
        jshint:{
            all: ['src/main.js']
        },
        watch: {
            build: {
                files: ['src/*.js', 'src/*.scss', 'node_modules/inativ-*/dist/*.js', 'node_modules/inativ-*/dist/*.css'],
                tasks: ['build']
            },
            dev: {
                files: ['src/*.js', 'src/*.scss', 'node_modules/inativ-*/src/*.js', 'node_modules/inativ-*/src/*.scss'],
                tasks: ['dev']
            },
            test: {
                files: ['src/*.js', 'src/*.scss', 'test/pieces/testStart.js', 'test/pieces/testEnd.js', 'test/specs/*.js', 'test/TestemSuite.html', 'node_modules/inativ-*/src/*.js', 'node_modules/inativ-*/src/*.scss'],
                tasks: ['buildTest']
            },
            demo: {
                files: ['src/*.js', 'src/*.scss', 'demo/index.html'],
                tasks: ['builddemo']
            },
            options: {
                spawn: false
            }
        },
        browserify: {
            test: {
                files: {
                    'test/dist/main.js': ['src/*.js', 'test/dist/testConcat.js']
                }
            },
            demo: {
                files: {
                    'demo/main.js': ['src/*.js']
                }
            }
        },
        bumpup: {
            options: {
                version: function (old, type) {
                    return old.replace(/([\d])+$/, grunt.option('wc-version'));
                }
            },
            file: 'package.json'
        },
        testem: {
            options: {
                'launch_in_ci': [
                    'firefox'
                ]
            },
            main: {
                src: [ 'test/TestemSuite.html' ],
                dest: 'test-result/testem-ci.tap'
            }
        },
        subgrunt: {
            target1: {
                options: {
                    npmClean: false,
                    npmInstall: false
                },
                projects: {
                    'node_modules/inativ-x-datagrid': ['build']
                }
            }
        },
        mkdir: {
            'test-result': {
                options: {
                    create: ['test-result']
                }
            }
        }
    });

    grunt.registerTask('launchDemo', function () {
        grunt.task.run('connect');
        grunt.log.writeln("----------");
        grunt.log.writeln(">>> demo ready, please visit http://localhost:3001/demo/");
        grunt.log.writeln("----------");
    });

    grunt.registerTask('build', ['clean:build', 'compass', 'copy:dist']);
    
    grunt.registerTask('builddemo', ['build', 'clean:demo', 'concat:demo', 'browserify:demo']);
    grunt.registerTask('demo', ['builddemo', 'launchDemo']);

    grunt.registerTask('buildTest', ['build', 'clean:test', 'concat:testcss', 'concat:testjs', 'browserify:test']);
    grunt.registerTask('test', ['buildTest', 'mkdir:test-result', 'testem']);

    grunt.registerTask('dist', ['test','clean:build','copy:dist','bumpup']);

    grunt.registerTask('dev', ['subgrunt', 'build', 'watch']);
    grunt.registerTask('watchdemo', ['builddemo', 'watch:demo']);
    grunt.registerTask('default', ['buildTest', 'watch:test']);
};
