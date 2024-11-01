/**
 * @file index.tsx
 * @description Header brand logo.
 */

'use strict';
import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import routes from '@sources/ts/global/react-router/routes';
import staticTexts from '@sources/ts/render/static-texts';
import staticUrls from '@sources/ts/render/static-urls';
import * as styles from './BrandLogo.module.css';
const { brandLogoAlt } = staticTexts,
    { brandLogoUrl } = staticUrls;

/**
 * Header brand logo.
 * @param props Component properties.
 * @returns Returns the component.
 */
const BrandLogo: FunctionComponent<
    React.DetailedHTMLProps<
        React.AnchorHTMLAttributes<HTMLAnchorElement>,
        HTMLAnchorElement
    >
> = function ({ className, ...props }) {
    const classes = classNames(styles['link'], className);

    return (
        <Link {...props} className={classes} to={routes.home} tabIndex={-1}>
            <img
                className={styles['logo']}
                src={brandLogoUrl}
                alt={brandLogoAlt}
            />
        </Link>
    );
};

export default BrandLogo;
