/**
 * @file index.tsx
 * @description Radio.
 */

'use strict';
import { FunctionComponent, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import * as styles from './Radio.module.css';

/**
 * Radio.
 * @param props Component properties.
 * @param props.labelText Label text.
 * @param props.color Color variant.
 * @param props.inputSize Size variant.
 * @param props.id Input id.
 * @param props.className Class names. (This applies to the top-level wrapper element)
 * @param props.wrapperProps Top-level wrapper properties.
 * @note Properties that are not explicitly stated here are passed to input element.
 * @returns Returns the component.
 */
const Radio: FunctionComponent<
    React.DetailedHTMLProps<
        React.InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
    > & {
        labelText?: string;
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
    color,
    inputSize,
    id,
    className,
    wrapperProps,
    ...inputProps
}) {
    const wrapper = useRef<HTMLDivElement>(),
        radio = useRef<HTMLInputElement>();

    const classes = classNames(
        styles['radio-wrapper'],
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
                if (event.target === wrapper.current && radio.current) {
                    const radioElement = radio.current;
                    radioElement.focus();
                    radioElement.checked = true;
                }
                if (wrapperProps?.onClick) wrapperProps.onClick(event);
            }}
        >
            <input
                ref={radio}
                className={styles['input']}
                id={id}
                type="radio"
                {...inputProps}
            />
            {labelText && (
                <label htmlFor={id}>
                    <span>{labelText}</span>
                </label>
            )}
        </div>
    );
};

Radio.propTypes = {
    labelText: PropTypes.string,
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

export default Radio;
