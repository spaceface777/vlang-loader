import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'
import path from 'path'

const default_config: webpack.Configuration = {
    mode: 'development',
    node: false,
    entry: path.resolve('src/main.v'),
    resolve: {
        extensions: ['.js', '.v'],
    },
    module: {
        rules: [
            {
                test: /\.v$/,
                use: path.resolve('../../dist/index.js')
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin()
    ],
    output: {
        filename: 'output.js'
    }
}

export default default_config