/**
 * @file index.ts
 * @description APIs.
 */

'use strict';
import * as backend from './backend';

const apis = {
    backend,
} as const;

export default apis;
