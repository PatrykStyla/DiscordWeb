const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs')
const webpack = require('webpack')
const WebpackAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
var DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");

module.exports = {
	externals: {
		// protobufjs: 'protobufjs',
		protobufjs: 'protobuf'
	},
	entry: [
		'webpack-dev-server/client?https://discord.patrykstyla.com:8080',
		'./src/index',
		'./public/css/main.css'
	],
	output: {
		path: path.join(__dirname, '/dist'),
		publicPath: 'https://discord.patrykstyla.com:8080/',
		filename: 'bundle.js'
	},
	devServer: {
		headers: { "Access-Control-Allow-Origin": "*" },
		host: '51.75.163.201',
		https: true,
		compress: true,
		disableHostCheck: true,
		key: fs.readFileSync('/etc/letsencrypt/live/patrykstyla.com/privkey.pem'),
		cert: fs.readFileSync('/etc/letsencrypt/live/patrykstyla.com/fullchain.pem'),
        transportMode: 'ws', 
        injectClient: false,
		// proxy: {
		// 	'/': 'https://discord.patrykstyla.com'
		// },
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
		extensions: [".ts", ".tsx", ".js", ".jsx", ".css"],
		alias: {
			  'react-dom': '@hot-loader/react-dom',
		}
	},
	module: {
		rules: [
			{
				test: /\.(j|t)sx?$/,
				exclude: [
					/node_modules/,
				],
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
							  "react-hot-loader/babel",
							  "@babel/transform-runtime"
							//dedupe similar code  //minify everything
							//Merge chunks 
						]
					}
				}
			},
			{
				test: /\.js?$/,
				exclude: [
					/node_modules/,
				],
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
							// ["@babel/plugin-proposal-decorators", { legacy: true }],
							["@babel/plugin-proposal-class-properties", { loose: true }],
							"react-hot-loader/babel",
							"@babel/transform-runtime"
						]
					}
				}
			},
			{
			  test: /\.css$/i,
			  use: [
			    MiniCssExtractPlugin.loader,
			    'css-loader',
			    {
			      loader: 'postcss-loader',
			      options: {
			        postcssOptions: {
			          plugins: [
			            require('tailwindcss'),
			            require('autoprefixer'),
			            require('postcss-import'),
			          ],
			        },
			      },
			    },
			  ],
			},
		]
	},
	optimization: {
		minimize: true,
		minimizer: [
			// For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
			// `...`
			new CssMinimizerPlugin(),
		],
	},
	plugins: [
		// new HtmlWebpackPlugin({
		// 	template: 'dist/index.html'
		// }),
		new MiniCssExtractPlugin(),
		new WebpackAnalyzer()
	],
	devtool: (process.env.INLINE_SOURCE_MAP === "true") ? 'inline-source-map' : 'hidden-source-map'
};
