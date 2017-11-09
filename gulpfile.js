const gulp = require('gulp');

const shell = require('gulp-shell');
const clean = require('gulp-clean');
const cleanTS = require('gulp-clean-compiled-typescript');

const sequence = require('run-sequence');

// @todo, run callback on task finish
const runTask = async (task, cb) => gulp.start(task);

// sequence abuse, await ts compiler
gulp.task('test', done => sequence(['tsc'], () => runTask('test:all')));

// run after compiled, used when watching with tsc
const mochaTask = (task) => shell.task(`mocha --require babel-register ./tests/${task}.test.js || true`);

gulp.task('test:all', mochaTask('*'));

gulp.task('test:api:client', mochaTask('server.api.client'));

gulp.task('test:routers', mochaTask('server.routers'));

// clean before recompile
gulp.task('tsc', ['clean'], shell.task('tsc'));

gulp.task('tsc:w', ['clean'], shell.task('tsc -w'));

gulp.task('clean', ['clean:build', 'clean:ts']);

gulp.task('clean:build', () => gulp.src(['./build'], { read:false }).pipe(clean()));

gulp.task('clean:ts', () => gulp.src(['./src/**/*.ts'], { read: false }).pipe(cleanTS()));