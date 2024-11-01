/**
 * @file index.tsx
 * @description Labeled select.
 */

'use strict';
import { FunctionComponent, CSSProperties } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import * as styles from './LabeledSelect.module.css';

/**
 * Labeled select.
 * @param props Component properties.
 * @param props.color Color variant.
 * @param props.inputSize Size variant.
 * @param props.reverseBackground Specifies whether to use reverse background.
 * @param props.width Specifies a fixed width for the input.
 * @param props.labelWidth Specifies a fixed width for the input label.
 * @param props.label Input label.
 * @param props.wrapperProps Top-level wrapper properties.
 * @param props.children Option elements.
 * @note Properties that are not explicitly stated here are passed to select element.
 * @returns Returns the component.
 */
const LabeledSelect: FunctionComponent<
    React.DetailedHTMLProps<
        React.SelectHTMLAttributes<HTMLSelectElement>,
        HTMLSelectElement
    > & {
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
        label?: string;
        wrapperProps?: React.DetailedHTMLProps<
            React.HTMLAttributes<HTMLDivElement>,
            HTMLDivElement
        >;
    }
> = function ({
    color,
    inputSize,
    reverseBackground = false,
    width,
    labelWidth,
    label,
    id,
    className,
    disabled = false,
    children,
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
            <select
                {...inputProps}
                className={styles['input']}
                id={id}
                disabled={disabled}
            >
                {children}
            </select>
        </div>
    );
};

LabeledSelect.propTypes = {
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
};

export default LabeledSelect;
