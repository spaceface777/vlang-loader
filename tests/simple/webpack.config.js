const path = require('path')

module.exports = {
    mode: 'development',
    node: false,
    entry: path.resolve('src/main.v'),
    resolve: {
        extensions: ['.js', '.v'],
    },
    output: {
        filename: 'output.js'
    },
    module: {
        rules: [
            {
                test: /\.v$/,
                use: path.resolve('../../dist/index.js')
            }
        ]
    }
}
