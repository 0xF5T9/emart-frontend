/**
 * @file webpack.config.ts
 * @description Webpack development configuration file.
 */

import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin'; // HtmlWebpackPlugin: Generate HTML files from template files.
import Dotenv from 'dotenv-webpack'; // Dotenv: Enable support for environment files.

const enableHighQualitySourceMap = true;

console.log('Using Webpack development configuration ...');

export default {
    target: ['web', 'es5'],
    entry: {
        style: './sources/ts/style.ts',
        index: './sources/ts/entry.tsx',
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'build'),
        publicPath: '/',
        clean: true,
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.(ts|tsx)?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                auto: true,
                                localIdentName:
                                    // '[path][name]__[local]--[hash:base64:5]',
                                    '[name]__[local]--[hash:base64:5]',
                            },
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        fallback: {
            stream: require.resolve('stream-browserify'),
            buffer: require.resolve('buffer/'),
            crypto: require.resolve('crypto-browserify'),
            util: require.resolve('util/'),
            vm: require.resolve('vm-browserify'),
        },
        alias: {
            process: 'process/browser',
        },
    },
    devtool: enableHighQualitySourceMap ? 'eval-source-map' : false,
    devServer: {
        static: {
            directory: path.join(__dirname, 'sources/static'),
        },
        port: 8080,
        hot: true,
        open: true,
        devMiddleware: {
            writeToDisk: false,
        },
        watchFiles: ['sources/**/*'], // Rebuild on source file changes.
        historyApiFallback: true, // Enable 'historyApiFallback' or react router won't work.
    },
    plugins: [
        // Generate 'index.html' file.
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './sources/html/index.html',
            chunks: ['index', 'style'],
        }),
        // Enable support for environment files.
        new Dotenv({
            // path: './.env.development', // Use specific environment file.
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
};
