/**
 * @files index.tsx
 * @desc Products view.
 */

'use strict';
import type { Product } from '@sources/ts/apis/emart/types';
import { FunctionComponent, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useAPI } from '@sources/ts/hooks/useAPI';
import { useModal } from '@sources/ts/hooks/useModal';
import { CircleLoading } from '@sources/ts/components/Icons/CircleLoading';
import ProductDetailModalWindow from '../ProductDetailModalWindow';
import * as styles from './ProductsView.module.css';
import staticUrls from '@sources/ts/render/static-urls';
import staticTexts from '@sources/ts/render/static-texts';
const texts = staticTexts.productsView;

/**
 * Products view.
 * @param props Component properties.
 * @param props.itemsPerPage Item per page.
 * @param props.onPaginationChange On pagination change callback.
 * @returns Returns the component.
 */
const ProductsView: FunctionComponent<{
    itemsPerPage?: number;
    onPaginationChange?: (...args: any[]) => void;
}> = ({ itemsPerPage = 12, onPaginationChange }) => {
    const { setModal } = useModal();

    const {
        productItems,
        handleRefreshProduct,
        productFilter,
        setProductFilter,
        setProductSearchValue,
        isBackendUnavailable,
    } = useAPI();

    const [filteredItems, setFilteredItems] = useState(() => {
            if (!productItems) return null;
            return productItems;
        }),
        [pagination, setPagination] = useState(1);

    const indexOfLastItem = pagination * itemsPerPage,
        indexOfFirstItem = indexOfLastItem - itemsPerPage,
        renderItems = filteredItems?.slice(indexOfFirstItem, indexOfLastItem);

    const totalPagination = [];
    if (filteredItems)
        for (
            let i = 1;
            i <= Math.ceil(filteredItems.length / itemsPerPage);
            i++
        )
            totalPagination.push(i);

    function handlePaginationChange(pageNumber: number) {
        if (pageNumber > totalPagination.length)
            pageNumber = totalPagination.length;
        else if (pageNumber < 1) pageNumber = 1;
        setPagination(pageNumber);
        if (onPaginationChange) onPaginationChange();
    }

    function handleOpenProductDetail(productItem: Product) {
        if (productItem.quantity === 0) return;
        setModal({
            type: 'custom',
            content: <ProductDetailModalWindow productItem={productItem} />,
        });
    }

    useEffect(() => {
        setFilteredItems(
            productItems?.sort((a, b) => {
                return b?.priority - a?.priority;
            })
        );
        setPagination(1);
        setProductFilter(null);
    }, [productItems]);

    useEffect(() => {
        if (productFilter) {
            if (productFilter.type === 'category') {
                setProductSearchValue('');

                setFilteredItems(
                    productItems.filter((item) =>
                        item.category.includes(productFilter.value)
                    )
                );
            } else if (productFilter.type === 'name') {
                setFilteredItems(
                    productItems.filter((item) =>
                        item.name
                            .toLowerCase()
                            .includes(productFilter.value.toLowerCase())
                    )
                );
            }
            setPagination(1);
        } else {
            setProductSearchValue('');
            setFilteredItems(productItems);
        }
    }, [productFilter]);

    useEffect(() => {
        handleRefreshProduct(true);
    }, []);

    return (
        <>
            {!!renderItems?.length && (
                <span className={styles['section-title']}>{texts.title}</span>
            )}
            <div className={styles['product-list']}>
                {!isBackendUnavailable &&
                    !!renderItems?.length &&
                    renderItems?.map((item) => (
                        <div
                            key={item.name}
                            className={classNames(styles['product-item'], {
                                [styles['unavailable']]: item.quantity === 0,
                            })}
                            onClick={() => handleOpenProductDetail(item)}
                        >
                            <div
                                className={styles['product-image-wrapper']}
                                onClick={() => handleOpenProductDetail(item)}
                            >
                                <img
                                    className={styles['product-image']}
                                    src={
                                        item.imageFileName ||
                                        staticUrls.imagePlaceholder
                                    }
                                    alt={`${texts.productImageAlt} ${item.name}`}
                                    onError={(event) => {
                                        event.currentTarget.src =
                                            staticUrls.imagePlaceholder;
                                    }}
                                />
                            </div>
                            <div className={styles['product-content']}>
                                <span
                                    className={styles['product-title']}
                                    onClick={() =>
                                        handleOpenProductDetail(item)
                                    }
                                >
                                    {item.name}
                                </span>
                                <span className={styles['product-price-tag']}>
                                    {window.myHelper.convertUSDNumberToString(
                                        item.price
                                    )}
                                </span>
                                <button
                                    className={
                                        styles['product-add-to-cart-button']
                                    }
                                    onClick={() =>
                                        handleOpenProductDetail(item)
                                    }
                                    disabled={item.quantity === 0}
                                >
                                    <i className="far fa-cart-shopping-fast" />{' '}
                                    {item.quantity !== 0
                                        ? texts.orderButton
                                        : texts.orderButtonOutOfStock}
                                </button>
                            </div>
                            <i
                                className={classNames(
                                    styles['product-item-arrow'],
                                    'fal fa-arrow-right'
                                )}
                            />
                        </div>
                    ))}
                {!isBackendUnavailable &&
                    !renderItems?.length &&
                    productFilter && (
                        <div className={styles['product-empty-content']}>
                            <span
                                className={
                                    styles['product-empty-content-title']
                                }
                            >
                                {productFilter?.type === 'category'
                                    ? texts.emptyCategory
                                    : texts.emptySearch}
                            </span>
                            <span
                                className={styles['product-empty-content-desc']}
                            >
                                <span>
                                    {texts.suggestion1}{' '}
                                    <span
                                        style={{
                                            color: 'var(--color-primary)',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => {
                                            setProductFilter(null);
                                            setTimeout(() => {
                                                document
                                                    ?.getElementById(
                                                        'products-section'
                                                    )
                                                    ?.scrollIntoView({
                                                        behavior: 'smooth',
                                                        block: 'start',
                                                        inline: 'center',
                                                    });
                                            }, 1);
                                        }}
                                    >
                                        {texts.suggestionLink}
                                    </span>{' '}
                                    {texts.suggestion2}
                                </span>
                            </span>
                            <i
                                className={classNames(
                                    styles['product-empty-content-icon'],
                                    'fas fa-utensils-slash'
                                )}
                            />
                        </div>
                    )}
                {!isBackendUnavailable &&
                    !productItems &&
                    !renderItems?.length &&
                    !productFilter && (
                        <div className={styles['product-loading-content']}>
                            <span
                                className={
                                    styles['product-loading-content-title']
                                }
                            >
                                {texts.loadingText}
                            </span>
                            <CircleLoading
                                className={
                                    styles['product-loading-content-icon']
                                }
                            />
                        </div>
                    )}
                {!isBackendUnavailable &&
                    productItems &&
                    !productFilter &&
                    !renderItems?.length && (
                        <div className={styles['product-unavailable-content']}>
                            <span
                                className={
                                    styles['product-unavailable-content-title']
                                }
                            >
                                {texts.emptyTextTitle}
                            </span>
                            <span
                                className={
                                    styles['product-unavailable-content-desc']
                                }
                            >
                                <span>{texts.emptyTextDesc}</span>
                            </span>
                            <i
                                className={classNames(
                                    styles['product-unavailable-content-icon'],
                                    'fas fa-utensils-slash'
                                )}
                            />
                        </div>
                    )}
                {isBackendUnavailable && (
                    <div className={styles['product-unavailable-content']}>
                        <span
                            className={
                                styles['product-unavailable-content-title']
                            }
                        >
                            {texts.unavailableTextTitle}
                        </span>
                        <span
                            className={
                                styles['product-unavailable-content-desc']
                            }
                        >
                            <span>{texts.unavailableTextDesc}</span>
                        </span>
                        <i
                            className={classNames(
                                styles['product-unavailable-content-icon'],
                                'fas fa-utensils-slash'
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
        </>
    );
};

ProductsView.propTypes = {
    itemsPerPage: PropTypes.number,
    onPaginationChange: PropTypes.func,
};

export default ProductsView;
