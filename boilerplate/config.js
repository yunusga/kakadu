const kakadu = {
    tech : 'styl',
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
    cssnano : {}
};

const browserSync = {
    serveStatic    : ['./'],
    files          : ['./**/*.js', './**/*.css'],
    proxy          : null,
    port           : 7200,
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
            match: /What/g,
            fn: function (req, res, match) {
                return 'For';
            }
        }
    ]
}

module.exports = {
    kakadu : kakadu,
    bs     : browserSync
}