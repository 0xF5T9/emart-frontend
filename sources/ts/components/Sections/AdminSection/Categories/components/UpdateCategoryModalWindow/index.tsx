/**
 * @file index.tsx
 * @description Update category modal window.
 */

'use strict';

import type { Category } from '@sources/ts/types/VyFood';
import { FunctionComponent, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useAuth } from '@sources/ts/hooks/useAuth';
import { useModal } from '@sources/ts/hooks/useModal';
import { showToast } from '@sources/ts/components/Toast';
import apis from '@sources/ts/apis';
import Input from '@sources/ts/components/Input';
import Button from '@sources/ts/components/Button';
import * as styles from './UpdateCategoryModalWindow.module.css';
import staticTexts from '@sources/ts/render/static-texts';
import staticUrls from '@sources/ts/render/static-urls';
const texts = staticTexts.adminSection.categories.updateCategoryWindow;

/**
 * Update category modal window.
 * @param props Component properties.
 * @param props.category Category.
 * @param props.refreshCallback Refresh callback.
 * @returns Returns the component.
 */
const UpdateCategoryModalWindow: FunctionComponent<{
    category: Category;
    refreshCallback: (silentFetch: boolean) => void;
}> = ({ category, refreshCallback }) => {
    const { setModalVisibility } = useModal();

    const modalWindow = useRef<HTMLDivElement>(null),
        categoryNameInput = useRef<HTMLInputElement>(null),
        categoryPriorityInput = useRef<HTMLInputElement>(null),
        categoryDescInput = useRef<HTMLTextAreaElement>(null),
        categoryUploadImageInput = useRef<HTMLInputElement>(null);

    const [categoryNameInputValue, setCategoryNameInputValue] = useState(
            category.name
        ),
        [categoryPriorityInputValue, setCategoryPriorityInputValue] = useState<
            string | number
        >(category?.priority),
        [categoryDescInputValue, setCategoryDescInputValue] = useState(
            category.desc
        ),
        [categoryBlobImageUrl, setCategoryBlobImageUrl] = useState('');

    const [isPending, setIsPending] = useState(false),
        [buttonLoadingStates, setButtonLoadingStates] = useState({
            upload: false,
            update: false,
        });

    const handleUpdateCategory = () => {
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

            if (!categoryNameInputValue) {
                document.getElementById(
                    'category-name-input-form-message'
                ).innerHTML = texts.nameInputFormMessageRequire;
                if (!focusElement) focusElement = categoryNameInput.current;
                isFormValid = false;
            }

            if (
                !categoryPriorityInputValue &&
                categoryPriorityInputValue !== 0
            ) {
                document.getElementById(
                    'category-priority-input-form-message'
                ).innerHTML = texts.priorityInputFormMessageRequire;
                if (!focusElement) focusElement = categoryPriorityInput.current;
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

            if (categoryUploadImageInput.current?.files?.length) {
                const uploadImageResult =
                    await apis.backend.uploadCategoryImage(
                        category.slug,
                        categoryUploadImageInput.current?.files[0]
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

            const { message, success } = await apis.backend.updateCategory(
                category.slug,
                categoryNameInputValue,
                categoryDescInputValue,
                categoryPriorityInputValue as number
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
        return () => {
            if (categoryBlobImageUrl) URL.revokeObjectURL(categoryBlobImageUrl);
        };
    }, [categoryBlobImageUrl]);

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
                <div className={styles['category-image-wrapper']}>
                    <img
                        className={styles['category-image']}
                        src={
                            categoryBlobImageUrl ||
                            category.imageFileName ||
                            staticUrls.imagePlaceholder
                        }
                        alt={`${texts.categoryImageAlt} ${category.name}`}
                        onError={(event) => {
                            event.currentTarget.src =
                                staticUrls.imagePlaceholder;
                        }}
                    />
                    <Button
                        className={styles['upload-category-image-button']}
                        height={40}
                        disabled={isPending}
                        loading={buttonLoadingStates.upload}
                        onClick={() =>
                            categoryUploadImageInput.current?.click()
                        }
                    >
                        <i className={classNames('fas fa-cloud-arrow-up')} />{' '}
                        {texts.uploadButton}
                    </Button>
                    <input
                        ref={categoryUploadImageInput}
                        className={styles['hidden-category-upload-input']}
                        type="file"
                        accept="image/*"
                        multiple={false}
                        onChange={(event) => {
                            setCategoryBlobImageUrl(
                                URL.createObjectURL(
                                    event.currentTarget.files[0]
                                )
                            );
                        }}
                    />
                </div>
                <form
                    className={styles['category-update-form']}
                    onSubmit={(event) => event.preventDefault()}
                >
                    <div className={styles['form-content']}>
                        <div className={styles['form-group']}>
                            <label
                                className={styles['label']}
                                htmlFor="category-name-input"
                            >
                                {texts.nameInputLabel}
                            </label>
                            <Input
                                inputRef={categoryNameInput}
                                type="text"
                                id="category-name-input"
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
                                value={categoryNameInputValue}
                                onChange={(event) => {
                                    if (
                                        event.currentTarget?.value.length <= 255
                                    )
                                        setCategoryNameInputValue(
                                            event.currentTarget.value
                                        );
                                    const formMessage = document.getElementById(
                                        'category-name-input-form-message'
                                    );
                                    if (formMessage) formMessage.innerHTML = '';
                                }}
                                onBlur={() => {
                                    const formMessage = document.getElementById(
                                        'category-name-input-form-message'
                                    );
                                    if (formMessage) {
                                        if (!categoryNameInputValue)
                                            formMessage.innerHTML =
                                                texts.nameInputFormMessageRequire;
                                        else formMessage.innerHTML = '';
                                    }
                                }}
                            />
                            <span
                                id="category-name-input-form-message"
                                className={styles['form-message']}
                            ></span>
                        </div>
                        <div className={styles['form-group']}>
                            <label
                                className={styles['label']}
                                htmlFor="category-priority-input"
                            >
                                {texts.priorityInputLabel}
                            </label>
                            <Input
                                inputRef={categoryPriorityInput}
                                type="number"
                                id="category-priority-input"
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
                                    Number.isNaN(categoryPriorityInputValue)
                                        ? ''
                                        : categoryPriorityInputValue
                                }
                                onChange={(event) => {
                                    setCategoryPriorityInputValue(
                                        Math.max(
                                            0,
                                            Math.min(
                                                parseInt(
                                                    event.currentTarget.value
                                                ),
                                                999999
                                            )
                                        )
                                    );
                                    const formMessage = document.getElementById(
                                        'category-priority-input-form-message'
                                    );
                                    if (formMessage) formMessage.innerHTML = '';
                                }}
                                onBlur={() => {
                                    const formMessage = document.getElementById(
                                        'category-priority-input-form-message'
                                    );
                                    if (formMessage) {
                                        if (
                                            !categoryPriorityInputValue &&
                                            categoryPriorityInputValue !== 0
                                        )
                                            formMessage.innerHTML =
                                                texts.priorityInputFormMessageRequire;
                                        else formMessage.innerHTML = '';
                                    }
                                }}
                            />
                            <span
                                id="category-priority-input-form-message"
                                className={styles['form-message']}
                            ></span>
                        </div>
                        <div className={styles['form-group']}>
                            <label
                                className={styles['label']}
                                htmlFor="category-desc-input"
                            >
                                {texts.descInputLabel}
                            </label>
                            <textarea
                                ref={categoryDescInput}
                                id="category-desc-input"
                                className={styles['text-area']}
                                placeholder={texts.descInputPlaceholder}
                                value={categoryDescInputValue}
                                spellCheck={false}
                                disabled={isPending}
                                onChange={(event) => {
                                    setCategoryDescInputValue(
                                        event.currentTarget.value
                                    );
                                    const formMessage = document.getElementById(
                                        'category-desc-input-form-message'
                                    );
                                    if (formMessage) formMessage.innerHTML = '';
                                }}
                                // onBlur={() => {
                                //     const formMessage = document.getElementById(
                                //         'category-desc-input-form-message'
                                //     );
                                // }}
                            />
                            <span
                                id="category-desc-input-form-message"
                                className={styles['form-message']}
                            ></span>
                        </div>
                    </div>
                    <div className={styles['form-action']}>
                        <Button
                            className={styles['submit']}
                            height={40}
                            disabled={isPending}
                            loading={buttonLoadingStates.update}
                            onClick={() => handleUpdateCategory()}
                        >
                            <i className={classNames('fas fa-save')} />
                            {texts.updateButton}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

UpdateCategoryModalWindow.propTypes = {
    category: PropTypes.any.isRequired,
    refreshCallback: PropTypes.func,
};

export default UpdateCategoryModalWindow;
