const path = require("path");
const glob = require("glob");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const PurgecssPlugin = require('purgecss-webpack-plugin')

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },
  module: {
    rules: [
      { test: /\.txt$/, use: "raw-loader" },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "postcss-loader"
          }
        ]
      },
      { test: /\.js$/, use: "babel-loader", exclude: /node_modules/ },
      { test: /\.jsx?$/, use: "babel-loader", exclude: /node_modules/ },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        exclude: /node_modules/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8000,
              name: "assets/[hash]-[name].[ext]"
            }
          }
        ]
      }
    ]
  },
  plugins: [
    require("tailwindcss"),
    require("autoprefixer"),
    new HtmlWebpackPlugin({ template: "./index.html" })
  ]
};
