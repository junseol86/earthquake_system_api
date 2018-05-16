var gulp = require('gulp');
var watch = require('gulp-watch');
var coffee = require('gulp-coffee');

const path = {
  test: './coffee/test/*.coffee',
  control: './coffee/control/*.coffee',
  tool: './coffee/tool/*.coffee'
}

gulp.task('test', function(done) {
  gulp.src(path.test)
    .pipe(coffee({ bare: true }))
    .pipe(gulp.dest('./test/'));
  done();
});

gulp.task('control', function(done) {
  gulp.src(path.control)
    .pipe(coffee({ bare: true }))
    .pipe(gulp.dest('./script/control/'));
  done();
});

gulp.task('tool', function(done) {
  gulp.src(path.tool)
    .pipe(coffee({ bare: true }))
    .pipe(gulp.dest('./script/tool/'));
  done();
});

gulp.task('watch', function(done) {
  gulp.watch(path.test, gulp.series('test'));
  gulp.watch(path.control, gulp.series('control'));
  gulp.watch(path.tool, gulp.series('tool'));
});

gulp.task('default', gulp.parallel('test', 'control', 'tool', 'watch'), function(done) {
  done();
})