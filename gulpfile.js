const gulp = require('gulp');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const child = require('child_process');
const gutil = require('gulp-util');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const merge = require('merge-stream');
const order = require('gulp-order');




//const cssFiles = './css/**/*.?(s)css';
const cssFiles = './css/**/*.scss'


  gulp.task('css', () => {
    gulp.src('./css/main.scss')
      .pipe(plumber({
        errorHandler: reportError
      }))
      .pipe(sass())
      .pipe(concat('all.css'))
      .pipe(gulp.dest('assets'));
  });

  // const jsFiles = './js/**/*.js',
  //     jsDest = 'dist/scripts';
  const jsFiles = [
      'js/snap.svg-min.js',
      'js/three.min.js',
    	'js/OBJLoader.min.js',
      'js/waterShader.js',
    	'js/geoJelly.js',
    	'js/homepage.js',
    	'js/blimp.js',
    	'js/gallery2.js',
    	'js/jquery-ajax.min.js'
    ];
  const jsDest = 'dist/scripts';


  gulp.task('scripts', function() {
      gulp.src(jsFiles)
      // return merge(
      //     gulp.src('./js/snap.svg-min.js'),
      //     gulp.src('./js/three.min.js'),
      //   	gulp.src('./js/OBJLoader.min.js'),
      //     gulp.src('./js/waterShader.js'),
      //   	gulp.src('./js/geoJelly.js'),
      //   	gulp.src('./js/homepage.js'),
      //   	gulp.src('./js/blimp.js'),
      //   	gulp.src('./js/gallery2.js'),
      //   	gulp.src('./js/sendmail.js')
      //
      // )
      .pipe(order([
        'js/snap.svg-min.js',
        'js/three.min.js',
        'js/OBJLoader.min.js',
        'js/waterShader.js',
        'js/geoJelly.js',
        'js/homepage.js',
        'js/blimp.js',
        'js/gallery2.js',
        'js/sendmail.js'
           ], { base: './' }))
      .pipe(concat('scripts.js'))
      .pipe(gulp.dest(jsDest))
      .pipe(rename('scripts.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest(jsDest));
  });

  // gulp.task('scripts', function() {
  //     return gulp.src(jsFiles)
  //         .pipe(concat('scripts.js'))
  //         .pipe(gulp.dest(jsDest))
  //         .pipe(rename('scripts.min.js'))
  //         .pipe(uglify())
  //         .pipe(gulp.dest(jsDest));
  // });

gulp.task('compress', function() {
 gulp.src('./js/*.js')
   .pipe(minify({
       ext:{
           src:'-debug.js',
           min:'.min.js'
       },
       //exclude: ['tasks'],
       //ignoreFiles: ['.combo.js', '-min.js']
   }))
   .pipe(gulp.dest('dist'))
});


gulp.task('jekyll', () => {
  const jekyll = child.spawn('jekyll', ['build',
    '--watch',
    '--incremental',
    '--drafts'
  ]);

  const jekyllLogger = (buffer) => {
    buffer.toString()
      .split(/\n/)
      .forEach((message) => gutil.log('Jekyll: ' + message));
  };

  jekyll.stdout.on('data', jekyllLogger);
  jekyll.stderr.on('data', jekyllLogger);
});



const browserSync = require('browser-sync').create();

const siteRoot = '_site';

gulp.task('serve', () => {
  browserSync.init({
    files: [siteRoot + '/**'],
    port: 3000,
    server: {
      baseDir: siteRoot
    }
  });
  gulp.watch(cssFiles, ['css'])
  gulp.watch(jsFiles, ['scripts'])

});


gulp.task('default', ['css', 'scripts', 'jekyll', 'serve'])

function reportError(error) {
    notify({
        title: 'Gulp Task Error',
        message: 'Check the console.'
    }).write(error);

    console.log(error.toString());

    this.emit('end');
}
