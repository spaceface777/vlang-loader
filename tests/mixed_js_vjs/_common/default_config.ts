import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'
import path from 'path'

const default_config: webpack.Configuration = {
	mode: 'production',
	node: false,
	entry: path.resolve('src/main.js'),
	resolve: {
		extensions: ['.js', '.v'],
	},
	module: {
		rules: [
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
	]
}

export default default_config
