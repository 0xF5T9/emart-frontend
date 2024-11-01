/**
 * @files index.ts
 * @description React router variables.
 */

'use strict';
import routes from './routes';
import appRouter from './app-router';

const reactRouter = {
    routes,
    appRouter,
} as const;

export default reactRouter;
