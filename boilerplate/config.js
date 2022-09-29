'use strict';

const path = require('path');
const fs   = require('fs');
const os              = require('os');
const isWin           = os.platform() === 'win32';

// folders names
const folders = {
    dist       : 'dist',
    source     : 'source',
    styles     : 'styles',
    scripts    : 'scripts',
    components : 'components',
    iconizer   : 'iconizer'
};

// global watch
const globalWatch = path.join('*.{js,json,html}');

// CSS
const css = {
    tech : 'styl',
    watch: path.join('.', '**', '*.styl'),
    src : [path.join('.', '*.styl'), (isWin) ? path.join(folders.source, folders.styles, '*.styl').replace(/\\/g,'/') : path.join(folders.source, folders.styles, '*.styl')],
    dest : './'
};

// SCRIPTS
const scripts = {
    es6 : true,
    watch: path.join(folders.source, '**', '*.js'),
    src  : path.join(folders.source, folders.scripts, '**', '*.js'),
    dest : './'
};

// COMPONENTS
const components = {
    src: path.join(folders.source, folders.components, '**', '*.beml'),
    dest: path.join(folders.dist, folders.components),
    rename : {
        extname: '.html'
    },
    opts : {
        elemPrefix: '__',
        modPrefix : '--',
        modDlmtr  : '-'
    }
};

const iconizer = {
    src: path.join(folders.source, folders.iconizer, 'icons', '**', '*.svg'),
    spritePath: path.join(folders.source, folders.iconizer, 'sprite.svg'),
    opts: {
        mode: {
            symbol: { // symbol mode to build the SVG
                dest   : path.join(folders.source, folders.iconizer), // destination folder
                sprite : 'sprite.svg', //sprite name
                example: false // Build sample page
            }
        },
        svg : {
            xmlDeclaration    : false, // strip out the XML attribute
            doctypeDeclaration: false // don't include the !DOCTYPE declaration
        }
    }
};

const kakadu = {
    autoprefixer : {
        browsers : [
            'last 2 version',
            'ie >= 10',
            'Android 2.3',
            'Android >= 4',
            'Chrome >= 20',
            'Firefox >= 24',
            'Explorer >= 8',
            'iOS >= 6',
            'Safari >= 6',
            'Opera >= 12'
        ]
    },
    cssnano : {
        zindex: false
    }
};

const browserSync = {
    serveStatic  : ['./'],
    watchOptions : {
        ignoreInitial : true,
        ignored       : '*.txt'
    },
    proxy        : '<%- proxy %>',
    port         : '<%- port %>',
    notify       : true,
    open         : false,
    logLevel     : 'info',
    logPrefix    : 'KAKADU',
    // Here you can disable/enable each feature individually
    // ghostMode : {
    //     clicks : true,
    //     forms  : true,
    //     scroll : false
    // },
    // Or switch them all off in one go
    ghostMode    : false,
    snippetOptions : {
        rule : {
            match : /<\/head>/i,
            fn : (snippet, match) => {

                // let scriptSnippet = '' +
                //     '<script id="___kakadu___" type="text/javascript">' +
                //         'var ks = document.createElement("script");' +
                //         'ks.setAttribute("id", "___kakadu_script___");' +
                //         'ks.setAttribute("type", "text/javascript");' +
                //         'ks.src = "/app.js";' +
                //         'document.getElementsByTagName("head").item(0).appendChild(ks);' +
                //     '</script>';
                let scriptSnippet = '';

                let cssSnippet = '<link rel="stylesheet" type="text/css" href="/app.css">';

                return cssSnippet + scriptSnippet + snippet + match;
            }
        }
    },
    rewriteRules : [
        // {
        //     match : /<body[\s\S]*?>/g,
        //     fn : (req, res, match) => {

        //         let sprite = fs
        //             .readFileSync(iconizer.spritePath)
        //             .toString()
        //             .replace(/(['"])[\s\S]*?\1/, (match) => `${match} class="app-svg-sprite"`);

        //         return match + sprite;
        //     }
        // },
        {
            match : /What/g,
            fn : function (req, res, match) {
                return 'For';
            }
        }
    ],
    latencyRoutes: [
        // {
        //     route   : '/app.css',
        //     latency : 5000,
        //     active  : true
        // }
    ]
}

module.exports = {
    kakadu      : kakadu,
    bs          : browserSync,
    globalWatch : globalWatch,
    css         : css,
    scripts     : scripts,
    components  : components,
    iconizer    : iconizer
}
