#!/usr/bin/env node

'use strict';

const fs           = require('fs');
const gulp         = require('gulp');
const util         = require('gulp-util');
const plumber      = require('gulp-plumber');
const stylus       = require('gulp-stylus');
const less         = require('gulp-less');
const scss         = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const groupMq      = require('gulp-group-css-media-queries');
const runSequence  = require('run-sequence');
const notifier     = require('node-notifier');
const bs           = require('browser-sync').create();
const program      = require('commander');
const jsonfile     = require('jsonfile');
const inquirer     = require('inquirer');
const pkg          = require('./package.json');
const questions    = [
    {
        type: 'input',
        name: 'host',
        message: 'Host for proxy'
    },
    {
        type    : 'input',
        name    : 'port',
        message : 'Server port',
        default : () => {
            return '7200';
        },
        validate: (value) => {

            let check = value.match(/^\d+$/);

            if (check) {
                return true;
            }

            return 'Use only numbers';
        }
    },
    {
        type: 'list',
        name: 'tech',
        message: 'What CSS pre-processor do you need?',
        choices: ['Styl', 'Scss', 'Less'],
        filter: function (val) {
            return val.toLowerCase();
        }
    }
];

let config  = {
    ghostMode: {
        clicks: true,
        forms: true,
        scroll: false
    },
    ui: false
};
let fileName = '';

program
  .version(pkg.version)
  .option('-h, --host', 'Host for proxy')
  .option('-p, --port', 'Proxy port')
  .parse(process.argv);

let create_config = (path, config) => {

    jsonfile.writeFile(path, config, { spaces : 2 }, (err) => {
        if (err) {
            console.error(err);
        } else {

            console.log('Configuration file created');

            fs.writeFileSync(fileName, '// hello kakadu project ' + config.host);

            gulp.start('start');
        }
    });
};

let stylesPreProcessor = function() {

    switch (config.tech) {

        case 'styl':
            return stylus();
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

    gulp.src(fileName)
        .pipe(plumber())
        .pipe(stylesPreProcessor())
        .pipe(autoprefixer({
            browsers: [
                "last 2 version",
                "ie >= 9",
                "Android 2.3",
                "Android >= 4",
                "Chrome >= 20",
                "Firefox >= 24",
                "Explorer >= 8",
                "iOS >= 6",
                "Opera >= 12",
                "Safari >= 6"
            ],
            cascade: true
        }))
        .pipe(groupMq())
        .pipe(gulp.dest('.'))
        .pipe(bs.stream());
});

gulp.task('proxy-start', () => {

    bs.init({

        proxy: config.host,
        serveStatic: ["./"],
        files: "./app.css",
        snippetOptions: {
            rule: {
                match: /<\/head>/i,
                fn: function (snippet, match) {
                    return '<link rel="stylesheet" type="text/css" href="/app.css"/>' + snippet + match;
                }
            }
        },
        port  : config.port,
        ghostMode: {
            clicks: config.ghostMode.clicks ? config.ghostMode.clicks : false,
            forms: config.ghostMode.forms ? config.ghostMode.forms : false,
            scroll: config.ghostMode.scroll ? config.ghostMode.forms : false
        },
        ui : config.ui ? config.ui : false
    });

    gulp.watch(fileName, ['styles']);

});

gulp.task('start', (done) => {

    runSequence('proxy-start', 'styles', done);

});


var kakadu_init = () => {

    fs.exists('kakadu.json', function (exist) {

        if (exist) {

            config = require(process.cwd() + '/kakadu.json');
            fileName = 'app.' + config.tech;
            gulp.start('start');

        } else {

            inquirer.prompt(questions).then((answers) => {

                config.host = answers.host;
                config.port = answers.port;
                config.tech = answers.tech;

                fileName = 'app.' + config.tech;

                create_config('kakadu.json', config);

            });

        }

    });
};

/*!
 * Запуск модуля
 */
kakadu_init();
