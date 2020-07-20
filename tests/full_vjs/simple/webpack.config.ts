// Simplest possible config: don't reuse the common one here
import path from 'path'

export default {
    entry: './src/main.v',
    module: {
        rules: [{ test: /\.v$/, use: path.resolve('../../../dist/index.js') }]
    }
}
