#!/usr/bin/env node

'use strict';

const path            = require('path');
const fs              = require('fs-extra');
const gulp            = require('gulp');
const util            = require('gulp-util');
const plumber         = require('gulp-plumber');
const stylus          = require('gulp-stylus');
const less            = require('gulp-less');
const scss            = require('gulp-sass');
const basicAuth       = require('basic-auth');
const postcss         = require('gulp-postcss');
const flexBugsFixes   = require('postcss-flexbugs-fixes');
const focus           = require('postcss-focus');
const discardComments = require('postcss-discard-comments');
const inlineSvg       = require('postcss-inline-svg');
const svgo            = require('postcss-svgo');
const mqPacker        = require('css-mqpacker');
const groupCssMQ      = require('gulp-group-css-media-queries');
const cssnano         = require('cssnano');
const autoprefixer    = require('autoprefixer');
const runSequence     = require('run-sequence');
const bs              = require('browser-sync').create();
const program         = require('commander');
const chalk           = require('chalk');
const pkg             = require('../package.json');


let config = {};


program
    .version(pkg.version)
    .option('-a, --auth', 'enable basic authentication')
    .option('-u, --user [username]', 'set user')
    .option('-p, --pass [password]', 'set password')
    .parse(process.argv);


if (program.auth) {

    if (!program.user || !program.pass) {
        util.log(`You are running ${chalk.bold.yellow('kakadu')} with basic auth but did not set the USER ${chalk.bold.yellow('-u')} and PASSWORD ${chalk.bold.yellow('-p')} with cli args.`);
        process.exit(1);
    }
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

            let authMiddleware = (req, res, next) => {
                    
                let auth = basicAuth(req);

                if (auth && auth.name === program.user && auth.pass === program.pass) {
                    next();
                } else {
                    res.statusCode = 401;
                    res.setHeader('WWW-Authenticate', 'Basic realm="KAKADU Static Server"');
                    res.end('Access denied');
                }
            },
            middlewares = [];

            if (program.auth) {
                middlewares.push(authMiddleware);
            }

            config = require(process.cwd() + '/config.js');

            if (config.bs.hasOwnProperty('middleware')) {
                middlewares.push(config.bs.middleware);
            }

            config.bs.middleware = middlewares;

            gulp.start('start');

        } else {

            gulp.start('copy-boilerplate');
        }
        
    });
}

init();