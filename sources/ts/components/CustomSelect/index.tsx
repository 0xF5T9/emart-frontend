/**
 * @file index.tsx
 * @description Custom select.
 */

'use strict';
import {
    FunctionComponent,
    CSSProperties,
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import PopupWindow, { PopupRender } from '@sources/ts/components/PopupWindow';
import staticTexts from '@sources/ts/render/static-texts';
import * as styles from './CustomSelect.module.css';

export type SelectOption = {
    id: string;
    text: string;
    value: string;
    selected?: boolean;
};

/**
 * Custom select.
 * @param props Component properties.
 * @param props.options Options. (Each option id must be unique)
 * @param props.defaultOption Default option. (id)
 * @param props.inputWidth Fixed width.
 * @param props.inputHeight Fixed height.
 * @param props.inputSize Size variant.
 * @param props.maxItemListHeight Max item list wrapper height. (In pixel)
 * @param props.onOptionChange Callback function invoked before the new select option is changed. Returns false in the callback will cancel the change option event.
 * @param props.dropdownProps Props that will be passed to the select dropdown window div element.
 * @param props.tippyAppendTo Tippy appendTo property that apply to the dropdown window. (default: document.body)
 * @note Properties that are not explicitly stated here are passed to the top-level element.
 * @note Retrieve the current selected value by using dataset['value']
 * @returns Returns the component.
 */
const CustomSelect: FunctionComponent<
    React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
    > & {
        options: SelectOption[];
        defaultOption?: SelectOption['id'];
        inputWidth?: number;
        inputHeight?: number;
        inputSize?: 'small' | 'large';
        maxItemListHeight?: number;
        onOptionChange?: (newOption: SelectOption) => Promise<boolean>;
        disabled?: boolean;
        dropdownProps?: React.DetailedHTMLProps<
            React.HTMLAttributes<HTMLDivElement>,
            HTMLDivElement
        >;
        tippyAppendTo?: Element | 'parent' | ((ref: Element) => Element);
    }
> = ({
    options,
    defaultOption,
    inputWidth,
    inputHeight,
    inputSize,
    maxItemListHeight,
    onOptionChange,
    disabled = false,
    dropdownProps,
    tippyAppendTo = document.body,
    ...props
}) => {
    const resizeObserverTimeoutId = useRef<NodeJS.Timeout>(null);

    const select = useRef<HTMLDivElement>(null),
        selectItemList = useRef<HTMLDivElement>(null),
        selectedListItem = useRef<HTMLLIElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [selectDivWidth, setSelectDivWidth] = useState<number>(0);

    const [selectedOption, setSelectedOption] = useState(() => {
        if (!options?.length) return { id: '', text: '', value: '' };

        const findDefaultOption = options.find(
            (option) => option?.id === defaultOption
        );
        return findDefaultOption || options[0];
    });

    let style = props?.style || {};
    if (inputWidth) style.width = `${inputWidth}px`;
    if (inputHeight) style.height = `${inputHeight}px`;

    let dStyle: CSSProperties = { ...dropdownProps?.style };
    dStyle.width = `${selectDivWidth || 0}px`;
    if (maxItemListHeight)
        dStyle = {
            ...dStyle,
            '--select-item-list-wrapper-max-height': `${maxItemListHeight}px`,
        } as unknown as CSSProperties;

    useEffect(() => {
        const handleEscapeKeyPress: HTMLDivElement['onkeydown'] = (event) => {
            if (isOpen && event.keyCode === 27) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleEscapeKeyPress);

        return () => {
            window.removeEventListener('keydown', handleEscapeKeyPress);
        };
    }, [isOpen]);

    useEffect(() => {
        if (options?.length) {
            options.every((value) => {
                if (value?.selected === true) setSelectedOption(value);
                return true;
            });
        }
        if (
            options?.length &&
            !options
                ?.map((option) => option.value)
                .includes(selectedOption?.value)
        )
            setSelectedOption(options[0]);
    }, [options]);

    useEffect(() => {
        setSelectDivWidth(select?.current?.offsetWidth);
    }, []);

    useLayoutEffect(() => {
        function handleSelectDivResize() {
            if (resizeObserverTimeoutId?.current)
                clearTimeout(resizeObserverTimeoutId.current);

            resizeObserverTimeoutId.current = setTimeout(() => {
                setSelectDivWidth(select?.current?.offsetWidth);
            }, 1);
        }

        const observer = new ResizeObserver(handleSelectDivResize);
        observer?.observe(select?.current);

        return () => {
            observer?.disconnect();
        };
    }, []);

    return (
        <PopupWindow
            interactive
            visible={isOpen}
            placement="bottom"
            offset={[0, 4]}
            appendTo={tippyAppendTo}
            disableAnimation={true}
            onClickOutside={() => setIsOpen(false)}
            render={(attrs, content, instance) => (
                <PopupRender className={styles['popup-wrapper']}>
                    <div
                        {...dropdownProps}
                        ref={selectItemList}
                        className={classNames(
                            styles['select-item-list-wrapper'],
                            dropdownProps?.className
                        )}
                        style={dStyle}
                        onClick={(event) => {
                            event.stopPropagation();
                            if (dropdownProps?.onClick)
                                dropdownProps.onClick(event);
                        }}
                    >
                        {options?.length ? (
                            <ul className={styles['select-item-list']}>
                                {options &&
                                    options.map((option) => {
                                        return (
                                            <li
                                                key={option.id}
                                                ref={
                                                    selectedOption?.id ===
                                                    option?.id
                                                        ? selectedListItem
                                                        : undefined
                                                }
                                                className={classNames(
                                                    styles['select-list-item'],
                                                    {
                                                        [styles['is-selected']]:
                                                            selectedOption?.id ===
                                                            option?.id,
                                                    }
                                                )}
                                                onClick={() => {
                                                    (async () => {
                                                        if (
                                                            onOptionChange &&
                                                            option?.value !==
                                                                selectedOption?.value
                                                        ) {
                                                            const isCanceled =
                                                                !(await onOptionChange(
                                                                    option
                                                                ));
                                                            if (isCanceled) {
                                                                setIsOpen(
                                                                    false
                                                                );
                                                                return;
                                                            }
                                                        }

                                                        setSelectedOption(
                                                            option
                                                        );
                                                    })();
                                                    setIsOpen(false);
                                                }}
                                            >
                                                {option.text}
                                            </li>
                                        );
                                    })}
                            </ul>
                        ) : null}
                        {!options?.length && (
                            <span
                                className={
                                    styles['select-item-list-empty-text']
                                }
                            >
                                {staticTexts.components.select.emptyText}
                            </span>
                        )}
                    </div>
                </PopupRender>
            )}
        >
            <div
                ref={select}
                tabIndex={disabled ? -1 : 0}
                {...props}
                className={classNames(
                    styles['select'],
                    props?.className,
                    styles[inputSize],
                    { [styles['disabled']]: disabled },
                    {
                        [styles['is-open']]: isOpen,
                    }
                )}
                style={style}
                onClick={() => {
                    if (!disabled) setIsOpen(!isOpen);
                }}
                onKeyDown={(event) => {
                    (async () => {
                        switch (event?.keyCode) {
                            case 38:
                                event.preventDefault();
                                if (!options.length) return;

                                options?.every(async (value, index) => {
                                    if (value?.id === selectedOption.id) {
                                        const newOption =
                                            options[
                                                index - 1 < 0
                                                    ? options.length - 1
                                                    : index - 1
                                            ];
                                        if (onOptionChange) {
                                            const isCanceled =
                                                !(await onOptionChange(
                                                    newOption
                                                ));
                                            if (isCanceled) {
                                                return;
                                            }
                                        }
                                        setSelectedOption(newOption);
                                        return false;
                                    }
                                    return true;
                                });
                                break;
                            case 40:
                                event.preventDefault();
                                if (!options.length) return;

                                options?.every(async (value, index) => {
                                    if (value?.id === selectedOption.id) {
                                        const newOption =
                                            options[
                                                index + 1 > options?.length - 1
                                                    ? 0
                                                    : index + 1
                                            ];
                                        if (onOptionChange) {
                                            const isCanceled =
                                                !(await onOptionChange(
                                                    newOption
                                                ));
                                            if (isCanceled) {
                                                return;
                                            }
                                        }
                                        setSelectedOption(newOption);
                                        return false;
                                    }
                                    return true;
                                });
                                break;
                            case 32:
                            case 13:
                                if (!disabled) setIsOpen(!isOpen);
                                break;
                        }
                    })();
                }}
                data-value={selectedOption?.value}
            >
                <span
                    className={classNames(styles['selected-item-text'], {
                        [styles['is-empty']]: !options?.length,
                    })}
                >
                    {options?.length ? selectedOption.text : 'empty'}
                </span>
                <i
                    className={classNames(
                        styles['arrow'],
                        'fal fa-chevron-down'
                    )}
                />
            </div>
        </PopupWindow>
    );
};

CustomSelect.propTypes = {
    options: PropTypes.any,
    defaultOption: PropTypes.string,
    inputWidth: PropTypes.number,
    inputHeight: PropTypes.number,
    inputSize: PropTypes.oneOf(['small', 'large']),
    maxItemListHeight: PropTypes.number,
    onOptionChange: PropTypes.func,
    dropdownProps: PropTypes.object,
    tippyAppendTo: PropTypes.any,
};

export default CustomSelect;
