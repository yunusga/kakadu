'use strict';

const path = require('path');

// folders names
const folders = {
    dist     : 'dist',
    source   : 'source',
    beml     : 'beml',
    iconizer : 'iconizer'
};

// BEML settings
const beml = {
    src: path.join(folders.source, folders.beml, '**', '*.beml'),
    dest: path.join(folders.dist, folders.beml),
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
    src: path.join(folders.source, folders.iconizer, 'icons','*.svg'),
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
    tech : '<%- tech %>',
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
    serveStatic    : ['./'],
    files          : ['./**/*.js', './**/*.css'],
    proxy          : '<%- proxy %>',
    port           : <%- port %>,
    notify         : true,
    open           : true,
    logLevel       : 'info',
    logPrefix      : 'KAKADU',
    logFileChanges : true,
    snippetOptions : {
        rule: {
            match: /<\/head>/i,
            fn: (snippet, match) => {

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
    rewriteRules: [
        {
            match : /<body[\s\S]*?>/g,
            fn: (req, res, match) => {

                return match;
            }
        },
        {
            match: /What/g,
            fn: function (req, res, match) {
                return 'For';
            }
        }
    ],
    latencyRoutes: [
        // {
        //     route: '/app.css',
        //     latency: 5000,
        //     active: true
        // }
    ]
}

module.exports = {
    kakadu : kakadu,
    bs     : browserSync,
    beml   : beml
}