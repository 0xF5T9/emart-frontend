/**
 * @file index.tsx
 * @description Section title.
 */

'use strict';
import { FunctionComponent, ElementType } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import * as styles from './SectionTitle.module.css';

/**
 * Section title.
 * @param props.element Element type.
 * @note Properties that are not explicitly stated here are passed to the element.
 * @returns Returns the component.
 */
const SectionTitle: FunctionComponent<
    React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLHeadingElement>,
        HTMLHeadingElement
    > & {
        element?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    }
> = function ({ element = 'h5', className, children, ...elementProps }) {
    const Element: ElementType = element,
        classes = classNames(styles['section-title'], className);
    return (
        <Element {...elementProps} className={classes}>
            {children}
        </Element>
    );
};

SectionTitle.propTypes = {
    element: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
};

export default SectionTitle;
