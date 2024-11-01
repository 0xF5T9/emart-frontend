/**
 * @file index.tsx
 * @description Light theme component.
 */
'use strict';
import { FunctionComponent } from 'react';
import css from '!!raw-loader!./Light.css';

const Theme: FunctionComponent = function () {
    return <style>{`${css}`}</style>;
};

export default Theme;
