/**
 * @file index.tsx
 * @description Native select.
 */

'use strict';
import { FunctionComponent, ReactNode } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import * as styles from './NativeSelect.module.css';

/**
 * Native select input.
 * @param props Component properties.
 * @param props.inputSize Size variant.
 * @param props.children Option elements.
 * @param props.wrapperProps Wrapper element props.
 * @note Properties that are not explicitly stated here are passed to select element.
 * @returns Returns the component.
 */
const NativeSelect: FunctionComponent<
    React.DetailedHTMLProps<
        React.SelectHTMLAttributes<HTMLSelectElement>,
        HTMLSelectElement
    > & {
        inputSize?: 'small' | 'large';
        children?: ReactNode;
        wrapperProps?: React.DetailedHTMLProps<
            React.HTMLAttributes<HTMLDivElement>,
            HTMLDivElement
        >;
    }
> = function ({ inputSize, className, children, wrapperProps, ...props }) {
    const classes = classNames(styles.select, styles[inputSize], className);
    return (
        <div
            {...wrapperProps}
            className={classNames(
                styles['select-wrapper'],
                wrapperProps?.className
            )}
        >
            <i
                className={classNames(
                    styles['arrow'],
                    styles[inputSize],
                    'fal fa-chevron-down'
                )}
            />
            <select {...props} className={classes}>
                {children}
            </select>
        </div>
    );
};

NativeSelect.propTypes = {
    inputSize: PropTypes.oneOf(['small', 'large']),
};

export default NativeSelect;
