import path from 'path'
import { merge } from 'webpack-merge'
import config from '../_common/default_config'

export default merge(config, {
	module: {
		rules: [
			{
				test: /\.v$/,
				use: [
					{
						loader: path.resolve('../../../dist/index.js'),
						options: {
							shared: true
						}
					}
				]
			}
		]
	}
})
