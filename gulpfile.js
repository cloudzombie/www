'use strict';

const _ = require('lodash');
const argv = require('yargs').argv;
const babel = require('gulp-babel');
const cssmin = require('gulp-cssmin');
const data = require('gulp-data');
const fs = require('fs');
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const ignore = require('gulp-ignore');
const jade = require('gulp-jade');
const jadelint = require('gulp-jadelint');
const mocha = require('gulp-mocha');
const path = require('path');
const rename = require('gulp-rename');
const rimraf = require('rimraf');
const sass = require('gulp-sass');
const solc = require('solc');
const through = require('through-gulp');
const uglify = require('gulp-uglify');

const UGLIFY = argv.minimize;
const compiled = {};

const errcb = function(err) {
  console.error(err.stack || err.message || err);
  this.emit('end');
};

const solcPipe = function(basedir) {
  return through(
    function(file, encoding, callback) {
      const importrx = /import "([\_\-\.\/a-zA-Z0-9]*)";/g;
      const sources = {};
      const filedata = file.contents.toString();
      sources[file.relative] = filedata;

      let match = importrx.exec(filedata);

      while (match) {
        sources[match[1]] = fs.readFileSync(path.join(basedir, match[1])).toString();
        match = importrx.exec(filedata);
      }

      const output = solc.compile({ sources: sources }, 1);

      if (output.errors) {
        console.error(`error compiling ${file.relative}`);
        _.each(output.errors, (err) => {
          console.error(err);
        });
        callback();
        return;
      }

      // FIXME: at this point we cannot get a consistent, provable output that matches to the online
      // compiler - as such, contracts bytecode won't be generated locally (we do need the ABI)
      _.each(output.contracts, (contract, name) => {
        if (sources[file.relative].indexOf(`contract ${name} `) !== -1) {
          file.contents = new Buffer(JSON.stringify({
            // solidity: contract.solidity_interface,
            // runtime: contract.runtimeBytecode
            // size: contract.bytecode.length,
            // bytecode: contract.bytecode,
            // estimates: contract.gasEstimates,
            interface: JSON.parse(contract.interface)
          }, null, 2), 'utf-8');
        }
      });

      this.push(file);
      callback();
    },
    function(callback) {
      callback();
    }
  );
};

const compilerPipe = function(min) {
  return through(
    function(file, encoding, callback) {
      if (!min || file.relative.indexOf('.spec.js') === -1) {
        compiled[`${file.relative}${min ? '-min' : ''}`] = file.contents.toString();
        this.push(file);
      }

      callback();
    },
    function(callback) {
      callback();
    }
  );
};

const jadedata = function() {
  return data(function(file) {
    let comp = false;

    const location = _.filter(file.path.split('/'), function(p) {
      if (comp && p.indexOf('.jade') === -1) {
        return true;
      }

      if (p.indexOf('components') === 0) {
        comp = true;
      }
    }).join('/');

    return {
      readCompiled: function(_name) {
        const name = path.join(location, _name);
        const namemin = `${name}-min`;

        if (UGLIFY && name.slice(-3) === '.js') {
          return compiled[namemin];
        }

        return compiled[name];
      },
      readFile: function(name) {
        return fs.readFileSync(path.join(location, name), 'utf-8');
      }
    };
  });
};

gulp.task('clean-dist', (cb) => {
  rimraf('./dist', cb);
});

gulp.task('clean-xmlhttp', (cb) => {
  rimraf('./.node-xmlhttprequest-sync-*', cb);
});

gulp.task('clean', ['clean-dist', 'clean-xmlhttp']);

gulp.task('copy-components', () => {
  return gulp
    .src(['bower_components/**/*'])
    .pipe(gulp.dest('dist/public/components/bower/'));
});

gulp.task('copy-images', () => {
  return gulp
    .src(['img/*'])
    .pipe(gulp.dest('dist/public/images/'));
});

gulp.task('copy-favicon', () => {
  return gulp
    .src(['src/images/favicon.ico'])
    .pipe(gulp.dest('dist/public/'));
});

gulp.task('copy-packagejson', () => {
  return gulp
    .src(['package.json'])
    .pipe(gulp.dest('dist/'));
});

gulp.task('css-components', () => {
  const nm = path.join(__dirname, '/node_modules'); // eslint-disable-line no-undef

  return gulp
    .src(['src/client/components/**/*.scss'])
    .pipe(sass({
      indentedSyntax: false,
      sourceComments: 'normal',
      outputStyle: 'nested',
      includePaths: [
        path.join(nm, '/bourbon/app/assets/stylesheets'),
        path.join(nm, '/bourbon-neat/app/assets/stylesheets')
      ]
    }))
    .on('error', errcb)
    .pipe(ignore.exclude('*.css.map'))
    .pipe(cssmin())
    .pipe(compilerPipe());
});

gulp.task('css-pages', () => {
  const nm = path.join(__dirname, '/node_modules'); // eslint-disable-line no-undef

  return gulp
    .src(['src/client/pages/**/*.scss'])
    .pipe(sass({
      indentedSyntax: false,
      sourceComments: 'normal',
      outputStyle: 'nested',
      includePaths: [
        path.join(nm, '/bourbon/app/assets/stylesheets'),
        path.join(nm, '/bourbon-neat/app/assets/stylesheets')
      ]
    }))
    .on('error', errcb)
    .pipe(ignore.exclude('*.css.map'))
    .pipe(cssmin())
    .pipe(gulp.dest('dist/public/'));
});

gulp.task('html-components', ['css-components', 'js-components'], () => {
  return gulp
    .src(['src/client/components/**/*.jade'])
    .pipe(jadedata())
    .pipe(jade())
    .on('error', errcb)
    .pipe(gulp.dest('dist/public/components/'));
});

gulp.task('html-pages', () => {
  return gulp
    .src(['src/client/pages/**/*.jade'])
    .pipe(jadelint())
    .pipe(jade())
    .pipe(gulp.dest('dist/public/'));
});

gulp.task('js-pages', () => {
  return gulp
    .src(['src/client/pages/**/*.js'])
    .pipe(eslint({}))
    .pipe(eslint.format())
    .pipe(babel())
    .on('error', errcb)
    .pipe(uglify())
    .pipe(gulp.dest('dist/public/'));
});

gulp.task('js-components', function() {
  return gulp
    .src(['src/client/components/**/*.js'])
    .pipe(eslint({}))
    .pipe(eslint.format())
    .pipe(babel())
    .on('error', errcb)
    .pipe(compilerPipe())
    .pipe(uglify())
    .pipe(compilerPipe(true));
});

gulp.task('js-server', () => {
  return gulp
    .src(['src/server/**/*.js'])
    .pipe(eslint({}))
    .pipe(eslint.format())
    .pipe(babel())
    .on('error', errcb)
    .pipe(gulp.dest('dist/'));
});

gulp.task('solc-contracts', () => {
  return gulp
    .src(['node_modules/contracts/src/**/*.sol'])
    .pipe(solcPipe('node_modules/contracts'))
    .on('error', errcb)
    .pipe(rename((file) => {
      file.extname = '.json';
    }))
    .pipe(gulp.dest('dist/contracts/'));
});

gulp.task('test-server', () => {
  require('babel-core/register');

  process.env.NODE_ENV = 'test';

  return gulp
    .src(['src/server/**/*.spec.js'])
    .pipe(eslint({}))
    .pipe(eslint.format())
    .pipe(mocha({
      timeout: 30000
    }));
});

gulp.task('test', ['test-server']);
gulp.task('components', ['copy-components', 'html-components']);
gulp.task('pages', ['css-pages', 'html-pages', 'js-pages']);
gulp.task('contracts', ['solc-contracts']);
gulp.task('client', ['components', 'pages']);
gulp.task('server', ['js-server']);
gulp.task('infrastructure', ['copy-packagejson', 'copy-images']);
gulp.task('default', ['client', 'server', 'contracts', 'infrastructure']);

gulp.task('watch', ['default'], () => {
  gulp.watch(['node_modules/contracts/src/**/*.sol'], ['solc-contracts']);
  gulp.watch(['img/*'], ['copy-images']);
  gulp.watch(['src/client/components/**/*'], ['html-components']);
  gulp.watch(['src/client/pages/**/*.jade'], ['html-pages']);
  gulp.watch(['src/client/pages/**/*.js'], ['js-pages']);
  gulp.watch(['src/client/pages/**/*.scss'], ['css-pages']);
  gulp.watch(['src/server/**/*.js'], ['js-server']);
});
