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
const watch           = require('gulp-watch');
const beml            = require('gulp-beml');
const batch           = require('gulp-batch');
const changed         = require('gulp-changed');
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
const CLI             = require('commander');
const chalk           = require('chalk');
const pkg             = require('../package.json');
const getAuthParams   = (params) => typeof params !== 'string' ? [pkg.name, false] : params.split('@');

let config = {};


CLI
    .version(pkg.version)
    .option('-a, --auth [user@password]', `установка логина и пароля для авторизации`)
    .option('--proxy [url]', 'URL для прокси')
    .option('-p, --port <n>', 'порт для прокси', 8300)
    .option('-t, --tech [tech]', 'CSS пре-процессор styl, scss, less (по умолчанию styl)', /^(styl|scss|less)$/i, 'styl')
    .option('-n, --nano', 'включить cssnano')
    .parse(process.argv);


/**
 * Проверка правильности установки логина и пароля для авторизации
 */
bs.use(require('bs-auth'), {
    user: getAuthParams(CLI.auth)[0],
    pass: getAuthParams(CLI.auth)[1],
    use: CLI.auth
});

gulp.task('beml', (done) => {

    let stream = gulp.src(config.beml.src)
        .pipe(plumber())
        .pipe(changed(config.beml.src))
        .pipe(beml(config.beml.opts))
        .pipe(rename(config.beml.rename))
        .pipe(gulp.dest(config.beml.dest));

    stream.on('end', function () {

        bs.reload();

        console.log(`[ ${chalk.green('BEML')} ] task complete`);

        done();
    });

    stream.on('error', function (err) {
        done(err);
    });
});


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
            console.log('Не выбран CSS пре-процессор, проверьте настройки проекта');
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
    if (CLI.nano) {
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

    /**
     * BEML task
     */
    watch(config.beml.src, batch((events, done) => {
        gulp.start('beml', done);
    }));

});


gulp.task('start', (done) => {
    runSequence('proxy-start', 'styles', 'beml', done);
});


gulp.task('copy-boilerplate', function(done) {

    let stream = gulp.src([path.join(__dirname.replace('bin', ''), 'boilerplate', '**', '*.*')], { dot: true })
        .pipe(replace('<%- proxy %>', CLI.proxy))
        .pipe(replace('<%- port %>', CLI.port))
        .pipe(replace('<%- tech %>', CLI.tech.toLowerCase()))
        .pipe(gulpIf('app.styl', rename({
            extname: `.${CLI.tech}`
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

            if (CLI.port) {
                config.bs.port = CLI.port;
            }

            bs.use(require('bs-latency'), {
                routes: config.bs.latencyRoutes || []
            });

            gulp.start('start');

        } else {

            gulp.start('copy-boilerplate');
        }

    });
}

init();