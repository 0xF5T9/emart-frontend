/**
 * @file index.tsx
 * @description Section subtitle.
 */

'use strict';
import { FunctionComponent } from 'react';
import classNames from 'classnames';

import * as styles from './SectionSubtitle.module.css';

/**
 * Section subtitle.
 * @param props Component properties.
 * @note Properties that are not explicitly stated here are passed to the element.
 * @returns Returns the component.
 */
const SectionSubtitle: FunctionComponent<
    React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLSpanElement>,
        HTMLSpanElement
    >
> = function ({ className, children, ...elementProps }) {
    const classes = classNames(styles['section-subtitle'], className);

    return (
        <span {...elementProps} className={classes}>
            {children}
        </span>
    );
};

export default SectionSubtitle;
