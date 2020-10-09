const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry:  './src/index',
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'bundle.js'
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
      template: './src/index.html'
    })
  ],
  devtool: 'inline-source-map'
};
