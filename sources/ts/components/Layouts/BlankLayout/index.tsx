/**
 * @file index.tsx
 * @description Blank layout.
 */

'use strict';
import { FunctionComponent, ReactNode } from 'react';
import { ScrollRestoration, useLoaderData } from 'react-router-dom';

import Content from '@sources/ts/components/Content';
import { ModalOverlay } from '@sources/ts/components/Modal';
import { ToastOverlay } from '@sources/ts/components/Toast';
import * as styles from '../Layout.module.css';

/**
 * Loader.
 * @returns Returns the loader data.
 */
async function loader() {
    return {};
}

/**
 * Blank layout.
 * @param props Component properties.
 * @param props.children Section components.
 * @returns Returns the component.
 */
const BlankLayout: FunctionComponent<{ children?: ReactNode }> = function ({
    children,
}) {
    return (
        <>
            <style>
                {`
                    :root {
                    --header-height: 0px !important;
                    --footer-height: 0px !important;
                    }
                `}
            </style>
            <div id="app">
                <Content>{children}</Content>
                <ModalOverlay />
                <ToastOverlay />
                <div className={styles['background']} />
            </div>
            <ScrollRestoration />
        </>
    );
};

export default BlankLayout;
export { loader };
