/**
 * @file index.tsx
 * @description Button.
 */

'use strict';
import { ForwardRefRenderFunction, forwardRef, DetailedHTMLProps } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { CircleLoading } from '@sources/ts/components/Icons/CircleLoading';
import * as styles from './Button.module.css';

const ButtonRefRender: ForwardRefRenderFunction<
    HTMLButtonElement,
    DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
    > & {
        color?:
            | 'primary'
            | 'success'
            | 'danger'
            | 'warn'
            | 'info'
            | 'gray'
            | 'white';
        size?: 'small' | 'large';
        loading?: boolean;
        height?: number;
    }
> = function (
    {
        color,
        size,
        loading = false,
        height,
        className,
        children,
        ...buttonProps
    },
    ref
) {
    const classes = classNames(
        styles.button,
        styles[color],
        styles[size],
        { [styles['loading']]: loading },
        className
    );

    const style = buttonProps?.style || {};
    if (height) style.height = `${height}px`;

    return (
        <button {...buttonProps} ref={ref} className={classes} style={style}>
            {loading && <CircleLoading className={styles['loading-icon']} />}
            {children}
        </button>
    );
};

/**
 * Standard button.
 * @param props Component properties.
 * @param props.color Color variant.
 * @param props.size Size variant.
 * @param props.loading Use loading appearance for the button.
 * @param props.height Button fixed height.
 * @note Properties that are not explicitly stated here are passed to button element.
 * @returns Returns the component.
 */
const Button = forwardRef(ButtonRefRender);

Button.propTypes = {
    color: PropTypes.oneOf([
        'primary',
        'success',
        'danger',
        'warn',
        'info',
        'gray',
        'white',
    ]),
    size: PropTypes.oneOf(['small', 'large']),
    loading: PropTypes.bool,
    height: PropTypes.number,
};

export default Button;
