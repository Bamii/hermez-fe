var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const serverHandler = require('./serverHandler');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      { test: /\.txt$/, use: 'raw-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.js$/, use: "babel-loader", exclude: /node_modules/},
      { test: /\.jsx?$/, use: "babel-loader",  exclude: /node_modules/ },
      { test: /\.(jpe?g|png|gif|svg)$/i, exclude: /node_modules/,
        use:[{
          loader: 'url-loader',
          options: {
            limit: 8000,
            name: 'assets/[hash]-[name].[ext]'
          }
        }]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html' })
  ]
}
  