import { Schema } from 'schema-utils/declarations/validate'

const bool = { type: 'boolean' }

const schema = {
	type: 'object',
	properties: {
		shared: bool,
		enable_globals: bool,
		sourcemap: bool
	}
} as Schema

export default schema
