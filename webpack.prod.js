const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	externals: {
		protobufjs: 'protobufjs',
		protobufjs: 'protobuf'
	},
	entry: [
		'./src/index',
		'./public/css/main.css'
	],
	output: {
		path: path.join(__dirname, '/dist'),
		filename: 'bundle.js'
	},

	// ...you'll probably need to configure the usual Webpack fields like "mode" and "entry", too.
	resolve: {
		extensions: [".ts", ".tsx", ".js", ".jsx", ".css"],
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
