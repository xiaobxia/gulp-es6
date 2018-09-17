const gulp = require('gulp');
const babel = require('gulp-babel');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const glob = require('glob');
const es = require('event-stream');
const rename = require('gulp-rename');

gulp.task('clean', function () {
  return del('./dist');
});

gulp.task('html', function () {
  return gulp.src('./src/**/*.html')
    .pipe(gulp.dest('./dist/'))
});

gulp.task('convertJS', function () {
  return gulp.src('./src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist'))
});

gulp.task("browserify", function (done) {
  glob('./dist/page/**/*.js', function (err, files) {
    if (err) done(err);
    var tasks = files.map(function (entry) {
      return browserify({entries: [entry]})
        .bundle()
        .pipe(source(entry))
        .pipe(rename(entry.substr(entry.lastIndexOf('/') + 1)))
        .pipe(gulp.dest(entry.substr(0, entry.lastIndexOf('/') + 1)));
    });
    es.merge(tasks).on('end', done);
  })
});

gulp.task('js', gulp.series('convertJS', 'browserify'));

gulp.task('watch', function () {
  gulp.watch('./src/**/*.js', gulp.series('convertJS', 'browserify'));
  gulp.watch('./src/**/*.html', gulp.series('html'));
});

gulp.task('default', gulp.series('clean', 'html', 'js', 'watch'));

