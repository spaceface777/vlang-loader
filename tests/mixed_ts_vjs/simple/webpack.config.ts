import { merge } from 'webpack-merge'
import config from '../_common/default_config'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'

export default merge(config, {
	resolve: {
		plugins: [new TsconfigPathsPlugin()]
	}

})
