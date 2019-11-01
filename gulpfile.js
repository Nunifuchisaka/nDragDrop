var gulp = require('gulp'),
    cache  = require('gulp-cached'),
    plumber = require('gulp-plumber'),
    browserSync = require('browser-sync').create(),
    sass = require('gulp-sass'),
    cleanCSS = require('gulp-clean-css'),
    autoprefixer = require('gulp-autoprefixer'),
    gcmq = require('gulp-group-css-media-queries'),
    notify  = require('gulp-notify'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require('gulp-rename');


/*
## browser sync
*/

gulp.task('browser-sync', function(done){
  browserSync.init({
    proxy: 'n-drag-drop.lcl:8888'
  });
  done();
});

gulp.task('bs-reload', function(done){
  browserSync.reload();
  done();
});



/*
## StyleSheet
*/

gulp.task('sass', function(){
  return gulp.src('src/scss/**/*.scss')
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(sass())
    .pipe(gcmq())
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(gulp.dest('dst'));
});



/*
## JavaScript
*/

gulp.task('js', function(){
  return gulp.src([
      'src/js/110_header.js',
      'src/js/410_View.js',
      'src/js/990_footer.js'
    ])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('jquery.nDragDrop.js'))
    .pipe(gulp.dest('dst'))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dst'));
    //.pipe(sourcemaps.write())
    //.pipe(gulp.dest('dst'));
});



/*
## watch
*/

gulp.task('watch', function(done){
  
  gulp.watch('demo/**/*.html', gulp.task('bs-reload'));
  gulp.watch('demo/**/*.php', gulp.task('bs-reload'));
  gulp.watch('demo/**/*.css', gulp.task('bs-reload'));
  gulp.watch('demo/**/*.js', gulp.task('bs-reload'));
  
  gulp.watch('src/scss/**/*.scss', gulp.series('sass'));
  gulp.watch('src/js/**/*.js', gulp.series('js'));
  
  done();
});

gulp.task('default', gulp.series('browser-sync', 'watch', function(done){
  done();
}));
