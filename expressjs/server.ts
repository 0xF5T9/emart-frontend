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

const rootPath = path.resolve(process.cwd());
console.log('Loaded paths:', '\n• Root: ', rootPath, '\n');

// Validate environment variables.
const environmentVariables = {
    NODE_ENV: process.env.NODE_ENV,
    API_URL: process.env.API_URL,
    UPLOAD_URL: process.env.UPLOAD_URL,
    PORT: process.env.PORT,
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
app.listen(process.env.PORT, () => {
    let environmentVariablesLog = 'Loaded environment variables:\n';
    for (const variable in environmentVariables) {
        environmentVariablesLog += `• ${variable}: ${environmentVariables[variable as keyof typeof environmentVariables]}\n`;
    }
    console.log(environmentVariablesLog);
    const isProductionMode = process?.env?.NODE_ENV === 'production';
    console.log(
        `Application started in ${isProductionMode ? 'production' : 'development'} mode at port ${environmentVariables.PORT}.`
    );
});
