var gulp = require('gulp');
var sass = require('gulp-sass');
var config = require('../config');
var autoprefixer = require('gulp-autoprefixer');
var simpleCopyTask = require('../lib/simplyCopy');
var normalizePath = require('../lib/normalize-path');
var gutil = require('gulp-util');
var path = require('path');
var sassGlob = require('gulp-sass-glob');


var flatten = function(arrOfArr) {
    return arrOfArr.reduce(function(flat, more) {
        return flat.concat(more);
    }, []);
};

var AUTOPREFIXER_CONFIG = {
    browsers: ['last 3 versions', 'not ie <= 8'],
    cascade: false
};


gulp.task('styles', ['styles:sass', 'styles:css']);

gulp.task('styles:css', simpleCopyTask('css/**/*'));


gulp.task('styles:components', function() {
    var sourcePath = path.join('.', 'client', 'scss', 'style.scss');
    var outPath = path.join('.', 'debug', 'css');

    var SASS_OPTIONS = {
        errLogToConsole: true,
        outputStyle: 'expanded'
    };

    return gulp
        .src(sourcePath)
        .pipe(sassGlob())
        .pipe(sass(SASS_OPTIONS).on('error', sass.logError))
        .pipe(autoprefixer(AUTOPREFIXER_CONFIG))
        .pipe(gulp.dest(outPath))
        .on('error', gutil.log);
});



gulp.task('styles:sass', function () {
    // Wagtail Sass files include each other across applications,
    // e.g. wagtailimages Sass files will include wagtailadmin/sass/mixins.scss
    // Thus, each app is used as an includePath.
    var includePaths = flatten(config.apps.map(function(app) { return app.scssIncludePaths(); }));

    // Not all files in a directory need to be compiled, so each app defines
    // its own Sass files that need to be compiled.
    var sources = flatten(config.apps.map(function(app) { return app.scssSources(); }));

    var SASS_OPTIONS = {
        errLogToConsole: true,
        includePaths: includePaths,
        outputStyle: 'expanded'
    };

    // e.g. wagtailadmin/scss/core.scss -> wagtailadmin/css/core.css
    // Changing the suffix is done by Sass automatically
    function rewritePath(file) {
        return normalizePath(file.base)
            .replace(
                '/' + config.srcDir + '/',
                '/' + config.destDir + '/'
            )
            .replace('/scss/', '/css/');
    }

    return gulp.src(sources)
        .pipe(sassGlob())
        .pipe(sass(SASS_OPTIONS).on('error', sass.logError))
        .pipe(autoprefixer(AUTOPREFIXER_CONFIG))
        .pipe(gulp.dest(rewritePath))
        .on('error', gutil.log);
});
