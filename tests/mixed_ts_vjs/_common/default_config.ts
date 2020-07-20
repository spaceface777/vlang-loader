import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'
import path from 'path'

const default_config: webpack.Configuration = {
	mode: 'production',
	node: false,
	entry: path.resolve('src/main.ts'),
	resolve: {
		extensions: ['.js', '.ts', '.v'],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: {
					loader: 'ts-loader',
					options: {}
				}
			},
			{
				test: /\.v$/,
				use: {
					loader: path.resolve('../../../dist/index.js'),
					options: {
						shared: true
					}
				}
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin()
	],
	output: {
		filename: 'output.js'
	}
}

export default default_config
