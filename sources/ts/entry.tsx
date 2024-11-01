/**
 * @file entry.tsx
 * @description Application entry.
 */

'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import './utility/helper';
import globals from './global';

window.React = React;
window.ReactDOM = ReactDOM;
const $ = document.querySelector.bind(document);

(() => {
    // Create the browser router.
    const browserRouter = createBrowserRouter(globals.reactRouter.appRouter);

    // Render the application.
    const render = createRoot($('#root'));
    render.render(<RouterProvider router={browserRouter} />);
})();
