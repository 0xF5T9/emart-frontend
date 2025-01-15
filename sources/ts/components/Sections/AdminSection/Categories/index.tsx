/**
 * @file index.tsx
 * @description Category management.
 */

'use strict';
import type { GetCategoriesCountResponseData } from '@sources/ts/apis/emart/types';
import type { Category } from '@sources/ts/apis/emart/types';
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
import Input from '@sources/ts/components/Input';
import { CircleLoading } from '@sources/ts/components/Icons/CircleLoading';
import CreateCategoryModalWindow from './components/CreateCategoryModalWindow';
import UpdateCategoryModalWindow from './components/UpdateCategoryModalWindow';
import * as styles from './Categories.module.css';
import staticTexts from '@sources/ts/render/static-texts';
import staticUrls from '@sources/ts/render/static-urls';
const texts = staticTexts.adminSection.categories;

/**
 * Category management.
 * @param props Component properties.
 * @param props.itemsPerPage Item per page.
 * @param props.onPaginationChange On pagination change callback.
 * @returns Returns the component.
 */
const Categories: FunctionComponent<{
    itemsPerPage?: number;
    onPaginationChange?: (...args: any[]) => void;
}> = ({ itemsPerPage = 12, onPaginationChange }) => {
    const { setModal, setModalVisibility } = useModal();

    const categoryWrapper = useRef<HTMLDivElement>(null),
        searchInput = useRef<HTMLInputElement>(null);

    const [searchInputValue, setSearchInputValue] = useState('');

    const [categories, setCategories] = useState<Category[]>(null),
        [filteredCategories, setFilteredCategories] =
            useState<Category[]>(null);

    const [categoriesCount, setCategoriesCount] =
        useState<GetCategoriesCountResponseData>(null);

    const [isPending, setIsPending] = useState(false);

    const [status, setStatus] = useState<
        'idle' | 'loading' | 'empty' | 'error'
    >('loading');

    const [pagination, setPagination] = useState(1);

    const indexOfLastItem = pagination * itemsPerPage,
        indexOfFirstItem = indexOfLastItem - itemsPerPage,
        renderItems = filteredCategories?.slice(
            indexOfFirstItem,
            indexOfLastItem
        );
    const totalPagination = [];
    if (filteredCategories)
        for (
            let i = 1;
            i <= Math.ceil(filteredCategories.length / itemsPerPage);
            i++
        )
            totalPagination.push(i);

    const handleRefresh = (silentFetch: boolean = false) => {
        if (isPending) return;

        setIsPending(true);
        if (!silentFetch) setStatus('loading');
        (async () => {
            const getCategoriesResult = await apis.emart.getCategories(
                1,
                99999
            );
            if (!getCategoriesResult.success) {
                console.error(getCategoriesResult.message);
                showToast({
                    variant: 'danger',
                    title: staticTexts.toast.errorDefaultTitle,
                    message: getCategoriesResult.message,
                    duration: 5000,
                });
                setIsPending(false);
                setStatus('error');
                return;
            }

            const rawCategories = getCategoriesResult.data?.categories,
                transformedCategories: Category[] = rawCategories?.map(
                    (uCategory) => {
                        const category: Category = {
                            ...uCategory,
                            imageFileName: uCategory.imageFileName
                                ? `${process.env.UPLOAD_URL}/category/${uCategory.imageFileName}`
                                : staticUrls.imagePlaceholder,
                            priority: uCategory.priority,
                        };
                        return category;
                    }
                );

            const getCategoriesCountResult =
                await apis.emart.getCategoriesCount();
            if (!getCategoriesCountResult.success) {
                console.error(getCategoriesCountResult.message);
                setIsPending(false);
                setStatus('error');
                return;
            }

            setCategories(transformedCategories);
            setCategoriesCount(getCategoriesCountResult?.data);
            setStatus(transformedCategories?.length ? 'idle' : 'empty');
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
                categoryWrapper.current?.scrollTo({
                    behavior: 'smooth',
                    top: 0,
                }),
            50
        );
    };

    const handleCreateCategory = () => {
        setModal({
            type: 'custom',
            content: (
                <CreateCategoryModalWindow refreshCallback={handleRefresh} />
            ),
        });
    };

    const handleUpdateCategory = (category: Category) => {
        setModal({
            type: 'custom',
            content: (
                <UpdateCategoryModalWindow
                    category={category}
                    refreshCallback={handleRefresh}
                />
            ),
        });
    };

    const handleDeleteCategoryConfirmation = (category: Category) => {
        setModal({
            type: 'alert',
            title: texts.deleteCategoryConfirmationWindow.title,
            message: texts.deleteCategoryConfirmationWindow.message,
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
                        {texts.deleteCategoryConfirmationWindow.cancelButton}
                    </Button>
                    <Button
                        onClick={() => {
                            handleDeleteCategory(category);
                            setModalVisibility(false);
                        }}
                    >
                        {texts.deleteCategoryConfirmationWindow.confirmButton}
                    </Button>
                </>
            ),
        });
    };

    const handleDeleteCategory = (category: Category) => {
        if (isPending) return;
        setIsPending(true);

        (async () => {
            const { message, success } = await apis.emart.deleteCategory(
                category.slug
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
        handleRefresh(false);
    }, []);

    useEffect(() => {
        const newFilteredProducts = categories
            ?.filter((item) => {
                if (
                    searchInput.current?.value &&
                    !item.name
                        .toLowerCase()
                        .includes(searchInput.current?.value?.toLowerCase())
                )
                    return false;
                return true;
            })
            ?.sort((a, b) => {
                return b?.priority - a?.priority;
            });

        // setPagination(1);
        setFilteredCategories(newFilteredProducts);
        if (status !== 'loading')
            setStatus(newFilteredProducts?.length ? 'idle' : 'empty');
    }, [categories, searchInputValue]);

    useEffect(() => {
        setPagination(1);
    }, [searchInputValue]);

    useEffect(() => {
        if (pagination > totalPagination?.length) setPagination(1);
    }, [filteredCategories]);

    return (
        <div className={styles['content-wrapper']}>
            <span className={styles['title']}>{texts.title}</span>
            <div className={styles['controls-wrapper']}>
                <div className={styles['controls-inputs']}>
                    <Input
                        inputRef={searchInput}
                        id="admin-search-category-input"
                        className={styles['search-input']}
                        height={40}
                        icon={{
                            position: 'left',
                            icon: 'fal fa-magnifying-glass',
                        }}
                        placeholder={texts.searchCategoryInputPlaceholder}
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
                        id="refresh-categories-button"
                        className={styles['control-button']}
                        height={40}
                        disabled={isPending || status === 'error'}
                        onClick={() => {
                            handleRefresh(false);
                            setTimeout(
                                () =>
                                    categoryWrapper.current?.scrollTo({
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
                        id="add-category-button"
                        className={styles['control-button']}
                        onClick={() => handleCreateCategory()}
                        height={40}
                        disabled={isPending || status === 'error'}
                    >
                        <i className={classNames('fal fa-plus')} />{' '}
                        <span>{texts.addButton}</span>
                    </Button>
                </div>
            </div>
            <span className={styles['categories-count']}>
                {filteredCategories?.length || 0} {texts.itemUnitText}
            </span>
            <div ref={categoryWrapper} className={styles['categories-wrapper']}>
                {status === 'idle' && (
                    <ul className={styles['category-list']}>
                        {renderItems?.map((category) => (
                            <li
                                key={`${category.slug}-${pagination}`}
                                className={styles['category-item']}
                            >
                                <div
                                    className={
                                        styles['category-item-content-left']
                                    }
                                >
                                    <div
                                        className={
                                            styles[
                                                'category-item-image-wrapper'
                                            ]
                                        }
                                        onClick={() =>
                                            handleUpdateCategory(category)
                                        }
                                    >
                                        <img
                                            className={
                                                styles['category-item-image']
                                            }
                                            src={
                                                category?.imageFileName ||
                                                staticUrls.imagePlaceholder
                                            }
                                            alt={`Hình ảnh ${category?.name}`}
                                            onError={(event) => {
                                                event.currentTarget.src =
                                                    staticUrls.imagePlaceholder;
                                            }}
                                        />
                                    </div>
                                    <div
                                        className={styles['category-item-info']}
                                    >
                                        <span
                                            className={
                                                styles['category-item-name']
                                            }
                                            onClick={() =>
                                                handleUpdateCategory(category)
                                            }
                                        >
                                            {category?.name}
                                        </span>
                                        {category?.desc && (
                                            <span
                                                className={
                                                    styles['category-item-desc']
                                                }
                                            >
                                                {category?.desc}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div
                                    className={
                                        styles['category-item-content-right']
                                    }
                                >
                                    <span
                                        className={
                                            styles[
                                                'category-item-total-products'
                                            ]
                                        }
                                    >
                                        {`${
                                            categoriesCount?.find(
                                                (item) =>
                                                    item?.slug ===
                                                    category?.slug
                                            )?.count || 0
                                        } ${texts.productUnitText}`}
                                    </span>
                                    <div
                                        className={
                                            styles['category-item-buttons']
                                        }
                                    >
                                        <button
                                            className={
                                                styles[
                                                    'category-item-update-button'
                                                ]
                                            }
                                            disabled={isPending}
                                            onClick={() =>
                                                handleUpdateCategory(category)
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
                                                    'category-item-delete-button'
                                                ]
                                            }
                                            disabled={isPending}
                                            onClick={() =>
                                                handleDeleteCategoryConfirmation(
                                                    category
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

Categories.propTypes = {
    itemsPerPage: PropTypes.number,
    onPaginationChange: PropTypes.func,
};

export default Categories;
