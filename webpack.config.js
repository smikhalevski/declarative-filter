var path = require('path');

module.exports = {
  entry: './src/main/index.js',
  output: {
    path: './target/out',
    filename: '[name].js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    root: path.resolve(__dirname, 'node_modules'),
    fallback: [
      path.resolve(__dirname, '..')
    ]
  },
  module: {
    loaders: [
      {test: /\.js$/, loader: 'babel'}
    ]
  }
};
