/**
 * @file index.tsx
 * @description Order management.
 * @todo Validate order items when transforming.
 */

'use strict';
import type { Order, Product, CartItem } from '@sources/ts/types/VyFood';
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

import { uploadUrl } from '@root/configs/backend.json';
import { useAuth } from '@sources/ts/hooks/useAuth';
import { useModal } from '@sources/ts/hooks/useModal';
import { showToast } from '@sources/ts/components/Toast';
import apis from '@sources/ts/apis';
import Button from '@sources/ts/components/Button';
import Input from '@sources/ts/components/Input';
import CustomSelect from '@sources/ts/components/CustomSelect';
import { CircleLoading } from '@sources/ts/components/Icons/CircleLoading';
import OrderDetailsModalWindow from './components/OrderDetailsModalWindow';
import * as styles from './Orders.module.css';
import staticUrls from '@sources/ts/render/static-urls';
import staticTexts from '@sources/ts/render/static-texts';
const texts = staticTexts.adminSection.orders;

// https://stackoverflow.com/questions/43080547/how-to-override-type-properties-in-typescript
type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

export type TOrder = Overwrite<Order, { items: TCartItem[] }>;

type TCartItem = Overwrite<
    CartItem,
    {
        product: CartItem['product'] & {
            oldPrice: number;
        };
    }
>;

/**
 * Order item.
 * @param props Component properties.
 * @param props.item Order item.
 * @param props.refreshCallback Refresh callback.
 * @returns Returns the component.
 */
const OrderItem: FunctionComponent<
    React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLTableRowElement>,
        HTMLTableRowElement
    > & { item: TOrder; refreshCallback: (silentFetch: boolean) => void }
> = ({ item, refreshCallback }) => {
    const { setModal, setModalVisibility } = useModal();

    const [renderItem, setRenderItem] = useState<Order>(item);

    const [isPending, setIsPending] = useState(false);

    const handleDeleteOrder = (order: Order) => {
        if (isPending) return;
        setIsPending(true);

        (async () => {
            const { message, success } = await apis.backend.deleteOrder(
                order?.orderId
            );
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
                return;
            }

            setIsPending(false);
            if (refreshCallback) refreshCallback(true);
        })();
    };

    const handleDeleteOrderConfirmation = (order: Order) => {
        setModal({
            type: 'alert',
            title: texts.deleteOrderConfirmationWindow.title,
            message: texts.deleteOrderConfirmationWindow.message,
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
                        {texts.deleteOrderConfirmationWindow.cancelButton}
                    </Button>
                    <Button
                        onClick={() => {
                            handleDeleteOrder(order);
                            setModalVisibility(false);
                        }}
                    >
                        {texts.deleteOrderConfirmationWindow.confirmButton}
                    </Button>
                </>
            ),
        });
    };

    const handleUpdateStatus = useCallback(
        async (newStatus: string) => {
            if (isPending) return false;
            setIsPending(true);
            setRenderItem({ ...item, status: newStatus as any });

            const { message, success } = await apis.backend.updateOrder(
                item?.orderId,
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
                if (refreshCallback) refreshCallback(true);
                setIsPending(false);
                return false;
            }
            if (refreshCallback) refreshCallback(true);
            setIsPending(false);
            return true;
        },
        [item]
    );

    const handleOpenOrderDetails = useCallback(() => {
        if (isPending) return;
        setModal({
            type: 'custom',
            content: (
                <OrderDetailsModalWindow
                    orderItem={item}
                    refreshCallback={refreshCallback}
                />
            ),
        });
    }, [item]);

    useEffect(() => {
        setRenderItem(item);
    }, [item]);

    return (
        <tr
            className={classNames(
                styles['order-item-row'],
                {
                    [styles['processing']]: renderItem?.status === 'processing',
                },
                {
                    [styles['completed']]: renderItem?.status === 'completed',
                },
                {
                    [styles['aborted']]: renderItem?.status === 'aborted',
                }
            )}
            key={renderItem?.orderId}
        >
            <td className={styles['table-field-id']}>
                <a
                    className={styles['table-field-id-link']}
                    onClick={() => handleOpenOrderDetails()}
                >{`#${renderItem?.orderId}`}</a>
            </td>
            <td>{renderItem?.createdAt.toLocaleString('en-US')}</td>
            <td>{renderItem?.customerName}</td>
            <td>{renderItem?.customerPhoneNumber}</td>
            <td>
                <CustomSelect
                    className={classNames(
                        styles['status-select'],
                        {
                            [styles['processing']]:
                                renderItem?.status === 'processing',
                        },
                        {
                            [styles['completed']]:
                                renderItem?.status === 'completed',
                        },
                        {
                            [styles['aborted']]:
                                renderItem?.status === 'aborted',
                        }
                    )}
                    dropdownProps={{
                        className: classNames(
                            styles['status-select-dropdown'],
                            {
                                [styles['processing']]:
                                    renderItem?.status === 'processing',
                            },
                            {
                                [styles['completed']]:
                                    renderItem?.status === 'completed',
                            },
                            {
                                [styles['aborted']]:
                                    renderItem?.status === 'aborted',
                            }
                        ),
                    }}
                    defaultOption={renderItem?.status}
                    options={[
                        {
                            id: 'processing',
                            value: 'processing',
                            text: texts.processingStatusOption,
                            selected: renderItem?.status === 'processing',
                        },
                        {
                            id: 'completed',
                            value: 'completed',
                            text: texts.completedStatusOption,
                            selected: renderItem?.status === 'completed',
                        },
                        {
                            id: 'aborted',
                            value: 'aborted',
                            text: texts.abortedStatusOption,
                            selected: renderItem?.status === 'aborted',
                        },
                    ]}
                    disabled={isPending}
                    onOptionChange={async (newOption) => {
                        return await handleUpdateStatus(newOption?.value);
                    }}
                />
            </td>
            <td>
                {renderItem?.deliveryMethod === 'shipping'
                    ? texts.shippingDeliveryMethod
                    : texts.pickupDeliveryMethod}
            </td>
            <td className={styles['table-field-action']}>
                <Button
                    className={styles['update-order-button']}
                    onClick={() => handleOpenOrderDetails()}
                >
                    <i className={classNames('fal fa-pen-to-square')} />
                </Button>
                <Button
                    disabled={isPending}
                    onClick={() => handleDeleteOrderConfirmation(renderItem)}
                >
                    <i className={classNames('fal fa-trash')} />
                </Button>
            </td>
        </tr>
    );
};

OrderItem.propTypes = {
    item: PropTypes.any.isRequired,
    refreshCallback: PropTypes.func.isRequired,
};

/**
 * Order management.
 * @param props Component properties.
 * @param props.itemsPerPage Item per page.
 * @param props.onPaginationChange On pagination change callback.
 * @returns Returns the component.
 */
const Orders: FunctionComponent<{
    itemsPerPage?: number;
    onPaginationChange?: (...args: any[]) => void;
}> = ({ itemsPerPage = 12, onPaginationChange }) => {
    const orderWrapper = useRef<HTMLDivElement>(null),
        orderStatusSelect = useRef<HTMLDivElement>(null),
        searchInput = useRef<HTMLInputElement>(null);

    const [currentOrderStatus, setCurrentOrderStatus] = useState(''),
        [searchInputValue, setSearchInputValue] = useState('');

    const [orders, setOrders] = useState<TOrder[]>(null),
        [filteredOrders, setFilteredOrders] = useState<TOrder[]>(null);

    const [isPending, setIsPending] = useState(false);

    const [status, setStatus] = useState<
        'idle' | 'loading' | 'empty' | 'error'
    >('loading');

    const [pagination, setPagination] = useState(1);

    const indexOfLastItem = pagination * itemsPerPage,
        indexOfFirstItem = indexOfLastItem - itemsPerPage,
        renderItems = filteredOrders
            ?.slice(indexOfFirstItem, indexOfLastItem)
            ?.sort((a, b) => {
                return b?.orderId - a?.orderId;
            });

    const totalPagination = [];
    if (filteredOrders)
        for (
            let i = 1;
            i <= Math.ceil(filteredOrders.length / itemsPerPage);
            i++
        )
            totalPagination.push(i);

    const handleRefresh = (silentFetch: boolean = false) => {
        if (isPending) return;

        setIsPending(true);
        if (!silentFetch) setStatus('loading');
        (async () => {
            const getProductsResult = await apis.backend.getProducts();
            if (!getProductsResult.success) {
                console.error(getProductsResult.message);
                showToast({
                    variant: 'danger',
                    title: staticTexts.toast.errorDefaultTitle,
                    message: getProductsResult.message,
                    duration: 5000,
                });
                setStatus('error');
                setIsPending(false);
            }
            const products = getProductsResult?.data?.products?.reduce(
                (acc: { [productSlug: string]: Product }, rawProduct) => {
                    const product: Product = {
                        ...rawProduct,
                        imageFileName: rawProduct.imageFileName
                            ? `${uploadUrl}/product/${rawProduct.imageFileName}`
                            : staticUrls.imagePlaceholder,
                        priority: rawProduct.priority,
                    };
                    acc[rawProduct?.slug] = product;
                    return acc;
                },
                {}
            );

            const getOrdersResult = await apis.backend.getOrders();
            if (!getOrdersResult.success) {
                console.error(getOrdersResult.message);
                showToast({
                    variant: 'danger',
                    title: staticTexts.toast.errorDefaultTitle,
                    message: getOrdersResult.message,
                    duration: 5000,
                });
                setStatus('error');
                setIsPending(false);
            }

            const rawOrders = getOrdersResult?.data?.orders,
                transformedOrders: TOrder[] = rawOrders?.map((uOrder) => {
                    const order: TOrder = {
                        ...uOrder,
                        deliveryTime: uOrder?.deliveryTime
                            ? new Date(uOrder.deliveryTime)
                            : null,
                        createdAt: new Date(uOrder.createdAt),
                        items: uOrder?.items?.map((cartItem) => {
                            if (
                                !Object.keys(products)?.includes(
                                    cartItem?.product?.slug
                                )
                            ) {
                                const tCartItem = {
                                    ...cartItem,
                                    product: {
                                        ...products[cartItem.product.slug],
                                        name: '(Sản phẩm đã bị xoá)',
                                        price: 0,
                                        desc: '0',
                                        oldPrice: cartItem.product.price,
                                    },
                                };
                                return tCartItem;
                            }
                            const tCartItem = {
                                ...cartItem,
                                product: {
                                    ...products[cartItem.product.slug],
                                    oldPrice: cartItem.product.price,
                                },
                            };

                            return tCartItem;
                        }),
                    };

                    return order;
                });

            setOrders(transformedOrders);
            setStatus(transformedOrders?.length ? 'idle' : 'empty');
            setIsPending(false);
        })();
    };

    const handlePaginationChange = (pageNumber: number) => {
        if (pageNumber > totalPagination.length)
            pageNumber = totalPagination.length;
        else if (pageNumber < 1) pageNumber = 1;
        setPagination(pageNumber);
        if (onPaginationChange) onPaginationChange();
    };

    useEffect(() => {
        const newFilteredOrders = orders?.filter((item) => {
            if (
                currentOrderStatus &&
                currentOrderStatus?.toLowerCase() !== item?.status
            )
                return false;

            let searchByMode: 'ORDER_ID' | 'NAME' | 'PHONE_NUMBER' =
                searchInput.current?.value[0] === '#'
                    ? 'ORDER_ID'
                    : isNaN(parseInt(searchInput.current?.value[0]))
                      ? 'NAME'
                      : 'PHONE_NUMBER';
            switch (searchByMode) {
                case 'ORDER_ID': {
                    if (searchInput.current?.value !== `#${item?.orderId}`)
                        return false;
                    break;
                }
                case 'NAME': {
                    if (
                        searchInput.current?.value &&
                        !item.customerName
                            .toLowerCase()
                            .includes(searchInput.current?.value?.toLowerCase())
                    )
                        return false;
                    break;
                }
                case 'PHONE_NUMBER': {
                    if (
                        searchInput.current?.value &&
                        !item.customerPhoneNumber
                            .toLowerCase()
                            .includes(searchInput.current?.value?.toLowerCase())
                    )
                        return false;
                    break;
                }
            }

            return true;
        });

        // setPagination(1);
        setFilteredOrders(newFilteredOrders);
        if (status !== 'loading')
            setStatus(newFilteredOrders?.length ? 'idle' : 'empty');
    }, [orders, searchInputValue, currentOrderStatus]);

    useEffect(() => {
        orderStatusSelect.current = document.getElementById(
            'admin-order-status-select'
        ) as HTMLDivElement;
        if (!orderStatusSelect.current)
            console.error(`Element '#admin-order-status-select' not found.`);

        handleRefresh();
    }, []);

    return (
        <div className={styles['content-wrapper']}>
            <span className={styles['title']}>
                {staticTexts.adminSection.orders.title}
            </span>
            <div className={styles['controls-wrapper']}>
                <div className={styles['controls-inputs']}>
                    <CustomSelect
                        id="admin-order-status-select"
                        disabled={isPending || status === 'error'}
                        className={styles['order-status-select']}
                        inputWidth={180}
                        inputHeight={40}
                        defaultOption="dn"
                        options={[
                            {
                                id: 'all',
                                text: texts.orderStatusAllSelectText,
                                value: '',
                            },
                            {
                                id: 'processing',
                                value: 'processing',
                                text: texts.processingStatusOption,
                            },
                            {
                                id: 'completed',
                                value: 'completed',
                                text: texts.completedStatusOption,
                            },
                            {
                                id: 'aborted',
                                value: 'aborted',
                                text: texts.abortedStatusOption,
                            },
                        ]}
                        onOptionChange={async (newOption) => {
                            setCurrentOrderStatus(newOption.value);
                            return true;
                        }}
                    />
                    <Input
                        inputRef={searchInput}
                        id="admin-search-order-input"
                        className={styles['search-input']}
                        height={40}
                        icon={{
                            position: 'left',
                            icon: 'fal fa-magnifying-glass',
                        }}
                        placeholder={texts.searchOrderInputPlaceholder}
                        spellCheck={false}
                        disabled={isPending || status === 'error'}
                        value={searchInputValue}
                        onChange={(event) =>
                            setSearchInputValue(event.currentTarget.value)
                        }
                    />
                </div>
                <div className={styles['controls-buttons']}>
                    <Button
                        id="refresh-orders-button"
                        className={styles['control-button']}
                        height={40}
                        disabled={isPending || status === 'error'}
                        onClick={() => {
                            handleRefresh();
                        }}
                        loading={status === 'loading'}
                    >
                        <i className={classNames('fal fa-rotate-right')} />{' '}
                        <span>{texts.refreshButton}</span>
                    </Button>
                </div>
            </div>
            <span className={styles['orders-count']}>
                {filteredOrders?.length || 0} {texts.itemUnitText}
            </span>
            <div ref={orderWrapper} className={styles['orders-wrapper']}>
                {status === 'idle' && (
                    <div className={styles['table-wrapper']}>
                        <table className={styles['table']}>
                            <thead className={styles['table-head']}>
                                <tr>
                                    <th>{texts.idColumn}</th>
                                    <th>{texts.createdAtColumn}</th>
                                    <th>{texts.customerNameColumn}</th>
                                    <th>{texts.customerPhoneColumn}</th>
                                    <th>{texts.statusColumn}</th>
                                    <th>{texts.deliveryMethodColumn}</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody className={styles['table-body']}>
                                {renderItems?.map((item) => (
                                    <OrderItem
                                        key={item?.orderId}
                                        item={item}
                                        refreshCallback={handleRefresh}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {status === 'loading' && (
                    <div className={styles['status-wrapper']}>
                        <span className={styles['status-text']}>
                            {texts.loadingText}
                        </span>
                        <CircleLoading
                            className={styles['status-loading-icon']}
                        />
                    </div>
                )}
                {status === 'empty' && (
                    <div className={styles['status-wrapper']}>
                        <span className={styles['status-text']}>
                            {texts.emptyText}
                        </span>
                        <i
                            className={classNames(
                                styles['status-icon'],
                                'fal fa-empty-set'
                            )}
                        />
                    </div>
                )}
                {status === 'error' && (
                    <div className={styles['status-wrapper']}>
                        <span className={styles['status-text']}>
                            {texts.errorText}
                        </span>
                        <i
                            className={classNames(
                                styles['status-icon'],
                                'fal fa-cloud-slash'
                            )}
                        />
                    </div>
                )}
            </div>
            <div className={styles['pagination-button-list']}>
                {totalPagination &&
                    totalPagination.length <= 5 &&
                    totalPagination.map((pageNumber) => (
                        <button
                            key={pageNumber}
                            className={classNames(styles['pagination-button'], {
                                [styles['current']]: pageNumber === pagination,
                            })}
                            onClick={() => handlePaginationChange(pageNumber)}
                        >
                            {pageNumber}
                        </button>
                    ))}
                {totalPagination && totalPagination.length > 5 && (
                    <>
                        <button
                            className={classNames(styles['pagination-button'])}
                            onClick={() =>
                                handlePaginationChange(pagination - 1)
                            }
                        >
                            <i className={'fas fa-caret-left'} />
                        </button>

                        {pagination === totalPagination.length && (
                            <>
                                <button
                                    className={classNames(
                                        styles['pagination-button']
                                    )}
                                    onClick={() =>
                                        handlePaginationChange(
                                            totalPagination.length - 4
                                        )
                                    }
                                >
                                    {totalPagination.length - 4}
                                </button>
                                <button
                                    className={classNames(
                                        styles['pagination-button']
                                    )}
                                    onClick={() =>
                                        handlePaginationChange(
                                            totalPagination.length - 3
                                        )
                                    }
                                >
                                    {totalPagination.length - 3}
                                </button>
                            </>
                        )}
                        {pagination === totalPagination.length - 1 && (
                            <button
                                className={classNames(
                                    styles['pagination-button']
                                )}
                                onClick={() =>
                                    handlePaginationChange(
                                        totalPagination.length - 4
                                    )
                                }
                            >
                                {totalPagination.length - 4}
                            </button>
                        )}

                        {pagination - 2 >= 1 && (
                            <button
                                key={`${pagination - 2}/${totalPagination}`}
                                className={classNames(
                                    styles['pagination-button']
                                )}
                                onClick={(event) => {
                                    document.querySelector('button').click();

                                    handlePaginationChange(pagination - 2);
                                }}
                            >
                                {pagination - 2}
                            </button>
                        )}

                        {pagination - 1 >= 1 && (
                            <button
                                key={`${pagination - 1}/${totalPagination}`}
                                className={classNames(
                                    styles['pagination-button']
                                )}
                                onClick={() =>
                                    handlePaginationChange(pagination - 1)
                                }
                            >
                                {pagination - 1}
                            </button>
                        )}

                        <button
                            key={`${pagination}/${totalPagination}`}
                            className={classNames(
                                styles['pagination-button'],
                                styles['current']
                            )}
                        >
                            {pagination}
                        </button>

                        {pagination + 1 <= totalPagination.length && (
                            <button
                                key={`${pagination + 1}/${totalPagination}`}
                                className={classNames(
                                    styles['pagination-button']
                                )}
                                onClick={() =>
                                    handlePaginationChange(pagination + 1)
                                }
                            >
                                {pagination + 1}
                            </button>
                        )}

                        {pagination + 2 <= totalPagination.length && (
                            <button
                                key={`${pagination + 2}/${totalPagination}`}
                                className={classNames(
                                    styles['pagination-button']
                                )}
                                onClick={() =>
                                    handlePaginationChange(pagination + 2)
                                }
                            >
                                {pagination + 2}
                            </button>
                        )}

                        {pagination === 1 && (
                            <>
                                <button
                                    className={classNames(
                                        styles['pagination-button']
                                    )}
                                    onClick={() => handlePaginationChange(4)}
                                >
                                    4
                                </button>
                                <button
                                    className={classNames(
                                        styles['pagination-button']
                                    )}
                                    onClick={() => handlePaginationChange(4)}
                                >
                                    5
                                </button>
                            </>
                        )}

                        {pagination === 2 && (
                            <button
                                className={classNames(
                                    styles['pagination-button']
                                )}
                                onClick={() => handlePaginationChange(4)}
                            >
                                5
                            </button>
                        )}

                        <button
                            className={classNames(styles['pagination-button'])}
                            onClick={() =>
                                handlePaginationChange(pagination + 1)
                            }
                        >
                            <i className={'fas fa-caret-right'} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

Orders.propTypes = {
    itemsPerPage: PropTypes.number,
    onPaginationChange: PropTypes.func,
};

export default Orders;
