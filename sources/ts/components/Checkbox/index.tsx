/**
 * @file index.tsx
 * @description Checkbox.
 */

'use strict';
import { FunctionComponent, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import * as styles from './Checkbox.module.css';

/**
 * Checkbox.
 * @param props Component properties.
 * @param props.labelText Label text.
 * @param props.labelHTML Label text as html.
 * @param props.color Color variant.
 * @param props.inputSize Size variant.
 * @param props.id Input id.
 * @param props.className Class names. (This applies to the top-level wrapper element)
 * @param props.wrapperProps Top-level wrapper properties.
 * @note Properties that are not explicitly stated here are passed to input element.
 * @returns Returns the component.
 */
const Checkbox: FunctionComponent<
    React.DetailedHTMLProps<
        React.InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
    > & {
        labelText?: string;
        labelHTML?: JSX.Element;
        color?:
            | 'red'
            | 'orange'
            | 'yellow'
            | 'green'
            | 'blue'
            | 'purple'
            | 'black';
        inputSize?: 'small' | 'large';
        wrapperProps?: React.DetailedHTMLProps<
            React.HTMLAttributes<HTMLDivElement>,
            HTMLDivElement
        >;
    }
> = function ({
    labelText,
    labelHTML,
    color,
    inputSize,
    id,
    className,
    wrapperProps,
    ...inputProps
}) {
    const wrapper = useRef<HTMLDivElement>(),
        checkbox = useRef<HTMLInputElement>();

    const classes = classNames(
        styles['checkbox-wrapper'],
        styles[color],
        styles[inputSize],
        className
    );

    return (
        <div
            {...wrapperProps}
            ref={wrapper}
            className={`${classes}${wrapperProps?.className ? ` ${wrapperProps?.className}` : ''}`}
            onClick={(event) => {
                if (event.target === wrapper.current && checkbox.current) {
                    const checkedState: boolean = checkbox.current.checked,
                        checkboxElement = checkbox.current;
                    checkboxElement.focus();
                    checkboxElement.checked = !checkedState;
                }
                if (wrapperProps?.onClick) wrapperProps.onClick(event);
            }}
        >
            <input
                ref={checkbox}
                type="checkbox"
                id={id}
                className={styles['input']}
                {...inputProps}
            />
            {(labelText || labelHTML) && (
                <label htmlFor={id}>
                    <span>{labelHTML || labelText}</span>
                </label>
            )}
        </div>
    );
};

Checkbox.propTypes = {
    labelText: PropTypes.string,
    labelHTML: PropTypes.any,
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
};

export default Checkbox;
