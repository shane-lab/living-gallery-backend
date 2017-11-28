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

const mochaRouterTask = (name) => mochaTask(`server.routers.${name}`);

gulp.task('test:routers', mochaRouterTask('*'));

gulp.task('test:routers:api', mochaRouterTask('api'));

gulp.task('test:routes', mochaTask('server.routes'));

gulp.task('test:injection', mochaTask('injection'));

const mochaFactoryTask = (name) => mochaTask(`factories.${name}`);

gulp.task('test:factories', mochaFactoryTask('*'));

gulp.task('test:factories:koarouter', mochaFactoryTask('koarouter'));

// clean before recompile
gulp.task('tsc', ['clean'], shell.task('tsc'));

gulp.task('tsc:w', ['clean'], shell.task('tsc -w'));

gulp.task('clean', ['clean:build', 'clean:ts']);

gulp.task('clean:build', () => gulp.src(['./build'], { read:false }).pipe(clean()));

gulp.task('clean:ts', () => gulp.src(['./src/**/*.ts'], { read: false }).pipe(cleanTS()));