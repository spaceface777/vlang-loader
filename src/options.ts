import loader from 'loader-utils'
import validateOptions from 'schema-utils'
import webpack from 'webpack'

import { Schema } from 'schema-utils/declarations/validate'

type VOptions = typeof DefaultOptions

// TODO: implement commented out options
const DefaultOptions = {
	shared: false,
	enable_globals: false,
	sourcemap: true,

	vPath: 'v',
	// emccPath: 'emcc',

	// wasm: false,
	// asmJs: false
}

// TODO: Find a better way to type this: `{ shared: true }` should be
// `{ key: { type: 'boolean' } }` instead of `{ key: { type: string } }`
const schema = {
	type: 'object',
	properties: {} as { [key in keyof typeof DefaultOptions]: { type: string } }
}

let prop: keyof typeof DefaultOptions
for (prop in DefaultOptions) {
	const prop_type = typeof DefaultOptions[prop]
	schema.properties[prop] = { type: prop_type }
}

let v_instances = new WeakMap<webpack.Compiler, VOptions>()

export function get_options(context: webpack.loader.LoaderContext): VOptions {
	const options = loader.getOptions(context) as VOptions
	const instance = v_instances.get(context._compiler)

	if (instance) return instance
	else {
		validateOptions(schema as Schema, options, { name: 'vlang-loader' })
		const new_instance = { ...DefaultOptions, ...options }
		v_instances.set(context._compiler, new_instance)
		return new_instance
	}
}

export function parse_options(context: webpack.loader.LoaderContext, options: VOptions): string[] {
	const res: string[] = []

	if (context.mode === 'production') res.push('-prod')
	if (options.shared) res.push('-shared')
	if (options.enable_globals) res.push('--enable-globals')

	return res
}
