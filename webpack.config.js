const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs')
const webpack = require('webpack')
const WebpackAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  entry: './src/index',
  output: {
    path: path.join(__dirname, '/dist'),
    // publicPath: 'http://localhost:9000/dist',
    filename: 'bundle.js'
  },
  devServer: {    
    overlay: true,
    historyApiFallback: true,
    stats: {
      assets: true,
      children: false,
      chunks: false,
      hash: false,
      modules: false,
      publicPath: false,
      timings: false,
      version: false,
      warnings: true,
      colors: {
          green: '\u001b[32m'
      }
  }
  },
  // ...you'll probably need to configure the usual Webpack fields like "mode" and "entry", too.
  resolve: { 
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      'react-dom': '@hot-loader/react-dom',
    }
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
            babelrc: false,
            presets: [
              [
                "@babel/preset-env",
                { targets: { browsers: "last 2 versions" } } // or whatever your project requires
              ],
              "@babel/preset-typescript",
              "@babel/preset-react"
            ],
            plugins: [
              // plugin-proposal-decorators is only needed if you're using experimental decorators in TypeScript
              ["@babel/plugin-proposal-decorators", { legacy: true }],
              ["@babel/plugin-proposal-class-properties", { loose: true }],
              "react-hot-loader/babel"
            ]
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    }),
    // new WebpackAnalyzer()
  ],
  devtool: (process.env.INLINE_SOURCE_MAP === "true") ? 'inline-source-map' : 'hidden-source-map'
};
