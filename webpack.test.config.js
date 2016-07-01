var glob = require('glob');

module.exports = {
  devtool: 'inline-source-map',
  entry: {
    index: glob.sync('./src/**/*.spec.js')
  },
  output: {
    path: './target/test',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {test: /\.js$/, loader: 'babel'}
    ]
  }
};
