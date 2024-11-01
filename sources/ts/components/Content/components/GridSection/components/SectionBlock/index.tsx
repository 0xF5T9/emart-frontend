/**
 * @file index.tsx
 * @description Section block.
 */

'use strict';
import { FunctionComponent } from 'react';
import classNames from 'classnames';

import * as styles from './SectionBlock.module.css';

/**
 * Section block.
 * @param props Component properties.
 * @note Properties that are not explicitly stated here are passed to the element.
 * @returns Returns the component.
 */
const SectionBlock: FunctionComponent<
    React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
    >
> = function ({ className, children, ...elementProps }) {
    const classes = classNames(styles['section-block'], className);
    return (
        <div {...elementProps} className={classes}>
            {children}
        </div>
    );
};

export default SectionBlock;
