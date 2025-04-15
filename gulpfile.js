'use strict';
// generated on 2015-04-04 using generator-gulp-webapp 0.1.0

var gulp = require('gulp');
var fs = require('fs');
var path = require('path');

// load plugins explicitly
var jshint = require('gulp-jshint');
var babel = require('gulp-babel');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var livereload = require('gulp-livereload');
var mainBowerFiles = require('gulp-main-bower-files');
var jip = require('jasmine-istanbul-phantom');

// Check if bower_components directory exists
function bowerComponentsExist() {
  return fs.existsSync(path.join(__dirname, 'bower_components'));
}

// Install bower components
function installBower() {
  console.log('Installing bower components...');
  const bower = require('bower');
  return new Promise((resolve, reject) => {
    bower.commands
      .install()
      .on('end', function () {
        console.log('Bower components installed successfully');
        resolve();
      })
      .on('error', function (error) {
        console.log('Error installing bower components:', error);
        reject(error);
      });
  });
}

// Setup bower components if needed
function setupBower(done) {
  if (!bowerComponentsExist()) {
    console.log('Bower components not found, installing them...');
    return installBower().then(done).catch(done);
  }
  console.log('Bower components already exist');
  done();
}

// Task functions
function scripts() {
  return gulp
    .src('src/**/*.js')
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
        plugins: ['array-includes', 'transform-object-rest-spread'],
      })
    )
    .pipe(jshint())
    .pipe(jshint.reporter(require('jshint-stylish')));
}

function compileToEs5() {
  return gulp
    .src('src/**/*.js')
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
        plugins: ['array-includes', 'transform-object-rest-spread'],
      })
    )
    .pipe(gulp.dest('dist'));
}

function js() {
  return gulp
    .src('src/**/*.js')
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
        plugins: ['array-includes', 'transform-object-rest-spread'],
      })
    )
    .pipe(uglify())
    .pipe(
      rename({
        suffix: '.min',
      })
    )
    .pipe(gulp.dest('dist'));
}

function cleanTask() {
  return gulp.src(['.tmp', 'dist'], { read: false, allowEmpty: true }).pipe(clean());
}

function buildFinal() {
  if (!bowerComponentsExist()) {
    console.log('Bower components directory does not exist. Skipping buildFinal task.');
    return gulp.src('.', { allowEmpty: true });
  }

  return gulp
    .src('./bower_components/isotope/dist/isotope.pkgd.js')
    .pipe(gulp.dest('./examples/libs/isotope'));
}

function connect() {
  var connect = require('connect');
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');
  var app = connect()
    .use(require('connect-livereload')({ port: 35729 }))
    .use(serveStatic('.tmp'))
    .use(serveStatic('examples'))
    .use(serveIndex('examples'));

  return require('http')
    .createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
}

function serve(done) {
  require('opn')('http://localhost:9000');
  done();
}

function bowerFiles() {
  if (!bowerComponentsExist()) {
    console.log('Bower components directory does not exist. Skipping bowerFiles task.');
    return gulp.src('.', { allowEmpty: true });
  }

  return gulp
    .src('./bower.json')
    .pipe(
      mainBowerFiles({
        includeDev: true,
        overrides: {
          'isotope-packery': {
            main: 'packery-mode.pkgd.js',
          },
          vue: {
            main: './dist/vue.js',
          },
        },
      })
    )
    .pipe(gulp.dest('./examples/libs'));
}

function copyJs() {
  return gulp
    .src('src/**/*.js')
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
        plugins: ['array-includes', 'transform-object-rest-spread'],
      })
    )
    .pipe(gulp.dest('./examples/src'));
}

var changedSpec = null;

function test(done) {
  var options = { callback: done, lib: ['bower_components/**/*.js'] };

  if (changedSpec) options.spec = changedSpec;

  jip(options);

  changedSpec = null;
}

function watch() {
  var server = livereload;

  server.listen();
  // watch for changes

  gulp
    .watch(['examples/*.html', 'src/**/*.js', 'examples/*.css', 'examples/**/*.js'])
    .on('change', server.changed);

  gulp.watch('./bower.json').on('change', function () {
    bowerFiles();
  });

  gulp.watch('src/**/*.js', scripts);

  gulp.watch('src/**/*.js').on('change', function () {
    copyJs();
    test();
  });
}

// Define complex tasks
const jsBuild = gulp.series(gulp.parallel(scripts, compileToEs5), js);
const build = gulp.series(setupBower, jsBuild, copyJs, bowerFiles, buildFinal);
const defaultTask = gulp.series(cleanTask, build);
const serveTask = gulp.series(connect, serve);
const watchTask = gulp.series(serveTask, watch);

// Export tasks
exports.scripts = scripts;
exports.compileToEs5 = compileToEs5;
exports.js = jsBuild;
exports.clean = cleanTask;
exports.build = build;
exports.bowerFiles = bowerFiles;
exports.copyJs = copyJs;
exports.test = test;
exports.connect = connect;
exports.serve = serveTask;
exports.watch = watchTask;
exports.default = defaultTask;
