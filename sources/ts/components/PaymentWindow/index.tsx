/**
 * @file index.tsx
 * @desc Payment window (PopupWindow wrapper)
 */

'use strict';
import type { CartItem } from '@sources/ts/types/VyFood';
import {
    FunctionComponent,
    useEffect,
    useState,
    useRef,
    useCallback,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useVyFood } from '@sources/ts/hooks/useVyFood';
import { useModal } from '@sources/ts/hooks/useModal';
import { showToast } from '@sources/ts/components/Toast';
import apis from '@sources/ts/apis';
import PopupWindow, { PopupRender } from '@sources/ts/components/PopupWindow';
import Button from '@sources/ts/components/Button';
import Input from '@sources/ts/components/Input';
import Radio from '@sources/ts/components/Radio';
import CustomSelect from '@sources/ts/components/CustomSelect';
import * as styles from './PaymentWindow.module.css';
import { CircleCheck } from '../Icons/CircleCheck';
import staticTexts from '../../render/static-texts';
const texts = staticTexts.paymentWindow;

/**
 * Payment window (PopupWindow wrapper)
 * @param props Component properties.
 * @param props.children Component children.
 * @returns Returns the component.
 */
const PaymentWindow: FunctionComponent<{
    children: React.ReactElement<
        any,
        string | React.JSXElementConstructor<any>
    >;
}> = ({ children }) => {
    const { cartItems, setCartItems, handleRefreshProduct } = useVyFood();
    const { setModal, setModalVisibility } = useModal();

    const goBackButton = useRef<HTMLButtonElement>(),
        placeOrderButton = useRef<HTMLButtonElement>();

    const [isPending, setIsPending] = useState(false);

    const [parsedCartItems, setParsedCartItems] = useState<CartItem[]>(null);

    const [deliveryMethod, setDeliveryMethod] = useState<'shipping' | 'pickup'>(
        'shipping'
    );

    const [subtotal, setSubtotal] = useState(0),
        [total, setTotal] = useState(0);

    const handlePlaceOrder = useCallback(() => {
        if (isPending) return;
        setIsPending(true);
        (async () => {
            document
                .querySelectorAll(`.${styles['form-message']}`)
                .forEach((element) => {
                    element.innerHTML = '';
                });

            const customerNameInput = document.getElementById(
                    'customer-name-input'
                ) as HTMLInputElement,
                customerPhoneNumberInput = document.getElementById(
                    'customer-phone-number-input'
                ) as HTMLInputElement,
                deliveryAddressInput = document.getElementById(
                    'delivery-address-input'
                ) as HTMLInputElement;

            let formValid = true,
                focusElement: HTMLInputElement = null;

            if (customerNameInput && !customerNameInput?.value) {
                document.getElementById(
                    'customer-name-input-form-message'
                ).innerHTML = texts.customerNameInputFormMessageRequire;
                formValid = false;
                if (!focusElement) focusElement = customerNameInput;
            }

            if (customerPhoneNumberInput && !customerPhoneNumberInput?.value) {
                document.getElementById(
                    'customer-phone-number-input-form-message'
                ).innerHTML = texts.customerPhoneNumberInputFormMessageRequire;
                formValid = false;
                if (!focusElement) focusElement = customerPhoneNumberInput;
            }

            if (deliveryAddressInput && !deliveryAddressInput?.value) {
                document.getElementById(
                    'delivery-address-input-form-message'
                ).innerHTML = texts.customerAddressInputFormMessageRequire;
                formValid = false;
                if (!focusElement) focusElement = deliveryAddressInput;
            }

            if (!formValid) {
                setIsPending(false);
                focusElement?.focus();
                return;
            }

            const deliveryTime = new Date(Date.now());
            deliveryTime?.setHours(
                parseInt(
                    (
                        document.getElementById(
                            'delivery-time-select'
                        ) as HTMLDivElement
                    )?.dataset['value']
                ),
                0,
                0,
                0
            );

            const { message, success, statusCode } =
                await apis.backend.createOrder(
                    deliveryMethod,
                    customerNameInput?.value,
                    customerPhoneNumberInput?.value,
                    parsedCartItems,
                    deliveryAddressInput?.value,
                    (
                        document.querySelector(
                            'input[name="delivery-time-group"]:checked'
                        ) as HTMLInputElement
                    )?.value === 'now'
                        ? undefined
                        : deliveryTime?.getTime(),
                    (
                        document.querySelector(
                            'input[name="pickup-location-group"]:checked'
                        ) as HTMLInputElement
                    )?.value,
                    (
                        document.getElementById(
                            'payment-checkout-note-input'
                        ) as HTMLTextAreaElement
                    )?.value
                );
            if (!success) {
                if (statusCode === 409) {
                    showToast({
                        variant: 'primary',
                        title: texts.cartItemsUpdatedToast.title,
                        message: texts.cartItemsUpdatedToast.message,
                        duration: 10000,
                    });
                    const newProducts = await handleRefreshProduct(),
                        mappedProducts: any = newProducts?.reduce(
                            (acc: any, product) => {
                                acc[product?.slug] = product;
                                return acc;
                            },
                            {}
                        );
                    const newCartItems = parsedCartItems
                        ?.map((cartItem) => {
                            if (!mappedProducts[cartItem?.product?.slug])
                                return null;
                            if (
                                cartItem?.product?.price !==
                                mappedProducts[cartItem?.product?.slug]?.price
                            )
                                cartItem.product.price =
                                    mappedProducts[
                                        cartItem?.product?.slug
                                    ]?.price;
                            return cartItem;
                        })
                        .filter((cartItem) => !!cartItem);
                    if (!newCartItems?.length) {
                        setCartItems(JSON.stringify([]));
                        goBackButton?.current?.click();
                        setIsPending(false);
                        return;
                    }
                    setCartItems(JSON.stringify(newCartItems));
                    setTimeout(() => setIsPending(false), 300);
                    return;
                }

                console.error(message);
                showToast({
                    variant: 'danger',
                    title: staticTexts.toast.errorDefaultTitle,
                    message: message,
                    duration: 5000,
                });
                setIsPending(false);
                return;
            }

            setCartItems(JSON.stringify([]));
            setIsPending(false);
            setModalVisibility(false);
            goBackButton?.current?.click();
            setTimeout(() => {
                setModal({
                    type: 'alert',
                    title: texts.placeOrderSuccessWindow.title,
                    icon: CircleCheck,
                    iconColor: 'var(--color-primary)',
                    message: texts.placeOrderSuccessWindow.message,
                    closeButtonText: texts.placeOrderSuccessWindow.closeButton,
                    preventCloseOnBackgroundClick: true,
                    preventCloseOnEscapeKeyPress: true,
                });
            }, 351);
        })();
    }, [parsedCartItems, deliveryMethod, isPending]);

    useEffect(() => {
        if (cartItems) setParsedCartItems(JSON.parse(cartItems) || []);
    }, [cartItems]);

    useEffect(() => {
        if (parsedCartItems && parsedCartItems.length) {
            const tSubtotal = parsedCartItems?.reduce(
                (totalCost, cartItem) =>
                    totalCost + cartItem.product.price * cartItem.totalItems,
                0
            );
            if (tSubtotal) {
                setSubtotal(tSubtotal);
                setTotal(
                    deliveryMethod === 'shipping'
                        ? tSubtotal + 30000
                        : tSubtotal
                );
            }
        } else {
            setSubtotal(0);
            setTotal(0);
        }
    }, [parsedCartItems, deliveryMethod]);

    useEffect(() => {
        document
            .querySelectorAll(`.${styles['form-message']}`)
            .forEach((element) => {
                element.innerHTML = '';
            });
    }, [deliveryMethod]);

    useEffect(() => {
        const handleEscapeKeyPress: HTMLDivElement['onkeydown'] = (event) => {
            if (event.keyCode === 27 && goBackButton?.current)
                goBackButton?.current?.click();
        };

        window.addEventListener('keydown', handleEscapeKeyPress);
        return () => {
            window.removeEventListener('keydown', handleEscapeKeyPress);
        };
    }, []);

    return (
        <PopupWindow
            interactive
            appendTo={document.getElementById('app')}
            trigger="click"
            hideOnClick={false}
            popperOptions={{
                strategy: 'fixed',
                modifiers: [
                    {
                        name: 'popperOffsets',
                        enabled: false,
                    },
                ],
            }}
            customAnimation={{
                classIn: styles['animation-transition-in'],
                classOut: styles['animation-transition-out'],
                outAnimationName: styles['slide-out'],
            }}
            render={(attrs, content, instance) => (
                <PopupRender className={styles['payment-window']}>
                    <div className={styles['payment-window-header']}>
                        <button
                            ref={goBackButton}
                            className={styles['back-button']}
                            onClick={() => instance?.hide()}
                        >
                            <i className={classNames('far fa-chevron-left')} />
                        </button>
                        <span className={styles['header-title']}>
                            {texts.title}
                        </span>
                    </div>
                    <div className={styles['payment-window-body']}>
                        <form
                            className={styles['content-wrapper']}
                            onSubmit={(event) => event.preventDefault()}
                        >
                            <div className={styles['order-info-content']}>
                                <div className={styles['order-info-card']}>
                                    <div
                                        className={
                                            styles['order-info-card-header']
                                        }
                                    >
                                        <span
                                            className={
                                                styles[
                                                    'order-info-card-header-title'
                                                ]
                                            }
                                        >
                                            {texts.orderInfoCard.title}
                                        </span>
                                    </div>
                                    <div
                                        className={
                                            styles['order-info-card-body']
                                        }
                                    >
                                        <div
                                            className={
                                                styles['order-card-form-group']
                                            }
                                        >
                                            <label
                                                className={
                                                    styles['order-card-label']
                                                }
                                                style={{
                                                    userSelect: 'none',
                                                }}
                                            >
                                                {
                                                    texts.orderInfoCard
                                                        .deliveryMethodLabel
                                                }
                                            </label>
                                            <div
                                                className={
                                                    styles[
                                                        'delivery-method-buttons-wrapper'
                                                    ]
                                                }
                                            >
                                                <button
                                                    className={classNames(
                                                        styles[
                                                            'delivery-method-button'
                                                        ],
                                                        styles[
                                                            'delivery-method-button-shipping'
                                                        ],
                                                        {
                                                            [styles[
                                                                'is-selected'
                                                            ]]:
                                                                deliveryMethod ===
                                                                'shipping',
                                                        }
                                                    )}
                                                    onClick={() =>
                                                        setDeliveryMethod(
                                                            'shipping'
                                                        )
                                                    }
                                                    type="button"
                                                >
                                                    <i
                                                        className={classNames(
                                                            'fa-duotone fa-moped'
                                                        )}
                                                    />
                                                    {
                                                        texts.orderInfoCard
                                                            .shippingMethod
                                                    }
                                                </button>
                                                <button
                                                    className={classNames(
                                                        styles[
                                                            'delivery-method-button'
                                                        ],
                                                        styles[
                                                            'delivery-method-button-pickup'
                                                        ],
                                                        {
                                                            [styles[
                                                                'is-selected'
                                                            ]]:
                                                                deliveryMethod ===
                                                                'pickup',
                                                        }
                                                    )}
                                                    onClick={() =>
                                                        setDeliveryMethod(
                                                            'pickup'
                                                        )
                                                    }
                                                    type="button"
                                                >
                                                    <i
                                                        className={classNames(
                                                            'fa-duotone fa-box-heart'
                                                        )}
                                                    />
                                                    {
                                                        texts.orderInfoCard
                                                            .pickupMethod
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                        {deliveryMethod === 'shipping' && (
                                            <div
                                                className={
                                                    styles[
                                                        'order-card-form-group'
                                                    ]
                                                }
                                            >
                                                {' '}
                                                <label
                                                    className={
                                                        styles[
                                                            'order-card-label'
                                                        ]
                                                    }
                                                    style={{
                                                        userSelect: 'none',
                                                    }}
                                                >
                                                    {
                                                        texts.orderInfoCard
                                                            .deliveryTimeLabel
                                                    }
                                                </label>
                                                <Radio
                                                    id="delivery-time-radio-now"
                                                    className={
                                                        styles[
                                                            'delivery-time-radio'
                                                        ]
                                                    }
                                                    name="delivery-time-group"
                                                    labelText={
                                                        texts.orderInfoCard
                                                            .deliveryNow
                                                    }
                                                    inputSize="large"
                                                    value="now"
                                                    defaultChecked
                                                />
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexFlow: 'row nowrap',
                                                        alignItems: 'center',
                                                        columnGap: '16px',
                                                        marginTop: '-8px',
                                                    }}
                                                >
                                                    <Radio
                                                        id="delivery-time-radio-at"
                                                        className={
                                                            styles[
                                                                'delivery-time-radio'
                                                            ]
                                                        }
                                                        name="delivery-time-group"
                                                        labelText={
                                                            texts.orderInfoCard
                                                                .deliveryTime
                                                        }
                                                        inputSize="large"
                                                        value="at"
                                                    />
                                                    <CustomSelect
                                                        options={[
                                                            {
                                                                id: '8am',
                                                                text: '08:00 - 09:00',
                                                                value: '8',
                                                            },
                                                            {
                                                                id: '9am',
                                                                text: '09:00 - 10:00',
                                                                value: '9',
                                                            },
                                                            {
                                                                id: '10am',
                                                                text: '10:00 - 11:00',
                                                                value: '10',
                                                            },
                                                            {
                                                                id: '11am',
                                                                text: '11:00 - 12:00',
                                                                value: '11',
                                                            },
                                                            {
                                                                id: '12pm',
                                                                text: '12:00 - 13:00',
                                                                value: '12',
                                                            },
                                                            {
                                                                id: '13pm',
                                                                text: '13:00 - 14:00',
                                                                value: '13',
                                                            },
                                                            {
                                                                id: '14pm',
                                                                text: '14:00 - 15:00',
                                                                value: '14',
                                                            },
                                                            {
                                                                id: '15pm',
                                                                text: '15:00 - 16:00',
                                                                value: '15',
                                                            },
                                                            {
                                                                id: '16pm',
                                                                text: '16:00 - 17:00',
                                                                value: '16',
                                                            },
                                                            {
                                                                id: '17pm',
                                                                text: '17:00 - 18:00',
                                                                value: '17',
                                                            },
                                                            {
                                                                id: '18pm',
                                                                text: '18:00 - 19:00',
                                                                value: '18',
                                                            },
                                                            {
                                                                id: '19pm',
                                                                text: '19:00 - 20:00',
                                                                value: '19',
                                                            },
                                                            {
                                                                id: '20pm',
                                                                text: '20:00 - 21:00',
                                                                value: '20',
                                                            },
                                                            {
                                                                id: '21pm',
                                                                text: '21:00 - 22:00',
                                                                value: '21',
                                                            },
                                                        ]?.filter((item) => {
                                                            const now =
                                                                    new Date(
                                                                        Date.now()
                                                                    ),
                                                                currentHour =
                                                                    now?.getHours();
                                                            if (
                                                                parseInt(
                                                                    item?.value
                                                                ) -
                                                                    1 <
                                                                currentHour
                                                            )
                                                                return false;

                                                            return true;
                                                        })}
                                                        defaultOption="8am"
                                                        id="delivery-time-select"
                                                        maxItemListHeight={200}
                                                        tippyAppendTo={'parent'}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {deliveryMethod === 'pickup' && (
                                            <div
                                                className={
                                                    styles[
                                                        'order-card-form-group'
                                                    ]
                                                }
                                            >
                                                <label
                                                    className={
                                                        styles[
                                                            'order-card-label'
                                                        ]
                                                    }
                                                    style={{
                                                        userSelect: 'none',
                                                    }}
                                                >
                                                    {
                                                        texts.orderInfoCard
                                                            .pickupAtLabel
                                                    }
                                                </label>
                                                <Radio
                                                    id="pickup-location-1"
                                                    className={
                                                        styles[
                                                            'pickup-location-radio'
                                                        ]
                                                    }
                                                    name="pickup-location-group"
                                                    value={
                                                        texts.orderInfoCard
                                                            .pickupLocation1
                                                    }
                                                    labelText={
                                                        texts.orderInfoCard
                                                            .pickupLocation1
                                                    }
                                                    inputSize="large"
                                                    defaultChecked
                                                />
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexFlow: 'row nowrap',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <Radio
                                                        id="pickup-location-2"
                                                        className={
                                                            styles[
                                                                'pickup-location-radio'
                                                            ]
                                                        }
                                                        name="pickup-location-group"
                                                        value={
                                                            texts.orderInfoCard
                                                                .pickupLocation2
                                                        }
                                                        labelText={
                                                            texts.orderInfoCard
                                                                .pickupLocation2
                                                        }
                                                        inputSize="large"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <div
                                            className={
                                                styles['order-card-form-group']
                                            }
                                        >
                                            <label
                                                htmlFor="payment-checkout-note-input"
                                                className={
                                                    styles['order-card-label']
                                                }
                                                style={{
                                                    cursor: 'pointer',
                                                    userSelect: 'none',
                                                }}
                                            >
                                                {
                                                    texts.orderInfoCard
                                                        .orderNoteLabel
                                                }
                                            </label>
                                            <textarea
                                                id="payment-checkout-note-input"
                                                className={
                                                    styles['notebox-input']
                                                }
                                                placeholder={
                                                    texts.orderInfoCard
                                                        .orderNotePlaceholder
                                                }
                                                spellCheck={false}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className={styles['order-delivery-card']}>
                                    <div
                                        className={
                                            styles['order-delivery-card-header']
                                        }
                                    >
                                        <span
                                            className={
                                                styles[
                                                    'order-delivery-card-header-title'
                                                ]
                                            }
                                        >
                                            {texts.deliveryInfoCard.title}
                                        </span>
                                    </div>
                                    <div
                                        className={
                                            styles['order-delivery-card-body']
                                        }
                                    >
                                        <Input
                                            id="customer-name-input"
                                            type="text"
                                            placeholder={
                                                texts.deliveryInfoCard
                                                    .customerNameInputPlaceholder
                                            }
                                            spellCheck={false}
                                            height={40}
                                            onBlur={(event) => {
                                                const formMessage =
                                                    document.getElementById(
                                                        'customer-name-input-form-message'
                                                    );
                                                if (formMessage) {
                                                    if (
                                                        !event?.currentTarget
                                                            ?.value
                                                    )
                                                        formMessage.innerHTML =
                                                            texts.customerNameInputFormMessageRequire;
                                                    else
                                                        formMessage.innerHTML =
                                                            '';
                                                }
                                            }}
                                        />
                                        <span
                                            id="customer-name-input-form-message"
                                            className={styles['form-message']}
                                        ></span>
                                        <Input
                                            id="customer-phone-number-input"
                                            type="tel"
                                            spellCheck={false}
                                            placeholder={
                                                texts.deliveryInfoCard
                                                    .customerPhoneNumberInputPlaceholder
                                            }
                                            height={40}
                                            onBlur={(event) => {
                                                const formMessage =
                                                    document.getElementById(
                                                        'customer-phone-number-input-form-message'
                                                    );
                                                if (formMessage) {
                                                    if (
                                                        !event?.currentTarget
                                                            ?.value
                                                    )
                                                        formMessage.innerHTML =
                                                            texts.customerPhoneNumberInputFormMessageRequire;
                                                    else
                                                        formMessage.innerHTML =
                                                            '';
                                                }
                                            }}
                                            onKeyDown={(event) => {
                                                if (
                                                    deliveryMethod ===
                                                        'pickup' &&
                                                    event.key === 'Enter'
                                                ) {
                                                    event.preventDefault();
                                                    placeOrderButton?.current?.focus();
                                                }
                                            }}
                                        />
                                        <span
                                            id="customer-phone-number-input-form-message"
                                            className={styles['form-message']}
                                        ></span>
                                        {deliveryMethod === 'shipping' && (
                                            <>
                                                <Input
                                                    id="delivery-address-input"
                                                    type="text"
                                                    spellCheck={false}
                                                    placeholder={
                                                        texts.deliveryInfoCard
                                                            .customerAddressInputPlaceholder
                                                    }
                                                    height={40}
                                                    onBlur={(event) => {
                                                        const formMessage =
                                                            document.getElementById(
                                                                'delivery-address-input-form-message'
                                                            );
                                                        if (formMessage) {
                                                            if (
                                                                !event
                                                                    ?.currentTarget
                                                                    ?.value
                                                            )
                                                                formMessage.innerHTML =
                                                                    texts.customerAddressInputFormMessageRequire;
                                                            else
                                                                formMessage.innerHTML =
                                                                    '';
                                                        }
                                                    }}
                                                    onKeyDown={(event) => {
                                                        if (
                                                            event.key ===
                                                            'Enter'
                                                        ) {
                                                            event.preventDefault();
                                                            placeOrderButton?.current?.focus();
                                                        }
                                                    }}
                                                />
                                                <span
                                                    id="delivery-address-input-form-message"
                                                    className={
                                                        styles['form-message']
                                                    }
                                                ></span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className={styles['order-invoice-content']}>
                                <div className={styles['order-invoice-card']}>
                                    <span className={styles['invoice-label']}>
                                        {texts.invoiceCard.title}
                                    </span>
                                    <ul className={styles['cart-list']}>
                                        {parsedCartItems?.map((cartItem) => (
                                            <li
                                                key={cartItem.id}
                                                className={styles['cart-item']}
                                            >
                                                <span
                                                    className={
                                                        styles[
                                                            'cart-item-amount'
                                                        ]
                                                    }
                                                >
                                                    {`${cartItem?.totalItems}x`}
                                                </span>
                                                <span
                                                    className={
                                                        styles['cart-item-name']
                                                    }
                                                >
                                                    {cartItem?.product?.name}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className={styles['bill-info']}>
                                        <div
                                            className={styles['bill-subtotal']}
                                        >
                                            <div
                                                className={
                                                    styles[
                                                        'bill-subtotal-label'
                                                    ]
                                                }
                                            >
                                                <span
                                                    className={
                                                        styles[
                                                            'bill-subtotal-label-text'
                                                        ]
                                                    }
                                                >
                                                    {
                                                        texts.invoiceCard
                                                            .subtotalLabel
                                                    }
                                                </span>
                                                <span
                                                    className={
                                                        styles[
                                                            'bill-subtotal-label-total-items'
                                                        ]
                                                    }
                                                >
                                                    {`${parsedCartItems?.reduce((totalItems, cartItem) => totalItems + cartItem.totalItems, 0)} ${texts.invoiceCard.subtotalLabelUnit}`}
                                                </span>
                                            </div>
                                            <span
                                                className={
                                                    styles[
                                                        'bill-subtotal-number'
                                                    ]
                                                }
                                            >
                                                {`${subtotal
                                                    .toString()
                                                    .replace(
                                                        /\B(?=(\d{3})+(?!\d))/g,
                                                        '.'
                                                    )} ₫`}
                                            </span>
                                        </div>
                                        {deliveryMethod === 'shipping' && (
                                            <div
                                                className={
                                                    styles['bill-shipping-fee']
                                                }
                                            >
                                                <span
                                                    className={
                                                        styles[
                                                            'bill-shipping-fee-label-text'
                                                        ]
                                                    }
                                                >
                                                    {
                                                        texts.invoiceCard
                                                            .shippingFeeLabel
                                                    }
                                                </span>
                                                <span
                                                    className={
                                                        styles[
                                                            'bill-shipping-fee-number'
                                                        ]
                                                    }
                                                >
                                                    {
                                                        texts.invoiceCard
                                                            .shippingFee
                                                    }
                                                </span>
                                            </div>
                                        )}
                                        <span
                                            className={styles['agreement-text']}
                                        >
                                            {texts.invoiceCard.agreementText1}{' '}
                                            <a
                                                className={
                                                    styles['agreement-link']
                                                }
                                                href="#"
                                                target="_blank"
                                                tabIndex={-1}
                                            >
                                                {
                                                    texts.invoiceCard
                                                        .agreementTextLink
                                                }
                                            </a>{' '}
                                            {texts.invoiceCard.agreementText2}
                                        </span>
                                    </div>
                                    <div className={styles['total-checkout']}>
                                        <span
                                            className={
                                                styles['total-checkout-label']
                                            }
                                        >
                                            {texts.invoiceCard.totalLabel}
                                        </span>
                                        <span
                                            className={
                                                styles['total-checkout-number']
                                            }
                                        >
                                            {`${total
                                                .toString()
                                                .replace(
                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                    '.'
                                                )} ₫`}
                                        </span>
                                    </div>
                                    <Button
                                        ref={placeOrderButton}
                                        height={40}
                                        onClick={() => handlePlaceOrder()}
                                        loading={isPending}
                                        disabled={isPending}
                                        type="submit"
                                    >
                                        {texts.invoiceCard.placeOrderButton}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </PopupRender>
            )}
        >
            {children}
        </PopupWindow>
    );
};

PaymentWindow.propTypes = {
    children: PropTypes.any.isRequired,
};

export default PaymentWindow;
