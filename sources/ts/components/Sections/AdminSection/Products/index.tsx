/**
 * @file index.tsx
 * @description Product management.
 */

'use strict';
import type { Product } from '@sources/ts/types/VyFood';
import type { SelectOption } from '@sources/ts/components/CustomSelect';
import {
    FunctionComponent,
    CSSProperties,
    useState,
    useEffect,
    useRef,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useModal } from '@sources/ts/hooks/useModal';
import { showToast } from '@sources/ts/components/Toast';
import apis from '@sources/ts/apis';
import Button from '@sources/ts/components/Button';
import CustomSelect from '@sources/ts/components/CustomSelect';
import Input from '@sources/ts/components/Input';
import { CircleLoading } from '@sources/ts/components/Icons/CircleLoading';
import CreateProductModalWindow from './components/CreateProductModalWindow';
import UpdateProductModalWindow from './components/UpdateProductModalWindow';
import * as styles from './Products.module.css';
import staticTexts from '@sources/ts/render/static-texts';
import staticUrls from '@sources/ts/render/static-urls';
const texts = staticTexts.adminSection.products;

/**
 * Product management.
 * @param props Component properties.
 * @param props.itemsPerPage Item per page.
 * @param props.onPaginationChange On pagination change callback.
 * @returns Returns the component.
 */
const Products: FunctionComponent<{
    itemsPerPage?: number;
    onPaginationChange?: (...args: any[]) => void;
}> = ({ itemsPerPage = 12, onPaginationChange }) => {
    const { setModal, setModalVisibility } = useModal();

    const productWrapper = useRef<HTMLDivElement>(null),
        categorySelect = useRef<HTMLDivElement>(null),
        searchInput = useRef<HTMLInputElement>(null);

    const [currentCategory, setCurrentCategory] = useState(''),
        [searchInputValue, setSearchInputValue] = useState('');

    const staticCategoryOptions: SelectOption[] = [
            { id: 'all', text: texts.categoryAllSelectText, value: '' },
        ],
        [categoryOptions, setCategoryOptions] = useState(staticCategoryOptions);

    const [products, setProducts] = useState<Product[]>(null),
        [filteredProducts, setFilteredProducts] = useState<Product[]>(null);

    const [isPending, setIsPending] = useState(false);

    const [status, setStatus] = useState<
        'idle' | 'loading' | 'empty' | 'error'
    >('loading');

    const [pagination, setPagination] = useState(1);

    const indexOfLastItem = pagination * itemsPerPage,
        indexOfFirstItem = indexOfLastItem - itemsPerPage,
        renderItems = filteredProducts?.slice(
            indexOfFirstItem,
            indexOfLastItem
        );

    const totalPagination = [];
    if (filteredProducts)
        for (
            let i = 1;
            i <= Math.ceil(filteredProducts.length / itemsPerPage);
            i++
        )
            totalPagination.push(i);

    const handleRefresh = (silentFetch: boolean = false) => {
        if (isPending) return;

        setIsPending(true);
        if (!silentFetch) setStatus('loading');
        (async () => {
            const getCategoriesResult = await apis.backend.getCategories(
                1,
                99999
            );
            if (!getCategoriesResult.success) {
                console.error(getCategoriesResult.message);
                setIsPending(false);
                setStatus('error');
                return;
            }
            const newCategoryOptions = [
                ...staticCategoryOptions,
                ...getCategoriesResult?.data?.categories
                    ?.sort((a, b) => b?.priority - a?.priority)
                    ?.map((category) => {
                        return {
                            id: category.slug,
                            text: category.name,
                            value: category.slug,
                        };
                    }),
            ];
            if (
                !newCategoryOptions
                    ?.map((category) => category.value)
                    .includes(currentCategory)
            )
                setCurrentCategory('');
            setCategoryOptions(newCategoryOptions);

            const getProductResult = await apis.backend.getProducts(1, 99999);
            if (!getProductResult.success) {
                console.error(getProductResult.message);
                showToast({
                    variant: 'danger',
                    title: staticTexts.toast.errorDefaultTitle,
                    message: getProductResult.message,
                    duration: 5000,
                });
                setIsPending(false);
                setStatus('error');
                return;
            }

            const rawProducts = getProductResult.data?.products,
                transformedProducts: Product[] = rawProducts?.map(
                    (uProduct) => {
                        const product: Product = {
                            ...uProduct,
                            imageFileName: uProduct.imageFileName
                                ? `${process.env.UPLOAD_URL}/product/${uProduct.imageFileName}`
                                : staticUrls.imagePlaceholder,
                            priority: uProduct.priority,
                        };
                        return product;
                    }
                );

            setProducts(transformedProducts);
            setStatus(transformedProducts?.length ? 'idle' : 'empty');
            setIsPending(false);
        })();
    };

    const handlePaginationChange = (pageNumber: number) => {
        if (pageNumber > totalPagination.length)
            pageNumber = totalPagination.length;
        else if (pageNumber < 1) pageNumber = 1;
        setPagination(pageNumber);
        if (onPaginationChange) onPaginationChange();

        setTimeout(
            () =>
                productWrapper.current?.scrollTo({
                    behavior: 'smooth',
                    top: 0,
                }),
            50
        );
    };

    const handleCreateProduct = () => {
        setModal({
            type: 'custom',
            content: (
                <CreateProductModalWindow refreshCallback={handleRefresh} />
            ),
        });
    };

    const handleUpdateProduct = (product: Product) => {
        setModal({
            type: 'custom',
            content: (
                <UpdateProductModalWindow
                    product={product}
                    refreshCallback={handleRefresh}
                />
            ),
        });
    };

    const handleDeleteProductConfirmation = (product: Product) => {
        setModal({
            type: 'alert',
            title: texts.deleteProductConfirmationWindow.title,
            message: texts.deleteProductConfirmationWindow.message,
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
                        {texts.deleteProductConfirmationWindow.cancelButton}
                    </Button>
                    <Button
                        onClick={() => {
                            handleDeleteProduct(product);
                            setModalVisibility(false);
                        }}
                    >
                        {texts.deleteProductConfirmationWindow.confirmButton}
                    </Button>
                </>
            ),
        });
    };

    const handleDeleteProduct = (product: Product) => {
        if (isPending) return;
        setIsPending(true);

        (async () => {
            const { message, success } = await apis.backend.deleteProduct(
                product.slug
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
            handleRefresh(true);
        })();
    };

    useEffect(() => {
        categorySelect.current = document.getElementById(
            'admin-product-category-select'
        ) as HTMLDivElement;
        if (!categorySelect.current)
            console.error(
                `Element '#admin-product-category-select' not found.`
            );

        handleRefresh(false);
    }, []);

    useEffect(() => {
        const newFilteredProducts = products
            ?.filter((item) => {
                if (
                    currentCategory &&
                    !item.category?.includes(currentCategory?.toLowerCase())
                )
                    return false;
                if (
                    searchInput.current?.value &&
                    !item.name
                        .toLowerCase()
                        .includes(searchInput.current?.value?.toLowerCase())
                )
                    return false;
                return true;
            })
            .sort((a, b) => {
                return b?.priority - a?.priority;
            });

        // setPagination(1);
        setFilteredProducts(newFilteredProducts);
        if (status !== 'loading')
            setStatus(newFilteredProducts?.length ? 'idle' : 'empty');
    }, [products, searchInputValue, currentCategory]);

    useEffect(() => {
        setPagination(1);
    }, [currentCategory]);

    useEffect(() => {
        setPagination(1);
    }, [searchInputValue]);

    useEffect(() => {
        if (pagination > totalPagination?.length) setPagination(1);
    }, [filteredProducts]);

    return (
        <div className={styles['content-wrapper']}>
            <span className={styles['title']}>{texts.title}</span>
            <div className={styles['controls-wrapper']}>
                <div className={styles['controls-inputs']}>
                    <CustomSelect
                        id="admin-product-category-select"
                        disabled={isPending || status === 'error'}
                        className={styles['category-select']}
                        inputWidth={180}
                        inputHeight={40}
                        defaultOption="dn"
                        options={categoryOptions}
                        onOptionChange={async (newOption) => {
                            setCurrentCategory(newOption.value);
                            setTimeout(
                                () =>
                                    productWrapper.current?.scrollTo({
                                        behavior: 'smooth',
                                        top: 0,
                                    }),
                                50
                            );
                            return true;
                        }}
                    />
                    <Input
                        inputRef={searchInput}
                        id="admin-search-product-input"
                        className={styles['search-input']}
                        height={40}
                        icon={{
                            position: 'left',
                            icon: 'fal fa-magnifying-glass',
                        }}
                        placeholder={texts.searchProductInputPlaceholder}
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
                        id="refresh-products-button"
                        className={styles['control-button']}
                        height={40}
                        disabled={isPending || status === 'error'}
                        onClick={() => {
                            handleRefresh(false);
                            setTimeout(
                                () =>
                                    productWrapper.current?.scrollTo({
                                        behavior: 'smooth',
                                        top: 0,
                                    }),
                                50
                            );
                        }}
                        loading={status === 'loading'}
                    >
                        <i className={classNames('fal fa-rotate-right')} />{' '}
                        <span>{texts.refreshButton}</span>
                    </Button>
                    <Button
                        id="add-product-button"
                        className={styles['control-button']}
                        onClick={() => handleCreateProduct()}
                        height={40}
                        disabled={isPending || status === 'error'}
                    >
                        <i className={classNames('fal fa-plus')} />{' '}
                        <span>{texts.addButton}</span>
                    </Button>
                </div>
            </div>
            <span className={styles['product-count']}>
                {filteredProducts?.length || 0} {texts.itemUnitText}
            </span>
            <div ref={productWrapper} className={styles['products-wrapper']}>
                {status === 'idle' && (
                    <ul className={styles['product-list']}>
                        {renderItems?.map((product) => (
                            <li
                                key={`${product.slug}-${pagination}`}
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
                                        onClick={() =>
                                            handleUpdateProduct(product)
                                        }
                                    >
                                        <img
                                            className={
                                                styles['product-item-image']
                                            }
                                            src={
                                                product?.imageFileName ||
                                                staticUrls.imagePlaceholder
                                            }
                                            alt={`Hình ảnh ${product?.name}`}
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
                                            onClick={() =>
                                                handleUpdateProduct(product)
                                            }
                                        >
                                            {product?.name}
                                        </span>
                                        {product?.desc && (
                                            <span
                                                className={
                                                    styles['product-item-desc']
                                                }
                                            >
                                                {product?.desc}
                                            </span>
                                        )}
                                        <div
                                            className={
                                                styles['product-item-category']
                                            }
                                        >
                                            {product?.category?.map(
                                                (item, index) => {
                                                    if (!item) return false;

                                                    return (
                                                        <span
                                                            key={index}
                                                            className={
                                                                styles[
                                                                    'product-item-category-item'
                                                                ]
                                                            }
                                                        >
                                                            {
                                                                categoryOptions?.find(
                                                                    (option) =>
                                                                        option.id ===
                                                                        item
                                                                )?.text
                                                            }
                                                        </span>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className={
                                        styles['product-item-content-right']
                                    }
                                >
                                    <span
                                        className={styles['product-item-price']}
                                    >
                                        {window.myHelper.convertVNDNumberToString(
                                            product?.price
                                        )}
                                    </span>
                                    <span
                                        className={
                                            styles['product-item-quantity']
                                        }
                                    >
                                        {`${texts.quantityText}: ${product?.quantity}`}
                                    </span>
                                    <div
                                        className={
                                            styles['product-item-buttons']
                                        }
                                    >
                                        <button
                                            className={
                                                styles[
                                                    'product-item-update-button'
                                                ]
                                            }
                                            disabled={isPending}
                                            onClick={() =>
                                                handleUpdateProduct(product)
                                            }
                                        >
                                            <i
                                                className={classNames(
                                                    'fal fa-pen-to-square'
                                                )}
                                            />
                                        </button>
                                        <button
                                            className={
                                                styles[
                                                    'product-item-delete-button'
                                                ]
                                            }
                                            disabled={isPending}
                                            onClick={() =>
                                                handleDeleteProductConfirmation(
                                                    product
                                                )
                                            }
                                        >
                                            <i
                                                className={classNames(
                                                    'fal fa-trash'
                                                )}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
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

Products.propTypes = {
    itemsPerPage: PropTypes.number,
    onPaginationChange: PropTypes.func,
};

export default Products;
