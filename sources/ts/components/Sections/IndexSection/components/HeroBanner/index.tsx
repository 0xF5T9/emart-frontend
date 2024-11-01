/**
 * @file index.tsx
 * @desc Hero banner.
 */

'use strict';
import { FunctionComponent } from 'react';

import * as styles from './HeroBanner.module.css';
import staticTexts from '@sources/ts/render/static-texts';
import staticUrls from '@sources/ts/render/static-urls';

/**
 * Hero banner.
 * @param props Component properties.
 * @returns Returns the component.
 */
const HeroBanner: FunctionComponent = () => {
    return (
        <div className={styles['hero-banner-wrapper']}>
            <img
                className={styles['hero-banner']}
                src={staticUrls.heroBanner}
                alt={staticTexts.heroBannerAlt}
                onError={(event) => {
                    event.currentTarget.src = staticUrls.imagePlaceholder;
                }}
            />
        </div>
    );
};

export default HeroBanner;
