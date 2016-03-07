var _ = require('lodash');
var path = require('path');
var glob = require('glob').sync;
var webpack = require('webpack');

var STATIC = path.join('client', 'static');
var SRC = path.join('client', 'src');
var COMMON_PATH = path.join('.', STATIC, 'wagtailadmin', 'js', 'common.js');
var ENTRY_DIR = path.resolve('.', SRC, '**', '*.entry.js');
var CLIENT_DIR = path.resolve(__dirname, SRC);


function appName(filename) {
  return filename
    .split(path.sep)
    .slice(-2, -1).pop();
}


function entryPoint(filename) {
  var name = appName(filename);
  var entryName = path.basename(filename, '.entry.js');
  var outputPath = path.join(STATIC, name, 'js', entryName);
  return [outputPath, filename];
}


function entryPoints(paths) {
  return _(glob(paths))
    .map(entryPoint)
    .fromPairs()
    .value();
}




module.exports = function exports() {
  return {
    entry: entryPoints(ENTRY_DIR),
    resolve: {
      alias: {
        config: path.resolve(CLIENT_DIR, 'config'),
        components: path.resolve(CLIENT_DIR, 'components')
      }
    },
    output: {
      path: './',
      filename: '[name].js',
      publicPath: '/static/js/'
    },
    plugins: [
      new webpack.ProvidePlugin({
        fetch: 'imports?this=>global!exports?global.fetch!whatwg-fetch'
      }),
      new webpack.optimize.CommonsChunkPlugin('common', COMMON_PATH, Infinity)
    ],
    devtool: '#inline-source-map',
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'babel'
        },
        {
          test: /\.jsx$/,
          loader: 'babel'
        }
      ]
    }
  };
};
