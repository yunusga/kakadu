#!/usr/bin/env node

'use strict';

const path            = require('path');
const fs              = require('fs-extra');
const gulp            = require('gulp');
const util            = require('gulp-util');
const plumber         = require('gulp-plumber');
const replace         = require('gulp-replace');
const rename          = require('gulp-rename');
const gulpIf          = require('gulp-if');
const stylus          = require('gulp-stylus');
const less            = require('gulp-less');
const scss            = require('gulp-sass');
const postcss         = require('gulp-postcss');
const flexBugsFixes   = require('postcss-flexbugs-fixes');
const focus           = require('postcss-focus');
const discardComments = require('postcss-discard-comments');
const inlineSvg       = require('postcss-inline-svg');
const svgo            = require('postcss-svgo');
const groupCssMQ      = require('gulp-group-css-media-queries');
const cssnano         = require('cssnano');
const autoprefixer    = require('autoprefixer');
const runSequence     = require('run-sequence');
const bs              = require('browser-sync').create();
const program         = require('commander');
const chalk           = require('chalk');
const pkg             = require('../package.json');
const getAuthParams   = (params) => params.split('@');

let config = {};


program
    .version(pkg.version)
    .option('-a, --auth [user@password]', `set user@password for authorization`, pkg.name)
    .option('--proxy [url]', 'URL for proxy')
    .option('--port <n>', 'port for proxy', 7200)
    .option('--tech [tech]', 'tech for styles pre-processor (styl, scss, less)', /^(styl|scss|less)$/i, 'styl')
    .option('--nano', 'enable cssnano')
    .parse(process.argv);


/**
 * Проверка правильности установки логина и пароля для авторизации
 */
if (program.auth) {

    bs.use(require('bs-auth'), {
        user: getAuthParams(program.auth)[0],
        pass: getAuthParams(program.auth)[1]
    });
}



const stylePreProcessor = (tech) => {

    switch (tech) {

        case 'styl':
            return stylus({
                'include css': true
            });
        break;

        case 'scss':
            return scss();
        break;

        case 'less':
            return less();
        break;

        default:
            console.log('Styles pre-processor error, no option in config');
    }
}


gulp.task('styles', () => {

    let plugins = [
        discardComments(),
        focus(),
        inlineSvg(),
        svgo(),
        autoprefixer(config.kakadu.autoprefixer),
        flexBugsFixes()
    ];

    /**
     * Включение cssnano для оптимизации стилей проекта
     */
    if (program.nano) {
        plugins.push(cssnano(config.kakadu.cssnano));
    }

    gulp.src('./*.{styl,scss,less}')
        .pipe(plumber())
        .pipe(stylePreProcessor(config.kakadu.tech))
        .pipe(groupCssMQ())
        .pipe(postcss(plugins))
        .pipe(gulp.dest('.'))
        .pipe(bs.stream());
});


gulp.task('proxy-start', (done) => {

    bs.init(config.bs, done);

    gulp.watch('./**/*.{styl,scss,less}', ['styles']);

});


gulp.task('start', (done) => {
    runSequence('proxy-start', 'styles', done);
});


gulp.task('copy-boilerplate', function(done) {

    let stream = gulp.src([path.join(__dirname.replace('bin', ''), 'boilerplate', '**', '*.*')], { dot: true })
        .pipe(replace('<%- proxy %>', program.proxy))
        .pipe(replace('<%- port %>', program.port.toString()))
        .pipe(replace('<%- tech %>', program.tech))
        .pipe(gulpIf('app.styl', rename({
            extname: `.${program.tech}`
        })))
        .pipe(gulp.dest(process.cwd()));

    stream.on('end', function () {
        done();
    });

    stream.on('error', function (err) {
        done(err);
    });
});


const init = () => {

    fs.exists('config.js', (exist) => {

        if (exist) {

            config = require(process.cwd() + '/config.js');

            gulp.start('start');

        } else {

            gulp.start('copy-boilerplate');
        }

    });
}

init();