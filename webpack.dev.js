const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const serverHandler = require('./serverHandler');

module.exports = merge(common, {
  mode: 'development',
  // devtool: 'inline-source-map',
  devServer: {
    historyApiFallback: true,
    contentBase: "./dist",
    host: '0.0.0.0',
    before: serverHandler,
    headers: {
      "X-Content-Type-Options": "nosniff"
    }
  }
});