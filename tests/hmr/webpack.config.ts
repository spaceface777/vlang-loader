import { merge } from 'webpack-merge'
import config from '../common/default_config'
import path from 'path'

// `devServer` is not part of the default webpack config, so
// this has to be typed as `any` to avoid compilation issues
const dev_server_config: any = {
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		compress: true,
		hot: true,
		port: 8000
	}
}

export default merge(config, dev_server_config)
