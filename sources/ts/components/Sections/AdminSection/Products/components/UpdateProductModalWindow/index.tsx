/**
 * @file index.tsx
 * @description Update product modal window.
 */

'use strict';

import type { Category, Product } from '@sources/ts/types/VyFood';
import { FunctionComponent, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useAuth } from '@sources/ts/hooks/useAuth';
import { useModal } from '@sources/ts/hooks/useModal';
import { showToast } from '@sources/ts/components/Toast';
import apis from '@sources/ts/apis';
import Input from '@sources/ts/components/Input';
import Button from '@sources/ts/components/Button';
import MultipleSelect from '@sources/ts/components/MultipleSelect';
import * as styles from './UpdateProductModalWindow.module.css';
import staticTexts from '@sources/ts/render/static-texts';
import staticUrls from '@sources/ts/render/static-urls';
const texts = staticTexts.adminSection.products.updateProductWindow;

/**
 * Update product modal window.
 * @param props Component properties.
 * @param props.product Product.
 * @param props.refreshCallback Refresh callback.
 * @returns Returns the component.
 */
const UpdateProductModalWindow: FunctionComponent<{
    product: Product;
    refreshCallback: (silentFetch: boolean) => void;
}> = ({ product, refreshCallback }) => {
    const { setModalVisibility } = useModal();

    const modalWindow = useRef<HTMLDivElement>(null),
        productNameInput = useRef<HTMLInputElement>(null),
        productPriceInput = useRef<HTMLInputElement>(null),
        productPriorityInput = useRef<HTMLInputElement>(null),
        productDescInput = useRef<HTMLTextAreaElement>(null),
        productUploadImageInput = useRef<HTMLInputElement>(null);

    const [productNameInputValue, setProductNameInputValue] = useState(
            product.name
        ),
        [productSelectedCategories, setProductSelectedCategories] = useState<
            Category['name'][]
        >([]),
        [productPriceInputValue, setProductPriceInputValue] = useState<
            string | number
        >(product.price),
        [productPriorityInputValue, setProductPriorityInputValue] = useState<
            string | number
        >(product?.priority),
        [productDescInputValue, setProductDescInputValue] = useState(
            product.desc
        ),
        [productBlobImageUrl, setProductBlobImageUrl] = useState('');

    const [categories, setCategories] = useState<Category[]>([]);

    const [isPending, setIsPending] = useState(false),
        [buttonLoadingStates, setButtonLoadingStates] = useState({
            upload: false,
            update: false,
        });

    const handleUpdateProduct = () => {
        if (isPending) return;
        setIsPending(true);
        setButtonLoadingStates({ ...buttonLoadingStates, update: true });
        (async () => {
            modalWindow.current
                ?.querySelectorAll(`.${styles['form-message']}`)
                ?.forEach((formMessage) => {
                    formMessage.innerHTML = '';
                });

            let isFormValid = true,
                focusElement: HTMLInputElement = null;

            if (!productNameInputValue) {
                document.getElementById(
                    'product-name-input-form-message'
                ).innerHTML = texts.nameInputFormMessageRequire;
                if (!focusElement) focusElement = productNameInput.current;
                isFormValid = false;
            }

            if (!productPriceInputValue && productPriceInputValue !== 0) {
                document.getElementById(
                    'product-price-input-form-message'
                ).innerHTML = texts.priceInputFormMessageRequire;
                if (!focusElement) focusElement = productPriceInput.current;
                isFormValid = false;
            }

            if (!productPriorityInputValue && productPriorityInputValue !== 0) {
                document.getElementById(
                    'product-priority-input-form-message'
                ).innerHTML = texts.priorityInputFormMessageRequire;
                if (!focusElement) focusElement = productPriorityInput.current;
                isFormValid = false;
            }

            if (!isFormValid) {
                setIsPending(false);
                setButtonLoadingStates({
                    ...buttonLoadingStates,
                    update: false,
                });
                setTimeout(() => focusElement?.focus(), 100);
                return;
            }

            if (productUploadImageInput.current?.files?.length) {
                const uploadImageResult = await apis.backend.uploadProductImage(
                    product.slug,
                    productUploadImageInput.current?.files[0]
                );
                if (!uploadImageResult.success) {
                    console.error(uploadImageResult.message);
                    setTimeout(
                        () =>
                            showToast({
                                variant: 'danger',
                                title: staticTexts.toast.errorDefaultTitle,
                                message: uploadImageResult.message,
                                duration: 5000,
                            }),
                        100
                    );
                    setIsPending(false);
                    setButtonLoadingStates({
                        ...buttonLoadingStates,
                        update: false,
                    });
                    setModalVisibility(false);
                    return;
                }
            }

            const { message, success } = await apis.backend.updateProduct(
                product.slug,
                productNameInputValue,
                productSelectedCategories?.join(','),
                productDescInputValue,
                parseInt(productPriceInputValue as string),
                productPriorityInputValue as number
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
                setButtonLoadingStates({
                    ...buttonLoadingStates,
                    update: false,
                });
                setModalVisibility(false);
                return;
            }

            setIsPending(false);
            setButtonLoadingStates({
                ...buttonLoadingStates,
                update: false,
            });
            setModalVisibility(false);
            if (refreshCallback) refreshCallback(true);
        })();
    };

    useEffect(() => {
        setIsPending(true);
        (async () => {
            const { message, success, data } = await apis.backend.getCategories(
                1,
                99999
            );
            if (!success) {
                console.error(message);
                setIsPending(false);
                return;
            }

            setCategories(
                data?.categories?.sort((a, b) => b?.priority - a?.priority)
            );

            setIsPending(false);
        })();
    }, []);

    useEffect(() => {
        return () => {
            if (productBlobImageUrl) URL.revokeObjectURL(productBlobImageUrl);
        };
    }, [productBlobImageUrl]);

    return (
        <div ref={modalWindow} className={styles['modal-window']}>
            <span className={styles['title']}>{texts.title}</span>
            <div className={styles['content-wrapper']}>
                <button
                    className={styles['close-button']}
                    onClick={() => {
                        if (
                            !!modalWindow?.current?.querySelector('.is-pending')
                        )
                            return;
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
                <div className={styles['product-image-wrapper']}>
                    <img
                        className={styles['product-image']}
                        src={
                            productBlobImageUrl ||
                            product.imageFileName ||
                            staticUrls.imagePlaceholder
                        }
                        alt={`${texts.productImageAlt} ${product.name}`}
                        onError={(event) => {
                            event.currentTarget.src =
                                staticUrls.imagePlaceholder;
                        }}
                    />
                    <Button
                        className={styles['upload-product-image-button']}
                        height={40}
                        disabled={isPending}
                        loading={buttonLoadingStates.upload}
                        onClick={() => productUploadImageInput.current?.click()}
                    >
                        <i className={classNames('fas fa-cloud-arrow-up')} />{' '}
                        {texts.uploadButton}
                    </Button>
                    <input
                        ref={productUploadImageInput}
                        className={styles['hidden-product-upload-input']}
                        type="file"
                        accept="image/*"
                        multiple={false}
                        onChange={(event) => {
                            setProductBlobImageUrl(
                                URL.createObjectURL(
                                    event.currentTarget.files[0]
                                )
                            );
                        }}
                    />
                </div>
                <form
                    className={styles['product-update-form']}
                    onSubmit={(event) => event.preventDefault()}
                >
                    <div className={styles['form-group']}>
                        <label
                            className={styles['label']}
                            htmlFor="product-name-input"
                        >
                            {texts.nameInputLabel}
                        </label>
                        <Input
                            inputRef={productNameInput}
                            type="text"
                            id="product-name-input"
                            className={styles['input']}
                            height={40}
                            icon={{
                                position: 'left',
                                icon: 'fal fa-input-text',
                            }}
                            placeholder={texts.nameInputPlaceholder}
                            disabled={isPending}
                            autoCapitalize="off"
                            spellCheck={false}
                            value={productNameInputValue}
                            onChange={(event) => {
                                if (event.currentTarget?.value.length <= 255)
                                    setProductNameInputValue(
                                        event.currentTarget.value
                                    );
                                const formMessage = document.getElementById(
                                    'product-name-input-form-message'
                                );
                                if (formMessage) formMessage.innerHTML = '';
                            }}
                            onBlur={() => {
                                const formMessage = document.getElementById(
                                    'product-name-input-form-message'
                                );
                                if (formMessage) {
                                    if (!productNameInputValue)
                                        formMessage.innerHTML =
                                            texts.nameInputFormMessageRequire;
                                    else formMessage.innerHTML = '';
                                }
                            }}
                        />
                        <span
                            id="product-name-input-form-message"
                            className={styles['form-message']}
                        ></span>
                    </div>
                    <div className={styles['form-group']}>
                        <span
                            className={styles['label']}
                            style={{ width: 'fit-content' }}
                            onClick={() =>
                                document
                                    .getElementById(
                                        'admin-update-product-category-select'
                                    )
                                    ?.click()
                            }
                        >
                            {texts.categoryInputLabel}
                        </span>
                        {categories?.length ? (
                            <MultipleSelect
                                key={categories?.length}
                                id="admin-update-product-category-select"
                                disabled={isPending}
                                initialOptions={categories?.map((category) => ({
                                    id: category.slug,
                                    text: category.name,
                                    value: category.slug,
                                    selected: product.category.includes(
                                        category.slug
                                    ),
                                }))}
                                onOptionsChange={(newOptions) =>
                                    setProductSelectedCategories(
                                        newOptions?.map(
                                            (option) => option.value
                                        )
                                    )
                                }
                            />
                        ) : (
                            <MultipleSelect
                                key={categories?.length}
                                initialOptions={[]}
                            />
                        )}
                        <span
                            id="product-category-form-message"
                            className={styles['form-message']}
                        ></span>
                    </div>
                    <div className={styles['form-group']}>
                        <label
                            className={styles['label']}
                            htmlFor="product-price-input"
                        >
                            {texts.priceInputLabel}
                        </label>
                        <Input
                            inputRef={productPriceInput}
                            type="number"
                            id="product-price-input"
                            className={styles['input']}
                            height={40}
                            icon={{
                                position: 'left',
                                icon: 'fal fa-tag',
                            }}
                            placeholder={texts.priceInputPlaceholder}
                            disabled={isPending}
                            autoCapitalize="off"
                            value={
                                Number.isNaN(productPriceInputValue)
                                    ? ''
                                    : productPriceInputValue
                            }
                            onChange={(event) => {
                                setProductPriceInputValue(
                                    parseInt(event.currentTarget.value)
                                );
                                const formMessage = document.getElementById(
                                    'product-price-input-form-message'
                                );
                                if (formMessage) formMessage.innerHTML = '';
                            }}
                            onBlur={() => {
                                const formMessage = document.getElementById(
                                    'product-price-input-form-message'
                                );
                                if (formMessage) {
                                    if (
                                        !productPriceInputValue &&
                                        productPriceInputValue !== 0
                                    )
                                        formMessage.innerHTML =
                                            texts.priceInputFormMessageRequire;
                                    else formMessage.innerHTML = '';
                                }
                            }}
                        />
                        <span
                            id="product-price-input-form-message"
                            className={styles['form-message']}
                        ></span>
                    </div>
                    <div className={styles['form-group']}>
                        <label
                            className={styles['label']}
                            htmlFor="product-priority-input"
                        >
                            {texts.priorityInputLabel}
                        </label>
                        <Input
                            inputRef={productPriorityInput}
                            type="number"
                            id="product-priority-input"
                            className={styles['input']}
                            height={40}
                            icon={{
                                position: 'left',
                                icon: 'fal fa-tag',
                            }}
                            placeholder={texts.priorityInputPlaceholder}
                            disabled={isPending}
                            autoCapitalize="off"
                            value={
                                Number.isNaN(productPriorityInputValue)
                                    ? ''
                                    : productPriorityInputValue
                            }
                            onChange={(event) => {
                                setProductPriorityInputValue(
                                    Math.max(
                                        0,
                                        Math.min(
                                            parseInt(event.currentTarget.value),
                                            999999
                                        )
                                    )
                                );
                                const formMessage = document.getElementById(
                                    'product-priority-input-form-message'
                                );
                                if (formMessage) formMessage.innerHTML = '';
                            }}
                            onBlur={() => {
                                const formMessage = document.getElementById(
                                    'product-priority-input-form-message'
                                );
                                if (formMessage) {
                                    if (
                                        !productPriorityInputValue &&
                                        productPriorityInputValue !== 0
                                    )
                                        formMessage.innerHTML =
                                            texts.priorityInputFormMessageRequire;
                                    else formMessage.innerHTML = '';
                                }
                            }}
                        />
                        <span
                            id="product-priority-input-form-message"
                            className={styles['form-message']}
                        ></span>
                    </div>
                    <div className={styles['form-group']}>
                        <label
                            className={styles['label']}
                            htmlFor="product-desc-input"
                        >
                            {texts.descInputLabel}
                        </label>
                        <textarea
                            ref={productDescInput}
                            id="product-desc-input"
                            className={styles['text-area']}
                            placeholder={texts.descInputPlaceholder}
                            value={productDescInputValue}
                            spellCheck={false}
                            disabled={isPending}
                            onChange={(event) => {
                                setProductDescInputValue(
                                    event.currentTarget.value
                                );
                                const formMessage = document.getElementById(
                                    'product-desc-input-form-message'
                                );
                                if (formMessage) formMessage.innerHTML = '';
                            }}
                            // onBlur={() => {
                            //     const formMessage = document.getElementById(
                            //         'product-desc-input-form-message'
                            //     );
                            // }}
                        />
                        <span
                            id="product-desc-input-form-message"
                            className={styles['form-message']}
                        ></span>
                    </div>
                    <Button
                        className={styles['submit']}
                        height={40}
                        disabled={isPending}
                        loading={buttonLoadingStates.update}
                        onClick={() => handleUpdateProduct()}
                    >
                        <i className={classNames('fas fa-save')} />
                        {texts.updateButton}
                    </Button>
                </form>
            </div>
        </div>
    );
};

UpdateProductModalWindow.propTypes = {
    product: PropTypes.any.isRequired,
    refreshCallback: PropTypes.func,
};

export default UpdateProductModalWindow;
