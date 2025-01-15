/**
 * @file index.tsx
 * @description Order details modal window.
 */

'use strict';

import type { Order } from '@sources/ts/apis/emart/types';
import type { TOrder } from '../..';
import {
    FunctionComponent,
    CSSProperties,
    useState,
    useRef,
    useCallback,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import PopupWindow from '@sources/ts/components/PopupWindow';
import { useModal } from '@sources/ts/hooks/useModal';
import apis from '@sources/ts/apis';
import { showToast } from '@sources/ts/components/Toast';
import CustomSelect from '@sources/ts/components/CustomSelect';
import Button from '@sources/ts/components/Button';
import * as styles from './OrderDetailsModalWindow.module.css';
import staticTexts from '@sources/ts/render/static-texts';
import staticUrls from '@sources/ts/render/static-urls';
const texts = staticTexts.adminSection.orders.orderDetailsWindow;

/**
 * Order details modal window.
 * @param props Component properties.
 * @param props.orderItem Order item.
 * @param props.refreshCallback Refresh callback.
 * @returns Returns the component.
 */
const OrderDetailsModalWindow: FunctionComponent<{
    orderItem: TOrder;
    refreshCallback?: (silentFetch?: boolean) => void;
}> = ({ orderItem, refreshCallback }) => {
    const { setModal, setModalVisibility } = useModal();

    const modalWindow = useRef<HTMLDivElement>(null);

    const [isPending, setIsPending] = useState(false);

    const [items, setItems] = useState(orderItem?.items);

    const handleUpdateStatus = useCallback(
        async (newStatus: string) => {
            if (isPending) return false;
            setIsPending(true);

            const { message, success } = await apis.emart.updateOrder(
                orderItem?.orderId,
                newStatus as any
            );
            if (!success) {
                console.error(message);
                showToast({
                    variant: 'danger',
                    title: staticTexts.toast.errorDefaultTitle,
                    message: message,
                    duration: 5000,
                });
                if (refreshCallback) refreshCallback(false);
                setIsPending(false);
                return false;
            }
            if (refreshCallback) refreshCallback(true);
            setIsPending(false);
            if (newStatus === 'aborted' || newStatus === 'refunded') {
                setModalVisibility(false);
                setTimeout(
                    () => handleRestoreProductQuantityConfirmation(orderItem),
                    300
                );
            }
            return true;
        },
        [orderItem]
    );

    const handleRestoreProductQuantity = (order: Order) => {
        if (isPending) return;
        setIsPending(true);

        (async () => {
            const { message, success } =
                await apis.emart.restoreOrderProductQuantity(order?.orderId);
            if (!success) {
                console.error(message);
                setTimeout(
                    () =>
                        showToast({
                            variant: 'danger',
                            title: staticTexts.toast.errorDefaultTitle,
                            message,
                            duration: 5000,
                        }),
                    100
                );
                setIsPending(false);
                if (refreshCallback) refreshCallback(true);
                return;
            }

            setIsPending(false);
            if (refreshCallback) refreshCallback(true);
        })();
    };

    const handleRestoreProductQuantityConfirmation = (order: Order) => {
        setModal({
            type: 'alert',
            title: staticTexts.adminSection.orders
                .restoreProductQuantityConfirmationWindow.title,
            message:
                staticTexts.adminSection.orders
                    .restoreProductQuantityConfirmationWindow.message,
            removeDefaultCloseButton: true,

            customButton: (
                <>
                    <Button
                        className="default"
                        color="gray"
                        style={
                            {
                                '--button-background-color-default': '#999999',
                            } as CSSProperties
                        }
                        onClick={() => setModalVisibility(false)}
                    >
                        {
                            staticTexts.adminSection.orders
                                .restoreProductQuantityConfirmationWindow
                                .cancelButton
                        }
                    </Button>
                    <Button
                        onClick={() => {
                            handleRestoreProductQuantity(order);
                            setModalVisibility(false);
                        }}
                    >
                        {
                            staticTexts.adminSection.orders
                                .restoreProductQuantityConfirmationWindow
                                .confirmButton
                        }
                    </Button>
                </>
            ),
        });
    };

    let oldTotal =
            orderItem?.items?.reduce(
                (acc, current) =>
                    acc + current.totalItems * current.product.oldPrice,
                0
            ) + (orderItem?.deliveryMethod === 'shipping' ? 1 : 0),
        newTotal =
            orderItem?.items?.reduce(
                (acc, current) =>
                    acc + current.totalItems * current.product.price,
                0
            ) + (orderItem?.deliveryMethod === 'shipping' ? 1 : 0);

    return (
        <div ref={modalWindow} className={styles['modal-window']}>
            <span
                className={styles['title']}
            >{`${texts.title} #${orderItem?.orderId || '?'}`}</span>
            <div className={styles['content-wrapper']}>
                <button
                    className={styles['close-button']}
                    onClick={() => {
                        if (isPending) return;
                        setModalVisibility(false);
                    }}
                >
                    <i
                        className={classNames(
                            styles['close-button-icon'],
                            'far fa-xmark'
                        )}
                    />
                </button>
                <div className={styles['products-wrapper']}>
                    <ul className={styles['product-list']}>
                        {items?.map((item) => (
                            <li
                                key={item?.id}
                                className={styles['product-item']}
                            >
                                <div
                                    className={
                                        styles['product-item-content-left']
                                    }
                                >
                                    <div
                                        className={
                                            styles['product-item-image-wrapper']
                                        }
                                    >
                                        <img
                                            className={
                                                styles['product-item-image']
                                            }
                                            src={
                                                item?.product?.imageFileName ||
                                                staticUrls.imagePlaceholder
                                            }
                                            alt={`Hình ảnh ${item?.product?.name}`}
                                            onError={(event) => {
                                                event.currentTarget.src =
                                                    staticUrls.imagePlaceholder;
                                            }}
                                        />
                                    </div>
                                    <div
                                        className={styles['product-item-info']}
                                    >
                                        <span
                                            className={
                                                styles['product-item-name']
                                            }
                                        >
                                            {item?.product?.name}
                                        </span>
                                        <span
                                            className={
                                                styles[
                                                    'product-item-note-wrapper'
                                                ]
                                            }
                                        >
                                            <i
                                                className={classNames(
                                                    styles[
                                                        'product-item-note-icon'
                                                    ],
                                                    'fal fa-pencil'
                                                )}
                                            />
                                            <span
                                                className={
                                                    styles[
                                                        'product-item-note-text'
                                                    ]
                                                }
                                            >
                                                {item?.note ||
                                                    texts.productItemEmptyNote}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                                <div
                                    className={
                                        styles['product-item-content-right']
                                    }
                                >
                                    <PopupWindow
                                        content={texts.newProductPriceTooltip}
                                        disabled={
                                            item?.product?.price ===
                                            item?.product?.oldPrice
                                        }
                                    >
                                        <span
                                            className={
                                                styles['product-item-price']
                                            }
                                        >
                                            {window.myHelper.convertUSDNumberToString(
                                                item?.product?.price
                                            )}
                                        </span>
                                    </PopupWindow>

                                    {item?.product?.price !==
                                        item?.product?.oldPrice && (
                                        <PopupWindow
                                            content={
                                                texts.oldProductPriceTooltip
                                            }
                                        >
                                            <span
                                                className={
                                                    styles[
                                                        'product-item-old-price'
                                                    ]
                                                }
                                            >
                                                {window.myHelper.convertUSDNumberToString(
                                                    item?.product?.oldPrice
                                                )}
                                            </span>
                                        </PopupWindow>
                                    )}
                                    <span
                                        className={styles['product-item-count']}
                                    >
                                        {texts.itemAmount}{' '}
                                        <span>{item?.totalItems}</span>
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={styles['details-wrapper']}>
                    <ul className={styles['order-details-list']}>
                        <li className={styles['order-details-item']}>
                            <span
                                className={styles['order-details-item-title']}
                            >
                                {texts.createdAtTitle}
                            </span>
                            <span className={styles['order-details-item-text']}>
                                {orderItem?.createdAt?.toLocaleString(
                                    'en-US'
                                ) || ''}
                            </span>
                        </li>
                        <li className={styles['order-details-item']}>
                            <span
                                className={styles['order-details-item-title']}
                            >
                                {texts.deliveryMethodTitle}
                            </span>
                            <span className={styles['order-details-item-text']}>
                                {orderItem?.deliveryMethod === 'shipping'
                                    ? texts.shippingDeliveryMethod
                                    : texts.pickupDeliveryMethod}
                            </span>
                        </li>
                        {orderItem?.deliveryMethod === 'shipping' && (
                            <li className={styles['order-details-item']}>
                                <span
                                    className={
                                        styles['order-details-item-title']
                                    }
                                >
                                    {texts.deliveryTimeTitle}
                                </span>
                                <span
                                    className={
                                        styles['order-details-item-text']
                                    }
                                >
                                    {orderItem?.deliveryTime?.toLocaleString(
                                        'en-US'
                                    ) || texts.deliveryNow}
                                </span>
                            </li>
                        )}
                        {orderItem?.deliveryMethod === 'shipping' && (
                            <li className={styles['order-details-item']}>
                                <span
                                    className={
                                        styles['order-details-item-title']
                                    }
                                >
                                    {texts.deliveryAddressTitle}
                                </span>
                                <span
                                    className={
                                        styles['order-details-item-text']
                                    }
                                >
                                    {orderItem?.deliveryAddress}
                                </span>
                            </li>
                        )}
                        {orderItem?.deliveryMethod === 'pickup' && (
                            <li className={styles['order-details-item']}>
                                <span
                                    className={
                                        styles['order-details-item-title']
                                    }
                                >
                                    {texts.pickupAddressTitle}
                                </span>
                                <span
                                    className={
                                        styles['order-details-item-text']
                                    }
                                >
                                    {orderItem?.pickupAt}
                                </span>
                            </li>
                        )}
                        <li className={styles['order-details-item']}>
                            <span
                                className={styles['order-details-item-title']}
                            >
                                {texts.customerNameTitle}
                            </span>
                            <span className={styles['order-details-item-text']}>
                                {orderItem?.customerName}
                            </span>
                        </li>
                        <li className={styles['order-details-item']}>
                            <span
                                className={styles['order-details-item-title']}
                            >
                                {texts.customerPhoneTitle}
                            </span>
                            <span className={styles['order-details-item-text']}>
                                {orderItem?.customerPhoneNumber}
                            </span>
                        </li>
                        <li className={styles['order-details-item']}>
                            <span
                                className={styles['order-details-item-title']}
                            >
                                {texts.deliveryNoteTitle}
                            </span>
                            <span className={styles['order-details-item-text']}>
                                {orderItem?.deliveryNote ||
                                    texts.emptyDeliveryNote}
                            </span>
                        </li>
                        <li className={styles['order-details-item']}>
                            <span
                                className={styles['order-details-item-title']}
                                style={{ paddingRight: '32px' }}
                            >
                                {texts.totalPriceTitle}
                            </span>
                            <span
                                className={classNames(
                                    styles['order-details-item-text'],
                                    styles['order-details-item-text-total']
                                )}
                            >
                                <PopupWindow
                                    content={texts.newTotalTooltip}
                                    disabled={oldTotal === newTotal}
                                >
                                    <span className={styles['total']}>
                                        {window.myHelper.convertUSDNumberToString(
                                            newTotal
                                        )}
                                    </span>
                                </PopupWindow>

                                {oldTotal !== newTotal && (
                                    <PopupWindow
                                        content={texts.oldTotalTooltip}
                                    >
                                        <span
                                            className={styles['original-total']}
                                        >
                                            {window.myHelper.convertUSDNumberToString(
                                                oldTotal
                                            )}
                                        </span>
                                    </PopupWindow>
                                )}
                                {orderItem?.deliveryMethod === 'shipping' && (
                                    <span className={styles['fee']}>
                                        {' '}
                                        {texts.shippingFeeIncluded}
                                    </span>
                                )}
                            </span>
                        </li>
                    </ul>
                    <div
                        className={
                            styles['order-details-item-status-title-wrapper']
                        }
                    >
                        <span className={styles['order-details-item-title']}>
                            {texts.statusTitle}
                        </span>
                        <CustomSelect
                            inputHeight={40}
                            className={classNames(
                                styles['status-select'],
                                {
                                    [styles['processing']]:
                                        orderItem?.status === 'processing',
                                },
                                {
                                    [styles['shipping']]:
                                        orderItem?.status === 'shipping',
                                },
                                {
                                    [styles['completed']]:
                                        orderItem?.status === 'completed',
                                },
                                {
                                    [styles['refunding']]:
                                        orderItem?.status === 'refunding',
                                },
                                {
                                    [styles['aborted']]:
                                        orderItem?.status === 'aborted',
                                },
                                {
                                    [styles['refunded']]:
                                        orderItem?.status === 'refunded',
                                }
                            )}
                            dropdownProps={{
                                className: classNames(
                                    styles['status-select-dropdown'],
                                    {
                                        [styles['processing']]:
                                            orderItem?.status === 'processing',
                                    },
                                    {
                                        [styles['shipping']]:
                                            orderItem?.status === 'shipping',
                                    },
                                    {
                                        [styles['completed']]:
                                            orderItem?.status === 'completed',
                                    },
                                    {
                                        [styles['refunding']]:
                                            orderItem?.status === 'refunding',
                                    },
                                    {
                                        [styles['aborted']]:
                                            orderItem?.status === 'aborted',
                                    },
                                    {
                                        [styles['refunded']]:
                                            orderItem?.status === 'refunded',
                                    }
                                ),
                            }}
                            defaultOption={orderItem?.status}
                            options={[
                                {
                                    id: 'processing',
                                    value: 'processing',
                                    text: texts.processingStatusOption,
                                },
                                {
                                    id: 'shipping',
                                    value: 'shipping',
                                    text: texts.shippingStatusOption,
                                },
                                {
                                    id: 'completed',
                                    value: 'completed',
                                    text: texts.completedStatusOption,
                                },
                                {
                                    id: 'refunding',
                                    value: 'refunding',
                                    text: texts.refundingStatusOption,
                                },
                                {
                                    id: 'aborted',
                                    value: 'aborted',
                                    text: texts.abortedStatusOption,
                                },
                                {
                                    id: 'refunded',
                                    value: 'refunded',
                                    text: texts.refundedStatusOption,
                                },
                            ]}
                            disabled={isPending}
                            onOptionChange={async (newOption) => {
                                return await handleUpdateStatus(
                                    newOption?.value
                                );
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

OrderDetailsModalWindow.propTypes = {
    orderItem: PropTypes.any.isRequired,
    refreshCallback: PropTypes.func,
};

export default OrderDetailsModalWindow;
