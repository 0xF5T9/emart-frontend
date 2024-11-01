/**
 * @file index.tsx
 * @description Input.
 */

'use strict';
import { FunctionComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import * as styles from './Input.module.css';

/**
 * Input component.
 * @param props Component properties.
 * @param props.type Input type.
 * @param props.color Color variant.
 * @param props.inputSize Size variant.
 * @param props.height Input fixed height.
 * @param props.transparent Specifies whether to use transparent background.
 * @param props.icon Input icon.
 * @param props.className Class names. (This applies to the top-level wrapper element)
 * @param props.inputRef Input ref.
 * @param props.wrapperProps Top-level wrapper properties.
 * @note Properties that are not explicitly stated here are passed to input element.
 * @returns Returns the component.
 */
const Input: FunctionComponent<
    React.DetailedHTMLProps<
        React.InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
    > & {
        type?: 'text' | 'email' | 'password' | 'number' | 'tel';
        color?:
            | 'red'
            | 'orange'
            | 'yellow'
            | 'green'
            | 'blue'
            | 'purple'
            | 'black';
        inputSize?: 'small' | 'large';
        height?: number;
        transparent?: boolean;
        icon?: {
            position: 'left' | 'right';
            icon: FunctionComponent<any> | string;
        };
        className?: string;
        inputRef?: React.MutableRefObject<HTMLInputElement>;
        wrapperProps?: React.DetailedHTMLProps<
            React.HTMLAttributes<HTMLDivElement>,
            HTMLDivElement
        >;
    }
> = function ({
    type = 'text',
    color,
    inputSize,
    height,
    transparent = false,
    icon,
    className,
    disabled = false,
    inputRef,
    wrapperProps,
    ...inputProps
}) {
    const iconPositionStyle = icon
        ? icon?.position === 'right'
            ? styles['icon-right']
            : styles['icon-left']
        : undefined;

    const Icon = icon?.icon;

    const classes = classNames(
        styles['input-wrapper'],
        styles[color],
        styles[inputSize],
        iconPositionStyle,
        { [styles['transparent']]: transparent },
        { [styles['disabled']]: disabled },
        className
    );

    const inputStyle = inputProps?.style || {};
    if (height) inputStyle.height = `${height}px`;

    return (
        <div
            {...wrapperProps}
            className={classNames(classes, wrapperProps?.className)}
        >
            {Icon && typeof icon?.icon === 'function' && (
                <Icon className={styles['icon']} />
            )}
            {icon?.icon && typeof icon?.icon === 'string' && (
                <i className={classNames(styles['icon'], icon?.icon)} />
            )}
            <input
                {...inputProps}
                ref={inputRef}
                type={type}
                className={styles['input']}
                style={inputStyle}
                disabled={disabled}
            />
        </div>
    );
};

Input.propTypes = {
    type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'tel']),
    color: PropTypes.oneOf([
        'red',
        'orange',
        'yellow',
        'green',
        'blue',
        'purple',
        'black',
    ]),
    inputSize: PropTypes.oneOf(['small', 'large']),
    height: PropTypes.number,
    transparent: PropTypes.bool,
    icon: PropTypes.exact({
        position: PropTypes.any,
        icon: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    }),
    className: PropTypes.string,
    inputRef: PropTypes.any,
    wrapperProps: PropTypes.object,
};

export default Input;
