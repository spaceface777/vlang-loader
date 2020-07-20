import utils from 'loader-utils'
import validateOptions from 'schema-utils'
import webpack from 'webpack'

import schema from './schema'

type VOptions = Readonly<{
	instance: string
	shared: boolean
}>

let v_instances = new WeakMap<webpack.Compiler, VOptions>()

export function get_options(context: webpack.loader.LoaderContext): VOptions {
	const options = utils.getOptions(context) as VOptions

	if (v_instances.has(context._compiler)) {
		return v_instances.get(context._compiler)!
	} else {
		validateOptions(schema, options, { name: 'vlang-loader' })

		v_instances.set(context._compiler, options)
		return options
	}
}
