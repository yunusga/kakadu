#!/usr/bin/env node

'use strict';

const path            = require('path');
const fs              = require('fs-extra');
const boxen           = require('boxen');
const clipboardy      = require('clipboardy');
const gulp            = require('gulp');
const util            = require('gulp-util');
const plumber         = require('gulp-plumber');
const replace         = require('gulp-replace');
const rename          = require('gulp-rename');
const gulpIf          = require('gulp-if');
const watch           = require('gulp-watch');
const beml            = require('gulp-beml');
const iconizer        = require('../modules/gulp-iconizer');
const svgSprite       = require('gulp-svg-sprite');
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
const babel           = require('gulp-babel');
const uglify          = require('gulp-uglify');
const jscs            = require('gulp-jscs');
const include         = require('gulp-include');
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
    .option('-p, --port <n>', 'порт для прокси')
    .option('-t, --tech [tech]', 'CSS пре-процессор styl, scss, less (по умолчанию styl)', /^(styl|scss|less)$/i, 'styl')
    .option('-n, --nano', 'включить cssnano')
    .option('-o, --open', 'открывать браузер при старте')
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

    let stream = gulp.src(config.components.src)
        .pipe(plumber())
        .pipe(changed(config.components.dest))
        .pipe(iconizer({ path : config.iconizer.spritePath}))
        .pipe(beml(config.components.opts))
        .pipe(rename(config.components.rename))
        .pipe(gulp.dest(config.components.dest));

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
        plugins.push(discardComments());
        plugins.push(cssnano(config.kakadu.cssnano));
    }

    gulp.src(config.css.src)
        .pipe(plumber())
        .pipe(stylePreProcessor(config.css.tech))
        .pipe(groupCssMQ())
        .pipe(postcss(plugins))
        .pipe(gulp.dest(config.css.dest))
        .pipe(bs.stream());
});


gulp.task('scripts', (done) => {

    let stream = gulp.src(config.scripts.src)
        .pipe(plumber())
        .pipe(include({
            extensions: 'js',
            hardFail: false
        })).on('error', util.log)
        .pipe(babel({
            presets: ['babel-preset-es2015'].map(require.resolve),
            plugins: ['babel-plugin-transform-object-assign'].map(require.resolve),
            babelrc: false
        }))
        .pipe(gulp.dest(config.scripts.dest))

    stream.on('end', function() {

        console.log(`[  ${chalk.green('JS')}  ] task complete`);

        done();
    });

    stream.on('error', function(err) {
        done(err);
    });

});


/**
 * генерация svg спрайта
 */
gulp.task('iconizer', (done) => {

    let stream = gulp.src(config.iconizer.src)
        .pipe(svgSprite(config.iconizer.opts))
        .pipe(gulp.dest('.'));

    stream.on('end', function() {
        done();
    });

    stream.on('error', function(err) {
        done(err);
    });
});


gulp.task('proxy-start', (done) => {

    bs.init(config.bs, () => {

        let urls = bs.getOption('urls'),
            bsAuth = bs.getOption('bsAuth'),
            authString = '';

        if (bsAuth && bsAuth.use) {
            authString = `\n\nuser: ${bsAuth.user}\npass: ${bsAuth.pass}`;
        }

        console.log(boxen(`${chalk.bold.yellow(pkg.name.toUpperCase())} v${pkg.version} is Started!\n\n${chalk.bold.green(urls.get('local'))} сopied to clipboard!${authString}`, {
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'green'
        }));

        clipboardy.writeSync(urls.get('local'));

        done();
    });

    /* SCRIPTS */
    watch(path.join(config.scripts.watch), batch(function (events, done) {
        runSequence('scripts', done);
    }));

    /* CSS */
    watch(config.css.watch, batch((events, done) => {
        gulp.start('styles', done);
    }));

    /**
     * BEML
     */
    watch(config.components.src, batch((events, done) => {
        gulp.start('beml', done);
    }));

    /* ICONIZER */
    watch(path.join(config.iconizer.src), batch(function (events, done) {
        runSequence('iconizer', 'beml', done);
    }));

});


gulp.task('start', (done) => {
    runSequence('proxy-start', 'styles', 'scripts', 'iconizer', 'beml', done);
});

gulp.task('copy-boilerplate', function(done) {

    let stream = gulp.src([path.join(__dirname.replace('bin', ''), 'boilerplate', '**', '*.*')], { dot: true })
        .pipe(replace('<%- proxy %>', CLI.proxy))
        .pipe(replace('<%- port %>', CLI.port || 8300))
        .pipe(replace('<%- tech %>', CLI.tech.toLowerCase()))
        .pipe(gulpIf('*.csstech', rename({
            extname: `.${CLI.tech}`
        })))
        .pipe(gulp.dest(process.cwd()));

    stream.on('end', function () {

        console.log(boxen(`${pkg.name.toUpperCase()} v${pkg.version}\nBoilerplate successfully copied`, {
                padding: 1,
                margin: 1,
                borderStyle: 'double',
                borderColor: 'yellow'
            }));

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

            Object.assign(config.bs, {
                open : CLI.open
            });

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