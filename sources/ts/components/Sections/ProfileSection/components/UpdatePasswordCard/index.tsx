/**
 * @file index.tsx
 * @description Update password card.
 */

'use strict';
import { FunctionComponent, useState, useRef } from 'react';
import classNames from 'classnames';

import { useAuth } from '@sources/ts/hooks/useAuth';
import { useModal } from '@sources/ts/hooks/useModal';
import apis from '@sources/ts/apis';
import { showToast } from '@sources/ts/components/Toast';
import Button from '@sources/ts/components/Button';
import Input from '@sources/ts/components/Input';
import * as styles from '../../ProfileSection.module.css';
import staticTexts from '@sources/ts/render/static-texts';
import apiStaticTexts from '@sources/ts/apis/emart/static-texts';
const texts = staticTexts?.profileSection?.updatePasswordCard;

/**
 * Update password card.
 * @param props Component properties.
 * @returns Returns the component.
 */
const UpdatePasswordCard: FunctionComponent = () => {
    const { getSessionData, login, logout } = useAuth(),
        { setModal } = useModal();

    const currentPasswordInput = useRef<HTMLInputElement>(null),
        currentPasswordInputFormMessage = useRef<HTMLSpanElement>(null),
        newPasswordInput = useRef<HTMLInputElement>(null),
        newPasswordInputFormMessage = useRef<HTMLSpanElement>(null),
        confirmNewPasswordInput = useRef<HTMLInputElement>(null),
        confirmNewPasswordInputFormMessage = useRef<HTMLSpanElement>(null);

    const [isPending, setIsPending] = useState(false);

    const handleSubmit: React.ButtonHTMLAttributes<HTMLButtonElement>['onClick'] =
        () => {
            if (isPending) return;
            setIsPending(true);

            (async () => {
                const sessionData = await getSessionData();
                if (!sessionData) return;

                let isFormValid = true,
                    focusElement: HTMLInputElement;
                const currentPasswordInputValue =
                        currentPasswordInput.current?.value,
                    newPasswordInputValue = newPasswordInput.current?.value,
                    confirmNewPasswordInputValue =
                        confirmNewPasswordInput.current?.value;

                if (!currentPasswordInputValue) {
                    currentPasswordInputFormMessage.current.innerHTML =
                        texts.currentPasswordInputRequiredFormMessage;
                    if (!focusElement)
                        focusElement = currentPasswordInput.current;
                    isFormValid = false;
                }

                if (!newPasswordInputValue) {
                    newPasswordInputFormMessage.current.innerHTML =
                        texts.newPasswordInputRequiredFormMessage;
                    if (!focusElement) focusElement = newPasswordInput.current;
                    isFormValid = false;
                } else if (
                    newPasswordInputValue?.length < 8 ||
                    newPasswordInputValue?.length > 32
                ) {
                    newPasswordInputFormMessage.current.innerHTML =
                        apiStaticTexts.invalidPasswordLength;
                    if (!focusElement) focusElement = newPasswordInput.current;
                    isFormValid = false;
                } else if (
                    newPasswordInputValue === currentPasswordInputValue
                ) {
                    newPasswordInputFormMessage.current.innerHTML =
                        texts.newPasswordInputMatchOldPasswordFormMessage;
                    if (!focusElement) focusElement = newPasswordInput.current;
                    isFormValid = false;
                }

                if (!confirmNewPasswordInputValue) {
                    confirmNewPasswordInputFormMessage.current.innerHTML =
                        texts.confirmNewPasswordInputRequiredFormMessage;
                    if (!focusElement)
                        focusElement = confirmNewPasswordInput.current;
                    isFormValid = false;
                }

                if (newPasswordInputValue !== confirmNewPasswordInputValue) {
                    confirmNewPasswordInputFormMessage.current.innerHTML =
                        texts.confirmNewPasswordInputNotMatchFormMessage;
                    if (!focusElement)
                        focusElement = confirmNewPasswordInput.current;
                    isFormValid = false;
                }

                if (!isFormValid) {
                    if (focusElement)
                        setTimeout(() => focusElement.focus(), 100);
                    setIsPending(false);
                    return;
                }

                const { message, success } = await apis.emart.updatePassword(
                    sessionData?.username,
                    currentPasswordInputValue,
                    newPasswordInputValue
                );
                if (!success) {
                    console.error(message);
                    if (message?.toLowerCase().includes('không chính xác')) {
                        currentPasswordInputFormMessage.current.innerHTML =
                            message;
                        setTimeout(
                            () => currentPasswordInput.current?.focus(),
                            100
                        );
                    }

                    showToast({
                        variant: 'danger',
                        title: staticTexts.toast.errorDefaultTitle,
                        message,
                        duration: 5000,
                    });
                    setIsPending(false);
                    return;
                }

                const loginResult = await apis.emart.authorize(
                    sessionData?.username,
                    newPasswordInput.current?.value
                );
                if (loginResult?.success) {
                    login(loginResult?.data);
                } else logout();

                currentPasswordInput.current.value = '';
                newPasswordInput.current.value = '';
                confirmNewPasswordInput.current.value = '';
                setModal({
                    type: 'alert',
                    variant: 'success',
                    title: 'Thành công',
                    message: 'Cập nhật thành công mật khẩu.',
                    closeButtonText: 'Đóng',
                    closeButtonVariant: 'primary',
                    iconColor: 'var(--color-primary, blue)',
                });

                setIsPending(false);
            })();
        };

    return (
        <div id="settings-card" className={styles['card']}>
            <div className={styles['card-header']}>
                <span className={styles['card-header-title']}>
                    {texts.title}
                </span>
            </div>
            <div className={styles['card-body']}>
                <p className={styles['card-desc']}>{texts.description}</p>
                <form
                    className={styles['form']}
                    onSubmit={(event) => event.preventDefault()}
                >
                    <div className={styles['form-group']}>
                        <label
                            className={styles['label']}
                            htmlFor="current-password-input"
                        >
                            {texts.currentPasswordInputLabel}
                        </label>
                        <Input
                            inputRef={currentPasswordInput}
                            type="password"
                            id="current-password-input"
                            className={styles['input']}
                            height={40}
                            icon={{ position: 'left', icon: 'fal fa-lock' }}
                            placeholder={texts.currentPasswordInputPlaceholder}
                            autoCapitalize="off"
                            disabled={isPending}
                            onBlur={(event) => {
                                if (currentPasswordInputFormMessage.current) {
                                    if (!event?.currentTarget?.value)
                                        currentPasswordInputFormMessage.current.innerHTML =
                                            texts.currentPasswordInputRequiredFormMessage;
                                    else
                                        currentPasswordInputFormMessage.current.innerHTML =
                                            '';
                                }
                            }}
                            onChange={() => {
                                if (currentPasswordInputFormMessage.current)
                                    currentPasswordInputFormMessage.current.innerHTML =
                                        '';
                            }}
                        />
                        <span
                            ref={currentPasswordInputFormMessage}
                            className={styles['form-message']}
                        ></span>
                    </div>
                    <div className={styles['form-group']}>
                        <label
                            className={styles['label']}
                            htmlFor="new-password-input"
                        >
                            {texts.newPasswordInputLabel}
                        </label>
                        <Input
                            inputRef={newPasswordInput}
                            type="password"
                            id="new-password-input"
                            className={styles['input']}
                            height={40}
                            icon={{ position: 'left', icon: 'fal fa-lock' }}
                            placeholder={texts.newPasswordInputPlaceholder}
                            autoCapitalize="off"
                            disabled={isPending}
                            onBlur={(event) => {
                                if (newPasswordInputFormMessage.current) {
                                    if (!event.currentTarget?.value)
                                        newPasswordInputFormMessage.current.innerHTML =
                                            texts.newPasswordInputRequiredFormMessage;
                                    else if (
                                        event.currentTarget?.value?.length <
                                            8 ||
                                        event.currentTarget?.value?.length > 32
                                    )
                                        newPasswordInputFormMessage.current.innerHTML =
                                            apiStaticTexts.invalidPasswordLength;
                                    else if (
                                        event.currentTarget?.value ===
                                        currentPasswordInput.current?.value
                                    ) {
                                        newPasswordInputFormMessage.current.innerHTML =
                                            texts.newPasswordInputMatchOldPasswordFormMessage;
                                    } else
                                        newPasswordInputFormMessage.current.innerHTML =
                                            '';
                                }
                            }}
                            onChange={() => {
                                if (newPasswordInputFormMessage.current)
                                    newPasswordInputFormMessage.current.innerHTML =
                                        '';
                            }}
                        />
                        <span
                            ref={newPasswordInputFormMessage}
                            className={styles['form-message']}
                        ></span>
                    </div>
                    <div className={styles['form-group']}>
                        <label
                            className={styles['label']}
                            htmlFor="confirm-new-password-input"
                        >
                            {texts.confirmNewPasswordInputLabel}
                        </label>
                        <Input
                            inputRef={confirmNewPasswordInput}
                            type="password"
                            id="confirm-new-password-input"
                            className={styles['input']}
                            height={40}
                            icon={{ position: 'left', icon: 'fal fa-lock' }}
                            placeholder={
                                texts.confirmNewPasswordInputPlaceholder
                            }
                            autoCapitalize="off"
                            disabled={isPending}
                            onBlur={(event) => {
                                if (
                                    confirmNewPasswordInputFormMessage.current
                                ) {
                                    if (!event?.currentTarget?.value)
                                        confirmNewPasswordInputFormMessage.current.innerHTML =
                                            texts.confirmNewPasswordInputRequiredFormMessage;
                                    else if (
                                        event.currentTarget?.value !==
                                        newPasswordInput.current?.value
                                    ) {
                                        confirmNewPasswordInputFormMessage.current.innerHTML =
                                            texts.confirmNewPasswordInputNotMatchFormMessage;
                                    } else
                                        confirmNewPasswordInputFormMessage.current.innerHTML =
                                            '';
                                }
                            }}
                            onChange={() => {
                                if (confirmNewPasswordInputFormMessage.current)
                                    confirmNewPasswordInputFormMessage.current.innerHTML =
                                        '';
                            }}
                        />
                        <span
                            ref={confirmNewPasswordInputFormMessage}
                            className={styles['form-message']}
                        ></span>
                    </div>
                    <Button
                        type="submit"
                        height={40}
                        className={styles['submit']}
                        onClick={handleSubmit}
                        disabled={isPending}
                        loading={isPending}
                    >
                        <i className={classNames('fas fa-save')} />
                        {texts.updateButton}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default UpdatePasswordCard;
