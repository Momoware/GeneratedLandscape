const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        main: [path.resolve(__dirname, './src/script_direct.js'),
        path.resolve(__dirname, './src/threeScript.js')],
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name]_bundle.js',
    },
    module: {
        rules: [
            //shaders
            {
                test: /\.glsl$/,
                use: {
                    loader: 'webpack-glsl-loader'
                }
            },

            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },

            {
                test: /\.(html)$/,
                use: ['html-loader']
            },

            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },

            {
                test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'img/[hash][ext][query]'
                }
            },

            {
                test: /\.(?:ico|ttf|eot|woff|woff2)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[hash][ext][query]'
                }
            },
        ]
    },
    plugins:
        [
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, './src/index.html'),
                minify: true
            })
        ],
};