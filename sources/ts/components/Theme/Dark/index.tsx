/**
 * @file index.tsx
 * @description Dark theme component.
 */
'use strict';
import { FunctionComponent } from 'react';
import css from '!!raw-loader!./Dark.css';

const Theme: FunctionComponent = function () {
    return <style>{`${css}`}</style>;
};

export default Theme;
