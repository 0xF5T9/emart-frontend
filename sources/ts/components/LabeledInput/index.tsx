/**
 * @file index.tsx
 * @description Labeled input.
 */

'use strict';
import { CSSProperties, FunctionComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import * as styles from './LabeledInput.module.css';

/**
 * Labeled input.
 * @param props Component properties.
 * @param props.type Input type.
 * @param props.color Color variant.
 * @param props.inputSize Size variant.
 * @param props.reverseBackground Specifies whether to use reverse background.
 * @param props.width Specifies a fixed width for the input.
 * @param props.labelWidth Specifies a fixed width for the input label.
 * @param props.label Input label.
 * @param props.wrapperProps Top-level wrapper properties.
 * @note Properties that are not explicitly stated here are passed to input element.
 * @returns Returns the component.
 */
const LabeledInput: FunctionComponent<
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
        reverseBackground?: boolean;
        width?: number;
        labelWidth?: number;
        label: string;
        wrapperProps?: React.DetailedHTMLProps<
            React.HTMLAttributes<HTMLDivElement>,
            HTMLDivElement
        >;
    }
> = function ({
    type = 'text',
    color,
    inputSize,
    reverseBackground = false,
    width,
    labelWidth,
    label,
    id,
    className,
    disabled = false,
    wrapperProps,
    ...inputProps
}) {
    const classes = classNames(
        styles['input-wrapper'],
        styles[color],
        styles[inputSize],
        { [styles['reverse-background']]: reverseBackground },
        { [styles['disabled']]: disabled },
        className
    );

    let wrapperStyle = wrapperProps?.style || {};
    if (width) wrapperStyle.width = `${width}px`;

    let labelWrapperStyle: CSSProperties = {};
    if (labelWidth) {
        labelWrapperStyle.width = `${labelWidth}px`;
        labelWrapperStyle.flexShrink = '0';
    }

    return (
        <div
            {...wrapperProps}
            className={classNames(classes, wrapperProps?.className)}
            style={wrapperStyle}
        >
            <div className={styles['input-label']} style={labelWrapperStyle}>
                <label htmlFor={id}>{label}</label>
            </div>
            <input
                {...inputProps}
                type={type}
                id={id}
                className={styles['input']}
                disabled={disabled}
            />
        </div>
    );
};

LabeledInput.propTypes = {
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
    reverseBackground: PropTypes.bool,
    width: PropTypes.number,
    labelWidth: PropTypes.number,
    label: PropTypes.string,
    wrapperProps: PropTypes.object,
};

export default LabeledInput;
