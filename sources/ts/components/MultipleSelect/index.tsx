/**
 * @file index.tsx
 * @description Multiple select.
 */

'use strict';
import {
    FunctionComponent,
    CSSProperties,
    useState,
    useEffect,
    useRef,
    useCallback,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import * as styles from './MultipleSelect.module.css';

type SelectOption = {
    id: string;
    text: string;
    value: string;
    selected?: boolean;
};

/**
 * Multiple select.
 * @param props Component properties.
 * @param props.initialOptions Options. (Each option id must be unique)
 * @param props.inputWidth Fixed width.
 * @param props.inputHeight Fixed height.
 * @param props.inputSize Size variant.
 * @param props.maxItemListHeight Max item list wrapper height. (In pixel)
 * @param props.onOptionsChange On value change callback.
 * @note Properties that are not explicitly stated here are passed to the top-level element.
 * @note Retrieve the current selected value by using dataset['value']
 * @returns Returns the component.
 */
const MultipleSelect: FunctionComponent<
    React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
    > & {
        initialOptions: SelectOption[];
        inputWidth?: number;
        inputHeight?: number;
        inputSize?: 'small' | 'large';
        maxItemListHeight?: number;
        onOptionsChange?: (newOptions: SelectOption[]) => void;
        disabled?: boolean;
    }
> = ({
    initialOptions,
    inputWidth,
    inputHeight,
    inputSize,
    maxItemListHeight,
    onOptionsChange,
    disabled = false,
    ...props
}) => {
    const select = useRef<HTMLDivElement>(null),
        selectItemList = useRef<HTMLDivElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [selectItemListTopPosition, setSelectItemListTopPosition] =
        useState<number>(0);

    const [options, setOptions] = useState(initialOptions);

    let style = props?.style || {};
    if (inputWidth) style.width = `${inputWidth}px`;
    if (inputHeight) style.height = `${inputHeight}px`;
    if (maxItemListHeight)
        style = {
            ...style,
            '--select-item-list-wrapper-max-height': `${maxItemListHeight}px`,
        } as unknown as CSSProperties;

    const handleUpdateOptions = useCallback(
        (
            optionId: SelectOption['id'],
            selectedState: SelectOption['selected']
        ) => {
            const newOptions = [...options];
            newOptions.every((value, index, array) => {
                if (value.id === optionId) {
                    array[index].selected = selectedState;
                    return false;
                }
                return true;
            });
            setOptions(newOptions);
        },
        [options]
    );

    useEffect(() => {
        if (isOpen === true) {
            selectItemList.current?.scrollTo({ behavior: 'instant', top: 0 });
            setSelectItemListTopPosition(
                selectItemList.current?.getBoundingClientRect()?.top || 0
            );
        }

        const handleBackgroundClick: HTMLElement['onclick'] = (event) => {
            if (!select.current?.contains(event.target as any))
                setIsOpen(false);
        };
        const handleEscapeKeyPress: HTMLDivElement['onkeydown'] = (event) => {
            if (isOpen && event.keyCode === 27) {
                setIsOpen(false);
            }
        };
        window.addEventListener('click', handleBackgroundClick);
        window.addEventListener('keydown', handleEscapeKeyPress);

        return () => {
            window.removeEventListener('click', handleBackgroundClick);
            window.removeEventListener('keydown', handleEscapeKeyPress);
        };
    }, [isOpen]);

    useEffect(() => {
        if (onOptionsChange)
            onOptionsChange(options?.filter((item) => !!item.selected));
    }, [options]);

    return (
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
            onBlur={() => setIsOpen(false)}
            onKeyDown={(event) => {
                switch (event?.keyCode) {
                    case 32:
                    case 13:
                        if (!disabled) setIsOpen(!isOpen);
                        break;
                }
            }}
        >
            <span
                className={classNames(styles['selected-items'], {
                    [styles['is-empty']]: !options?.filter(
                        (item) => !!item.selected
                    )?.length,
                })}
            >
                {options?.filter((item) => !!item.selected)?.length
                    ? options
                          ?.filter((item) => !!item.selected)
                          ?.map((item) => (
                              <span
                                  key={item.id}
                                  className={styles['selected-item']}
                              >
                                  {item?.text}
                              </span>
                          ))
                    : 'empty'}
            </span>
            <i className={classNames(styles['arrow'], 'fal fa-chevron-down')} />
            <div
                ref={selectItemList}
                className={styles['select-item-list-wrapper']}
                onClick={(event) => event.stopPropagation()}
                style={
                    !maxItemListHeight
                        ? {
                              maxHeight: selectItemListTopPosition
                                  ? `calc(100vh - ${selectItemListTopPosition}px - 12px)`
                                  : '0px',
                          }
                        : undefined
                }
            >
                {options?.length ? (
                    <ul className={styles['select-item-list']}>
                        {options &&
                            options.map((option) => {
                                return (
                                    <li
                                        key={option.id}
                                        className={classNames(
                                            styles['select-list-item'],
                                            {
                                                [styles['is-selected']]:
                                                    option?.selected,
                                            }
                                        )}
                                        onClick={() => {
                                            handleUpdateOptions(
                                                option.id,
                                                option.selected ? false : true
                                            );
                                        }}
                                    >
                                        {option.text}
                                    </li>
                                );
                            })}
                    </ul>
                ) : null}
                {!options?.length && (
                    <span className={styles['select-item-list-empty-text']}>
                        Không có lựa chọn nào
                    </span>
                )}
            </div>
        </div>
    );
};

MultipleSelect.propTypes = {
    initialOptions: PropTypes.any.isRequired,
    inputWidth: PropTypes.number,
    inputHeight: PropTypes.number,
    inputSize: PropTypes.oneOf(['small', 'large']),
    maxItemListHeight: PropTypes.number,
    onOptionsChange: PropTypes.func,
};

export default MultipleSelect;
