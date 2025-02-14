/**
 * @file webpack.config.ts
 * @description Webpack development configuration file.
 */

import dotenv from 'dotenv';
dotenv.config({
    path: '.env',
});

import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin'; // HtmlWebpackPlugin: Generate HTML files from template files.
import Dotenv from 'dotenv-webpack'; // Dotenv: Enable support for environment files.

const enableHighQualitySourceMap = true;

console.log('Using Webpack development configuration ...');

// Validate environment variables.
const environmentVariables = {
    NODE_ENV: process.env.NODE_ENV,
    API_URL: process.env.API_URL,
    UPLOAD_URL: process.env.UPLOAD_URL,
    PORT: process.env.PORT,
    WEBPACK_DEV_SERVER_OPEN_URL: process.env.WEBPACK_DEV_SERVER_OPEN_URL,
    WEBPACK_PATH_TO_CERT: process.env.WEBPACK_PATH_TO_CERT,
    WEBPACK_PATH_TO_CERT_KEY: process.env.WEBPACK_PATH_TO_CERT_KEY,
};
let isConfigurationInvalid = false;
for (const variable in environmentVariables) {
    let value =
        environmentVariables[variable as keyof typeof environmentVariables];
    if (!value) {
        console.error(` ENV Variable '${variable}' is undefined.`);
        isConfigurationInvalid = true;
    }
    if (
        variable === 'NODE_ENV' &&
        value !== 'development' &&
        value !== 'production'
    ) {
        console.error(
            `NODE_ENV not set correctly. Expected 'development' or 'production'.`
        );
        isConfigurationInvalid = true;
    }
}
if (isConfigurationInvalid)
    throw new Error(
        `Misconfiguration detected. Please check if the environment variables are set correctly.`
    );

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
        open: {
            target: [process.env.WEBPACK_DEV_SERVER_OPEN_URL],
        },
        devMiddleware: {
            writeToDisk: false,
        },
        watchFiles: ['sources/**/*'], // Rebuild on source file changes.
        historyApiFallback: true, // Enable 'historyApiFallback' or react router won't work.
        host: '0.0.0.0',
        allowedHosts: 'all',
        server: {
            type: 'https',
            options: {
                key: process.env.WEBPACK_PATH_TO_CERT_KEY,
                cert: process.env.WEBPACK_PATH_TO_CERT,
                passphrase: 'webpack-dev-server',
                requestCert: false,
            },
        },
        client: {
            webSocketURL: {
                hostname: '0.0.0.0',
                pathname: '/ws',
                password: 'dev-server',
                port: 443,
                protocol: 'wss',
                username: 'webpack',
            },
        },
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
            systemvars: true, // Pass system variables. Set to true so it will work in docker context.
            // path: './.env.development', // Use specific environment file.
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
    // If we're going to use multiple entry points on a single HTML page,
    // optimization.runtimeChunk: 'single' is needed.
    // https://webpack.js.org/guides/code-splitting/
    optimization: {
        runtimeChunk: 'single',
    },
};
