/**
 * @file index.tsx
 * @description Grid System components.
 */

'use strict';
import { FunctionComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Grid System row component.
 * @param props Component properties.
 * @param props.noGutters Specifies whether to remove gutters.
 * @returns Returns the component.
 */
const Row: FunctionComponent<
    React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
    > & {
        noGutters?: boolean;
    }
> = function ({ noGutters = false, className, children, ...props }) {
    const classes = classNames(
        'row',
        {
            'no-gutters': noGutters,
        },
        className
    );
    return (
        <div {...props} className={classes}>
            {children}
        </div>
    );
};

Row.propTypes = {
    noGutters: PropTypes.bool,
};

/**
 * Grid System column component.
 * @param props Component properties.
 * @returns Returns the component.
 */
const Column: FunctionComponent<
    React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
    >
> = function ({ className, children, ...props }) {
    const classes = classNames('col', className);

    return (
        <div {...props} className={classes}>
            {children}
        </div>
    );
};

export { Row, Column };
