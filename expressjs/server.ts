/**
 * @file server.ts
 * @description Start the frontend web-server using Express.
 */

'use strict';
import dotenv from 'dotenv';
dotenv.config({
    path: '.env',
});

import path from 'path';
import express, { ErrorRequestHandler } from 'express';
import rateLimit from 'express-rate-limit';

import expressConfig from '../configs/express.json';

const rootPath = path.resolve(process.cwd());
console.log('Loaded paths:', '\n• Root: ', rootPath, '\n');

const app = express();

// If this server is meant to be run behind a reverse proxy (nginx etc),
// set the trust level accordingly so the rate limiter can works correctly.
app.set('trust proxy', 1);

// Global rate limit for all requests.
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 300, // Limit each IP to 300 requests 1 minutes
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});
app.use(limiter);

// Serves 'public' folder.
app.use(express.static(path.join(rootPath, 'public')));

// Passes routes to the react router as this project is using client-side routing.
app.get('/*', (request, response, next) => {
    response.sendFile(path.join(rootPath, 'public', 'index.html'));
});

// Error-handling middleware.
const errorHandler: ErrorRequestHandler = function (
    error,
    request,
    response,
    next
) {
    console.error(error);
    switch (error.errno) {
        case -4058:
            console.log(
                '\nThe project may not have been built yet, or a previous build was corrupted.'
            );
            break;
        default:
            break;
    }
    response.status(500).json({ message: 'Unexpected server error occurred.' });
};
app.use(errorHandler);

// Launch server.
app.listen(expressConfig.port, () => {
    console.log(
        `Loaded environment variables:\n• NODE_ENV: ${process?.env?.NODE_ENV}\n`
    );

    const isProductionMode = process?.env?.NODE_ENV === 'production';
    if (isProductionMode) {
        console.log('Application started in production mode:');
    } else {
        console.log('Application started in development mode:');
    }

    const { networkInterfaces } = require('os');

    const nets = networkInterfaces(),
        results = Object.create(null);

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
            if (net.family === familyV4Value && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }

    console.log(
        `• localhost: http://localhost:${expressConfig.port}\n• IPv4: http://${results?.Ethernet[0]}:${expressConfig.port}\n`
    );

    if (
        process?.env?.NODE_ENV !== 'production' &&
        process?.env?.NODE_ENV !== 'development'
    )
        console.warn(
            `NODE_ENV not set correctly. Expected 'development' or 'production'.`
        );
    if (process?.env?.NODE_ENV !== `production`)
        console.warn(`\nThis file is meant for production only, but the NODE_ENV variable is not set to 'production'. To run this project under development mode, please check vscode tasks and package.json.
`);
});
