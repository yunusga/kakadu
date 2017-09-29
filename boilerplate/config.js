'use strict';

const path = require('path');

// folders names
const folders = {
    dist       : 'dist',
    source     : 'source',
    styles     : 'styles',
    scripts    : 'scripts',
    components : 'components',
    iconizer   : 'iconizer'
};

// CSS
const css = {
    tech : '<%- tech %>',
    watch: path.join('.', '**', '*.{styl,scss,less}'),
    src  : [
        path.join('.', '*.{styl,scss,less}'),
        path.join(folders.source, folders.styles, '*.{styl,scss,less}'),
    ],
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
    serveStatic    : ['./'],
    files          : ['./**/*.js', './**/*.css'],
    proxy          : '<%- proxy %>',
    port           : <%- port %>,
    notify         : true,
    open           : false,
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
            match: /<\/head>/g,
            fn: function (req, res, match) {
                var metaSet ='\
                            <meta name="format-detection" content="telephone=no">\n\
                            <meta name="theme-color" content="#fff">\n\
                            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">\n\
                            <!-- Disable link highlighting on IE 10 on Windows Phone (https://blogs.windows.com/buildingapps/2012/11/15/adapting-your-webkit-optimized-site-for-internet-explorer-10/) -->\n\
                            <meta name="msapplication-tap-highlight" content="no">\n\
                            <!-- Add to homescreen -->\n\
                            <meta name="mobile-web-app-capable" content="yes">\n\
                            <meta name="apple-mobile-web-app-capable" content="yes">\n\
                            <meta name="MobileOptimized" content="320">\n\
                            <meta name="HandheldFriendly" content="True">\n\
                ';
                return metaSet + match;
            }
        },
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
    kakadu     : kakadu,
    bs         : browserSync,
    css        : css,
    scripts    : scripts,
    components : components,
    iconizer   : iconizer
}
