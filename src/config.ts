import { VOptions } from './options'
import webpack from 'webpack'

export function parse_options(context: webpack.loader.LoaderContext, options: VOptions): string[] {
	const res: string[] = []

	if (context.mode === 'production') res.push('-prod')
	if (options.shared) res.push('-shared')
	if (options.enable_globals) res.push('--enable-globals')

	return res
}
