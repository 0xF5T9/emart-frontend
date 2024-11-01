/**
 * @file index.tsx
 * @description Top-level application component.
 */

import { FunctionComponent } from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Top-level application component.
 * @returns Returns the component.
 */
const App: FunctionComponent = function () {
    return (
        <div id="app">
            <Outlet />
        </div>
    );
};

export default App;
