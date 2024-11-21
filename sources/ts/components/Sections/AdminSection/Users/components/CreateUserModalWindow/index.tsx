/**
 * @file index.tsx
 * @description Create user modal window.
 */

'use strict';
import { FunctionComponent, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useAuth } from '@sources/ts/hooks/useAuth';
import { useModal } from '@sources/ts/hooks/useModal';
import { showToast } from '@sources/ts/components/Toast';
import apis from '@sources/ts/apis';
import Input from '@sources/ts/components/Input';
import Button from '@sources/ts/components/Button';
import * as styles from './CreateUserModalWindow.module.css';
import staticTexts from '@sources/ts/render/static-texts';
import staticUrls from '@sources/ts/render/static-urls';
const texts = staticTexts.adminSection.users.createUserWindow;

/**
 * Create user modal window.
 * @param props Component properties.
 * @param props.refreshCallback Refresh callback.
 * @returns Returns the component.
 */
const CreateUserModalWindow: FunctionComponent<{
    refreshCallback?: (silentFetch: boolean) => void;
}> = ({ refreshCallback }) => {
    const { setModalVisibility } = useModal();

    const modalWindow = useRef<HTMLDivElement>(null),
        emailInput = useRef<HTMLInputElement>(null),
        usernameInput = useRef<HTMLInputElement>(null),
        passwordInput = useRef<HTMLInputElement>(null),
        roleInput = useRef<HTMLInputElement>(null),
        userUploadImageInput = useRef<HTMLInputElement>(null);

    const [emailInputValue, setEmailInputValue] = useState(''),
        [usernameInputValue, setUsernameInputValue] = useState(''),
        [passwordInputValue, setPasswordInputValue] = useState(''),
        [roleInputValue, setRoleInputValue] = useState(''),
        [userBlobImageUrl, setProductBlobImageUrl] = useState('');

    const [isPending, setIsPending] = useState(false),
        [buttonLoadingStates, setButtonLoadingStates] = useState({
            upload: false,
            create: false,
        });

    const handleCreateUser = () => {
        if (isPending) return;
        setIsPending(true);
        setButtonLoadingStates({ ...buttonLoadingStates, create: true });
        (async () => {
            modalWindow.current
                ?.querySelectorAll(`.${styles['form-message']}`)
                ?.forEach((formMessage) => {
                    formMessage.innerHTML = '';
                });

            let isFormValid = true,
                focusElement: HTMLInputElement = null;

            if (!emailInputValue) {
                document.getElementById('email-input-form-message').innerHTML =
                    texts.emailInputFormMessageRequire;
                if (!focusElement) focusElement = emailInput.current;
                isFormValid = false;
            } else if (
                !/^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/.test(
                    emailInputValue
                )
            ) {
                document.getElementById('email-input-form-message').innerHTML =
                    texts.emailInputFormMessageInvalidEmail;
                if (!focusElement) focusElement = emailInput.current;
                isFormValid = false;
            }

            if (!usernameInputValue) {
                document.getElementById(
                    'username-input-form-message'
                ).innerHTML = texts.usernameInputFormMessageRequire;
                if (!focusElement) focusElement = usernameInput.current;
                isFormValid = false;
            } else if (!/^[a-zA-Z0-9]+$/.test(usernameInputValue)) {
                document.getElementById(
                    'username-input-form-message'
                ).innerHTML =
                    texts.usernameInputFormMessageInvalidUsernameCharacters;
                if (!focusElement) focusElement = usernameInput.current;
                isFormValid = false;
            } else if (
                usernameInputValue.length < 6 ||
                usernameInputValue.length > 16
            ) {
                document.getElementById(
                    'username-input-form-message'
                ).innerHTML =
                    texts.usernameInputFormMessageInvalidUsernameLength;
                if (!focusElement) focusElement = usernameInput.current;
                isFormValid = false;
            }

            if (!passwordInputValue) {
                document.getElementById(
                    'password-input-form-message'
                ).innerHTML = texts.passwordInputFormMessageRequire;
                if (!focusElement) focusElement = passwordInput.current;
                isFormValid = false;
            } else if (
                passwordInputValue.length < 8 ||
                passwordInputValue.length > 32
            ) {
                document.getElementById(
                    'password-input-form-message'
                ).innerHTML =
                    texts.passwordInputFormMessageInvalidPasswordLength;
                if (!focusElement) focusElement = passwordInput.current;
                isFormValid = false;
            }

            if (!roleInputValue) {
                document.getElementById('role-input-form-message').innerHTML =
                    texts.roleInputFormMessageRequire;
                if (!focusElement) focusElement = roleInput.current;
                isFormValid = false;
            }

            if (!isFormValid) {
                setIsPending(false);
                setButtonLoadingStates({
                    ...buttonLoadingStates,
                    create: false,
                });
                setTimeout(() => focusElement?.focus(), 100);
                return;
            }

            const { message, success } = await apis.backend.createUserAsAdmin(
                usernameInputValue,
                passwordInputValue,
                emailInputValue,
                roleInputValue,
                userUploadImageInput.current?.files?.length
                    ? userUploadImageInput.current?.files[0]
                    : null
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
                    create: false,
                });
                if (!message?.toLocaleLowerCase()?.includes('tồn tại'))
                    setModalVisibility(false);
                return;
            }

            setIsPending(false);
            setButtonLoadingStates({
                ...buttonLoadingStates,
                create: false,
            });
            setModalVisibility(false);
            if (refreshCallback) refreshCallback(true);
        })();
    };

    useEffect(() => {
        return () => {
            if (userBlobImageUrl) URL.revokeObjectURL(userBlobImageUrl);
        };
    }, [userBlobImageUrl]);

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
                <div className={styles['user-image-wrapper']}>
                    <img
                        className={styles['user-image']}
                        src={userBlobImageUrl || staticUrls.avatarPlaceholder}
                        alt={texts.userAvatarImageAlt}
                        onError={(event) => {
                            event.currentTarget.src =
                                staticUrls.avatarPlaceholder;
                        }}
                    />
                    <Button
                        className={styles['upload-user-image-button']}
                        height={40}
                        disabled={isPending}
                        loading={buttonLoadingStates.upload}
                        onClick={() => userUploadImageInput.current?.click()}
                    >
                        <i className={classNames('fas fa-cloud-arrow-up')} />{' '}
                        {texts.uploadButton}
                    </Button>
                    <input
                        ref={userUploadImageInput}
                        className={styles['hidden-user-upload-input']}
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
                    className={styles['user-update-form']}
                    onSubmit={(event) => event.preventDefault()}
                >
                    <div className={styles['form-content']}>
                        <div className={styles['form-group']}>
                            <label
                                className={styles['label']}
                                htmlFor="email-input"
                            >
                                {texts.emailInputLabel}
                            </label>
                            <Input
                                inputRef={emailInput}
                                type="text"
                                id="email-input"
                                className={styles['input']}
                                height={40}
                                icon={{
                                    position: 'left',
                                    icon: 'fal fa-envelope',
                                }}
                                placeholder={texts.emailInputPlaceholder}
                                disabled={isPending}
                                autoCapitalize="off"
                                spellCheck={false}
                                value={emailInputValue}
                                onChange={(event) => {
                                    setEmailInputValue(
                                        event.currentTarget.value
                                    );
                                    const formMessage = document.getElementById(
                                        'email-input-form-message'
                                    );
                                    if (formMessage) formMessage.innerHTML = '';
                                }}
                                onBlur={() => {
                                    const formMessage = document.getElementById(
                                        'email-input-form-message'
                                    );
                                    if (formMessage) {
                                        if (!emailInputValue)
                                            formMessage.innerHTML =
                                                texts.emailInputFormMessageRequire;
                                        else if (
                                            !/^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/.test(
                                                emailInputValue
                                            )
                                        )
                                            formMessage.innerHTML =
                                                texts.emailInputFormMessageInvalidEmail;
                                        else formMessage.innerHTML = '';
                                    }
                                }}
                            />
                            <span
                                id="email-input-form-message"
                                className={styles['form-message']}
                            ></span>
                        </div>
                        <div className={styles['form-group']}>
                            <label
                                className={styles['label']}
                                htmlFor="username-input"
                            >
                                {texts.usernameInputLabel}
                            </label>
                            <Input
                                inputRef={usernameInput}
                                type="text"
                                id="username-input"
                                className={styles['input']}
                                height={40}
                                icon={{
                                    position: 'left',
                                    icon: 'fal fa-user',
                                }}
                                placeholder={texts.usernameInputPlaceholder}
                                disabled={isPending}
                                autoCapitalize="off"
                                spellCheck={false}
                                value={usernameInputValue}
                                onChange={(event) => {
                                    setUsernameInputValue(
                                        event.currentTarget.value
                                    );
                                    const formMessage = document.getElementById(
                                        'username-input-form-message'
                                    );
                                    if (formMessage) formMessage.innerHTML = '';
                                }}
                                onBlur={() => {
                                    const formMessage = document.getElementById(
                                        'username-input-form-message'
                                    );
                                    if (formMessage) {
                                        if (!usernameInputValue)
                                            formMessage.innerHTML =
                                                texts.usernameInputFormMessageRequire;
                                        else if (
                                            !/^[a-zA-Z0-9]+$/.test(
                                                usernameInputValue
                                            )
                                        )
                                            formMessage.innerHTML =
                                                texts.usernameInputFormMessageInvalidUsernameCharacters;
                                        else if (
                                            usernameInputValue.length < 6 ||
                                            usernameInputValue.length > 16
                                        )
                                            formMessage.innerHTML =
                                                texts.usernameInputFormMessageInvalidUsernameLength;
                                        else formMessage.innerHTML = '';
                                    }
                                }}
                            />
                            <span
                                id="username-input-form-message"
                                className={styles['form-message']}
                            ></span>
                        </div>
                        <div className={styles['form-group']}>
                            <label
                                className={styles['label']}
                                htmlFor="password-input"
                            >
                                {texts.passwordInputLabel}
                            </label>
                            <Input
                                inputRef={passwordInput}
                                type="password"
                                id="password-input"
                                className={styles['input']}
                                height={40}
                                icon={{
                                    position: 'left',
                                    icon: 'fal fa-lock',
                                }}
                                placeholder={texts.passwordInputPlaceholder}
                                disabled={isPending}
                                autoCapitalize="off"
                                spellCheck={false}
                                value={passwordInputValue}
                                onChange={(event) => {
                                    setPasswordInputValue(
                                        event.currentTarget.value
                                    );
                                    const formMessage = document.getElementById(
                                        'password-input-form-message'
                                    );
                                    if (formMessage) formMessage.innerHTML = '';
                                }}
                                onBlur={() => {
                                    const formMessage = document.getElementById(
                                        'password-input-form-message'
                                    );
                                    if (formMessage) {
                                        if (!passwordInputValue)
                                            formMessage.innerHTML =
                                                texts.passwordInputFormMessageRequire;
                                        else if (
                                            passwordInputValue.length < 8 ||
                                            passwordInputValue.length > 32
                                        )
                                            formMessage.innerHTML =
                                                texts.passwordInputFormMessageInvalidPasswordLength;
                                        else formMessage.innerHTML = '';
                                    }
                                }}
                            />
                            <span
                                id="password-input-form-message"
                                className={styles['form-message']}
                            ></span>
                        </div>
                        <div className={styles['form-group']}>
                            <label
                                className={styles['label']}
                                htmlFor="role-input"
                            >
                                {texts.roleInputLabel}
                            </label>
                            <Input
                                inputRef={roleInput}
                                type="text"
                                id="role-input"
                                className={styles['input']}
                                height={40}
                                icon={{
                                    position: 'left',
                                    icon: 'fal fa-user',
                                }}
                                placeholder={texts.roleInputPlaceholder}
                                disabled={isPending}
                                autoCapitalize="off"
                                spellCheck={false}
                                value={roleInputValue}
                                onChange={(event) => {
                                    setRoleInputValue(
                                        event.currentTarget.value
                                    );
                                    const formMessage = document.getElementById(
                                        'role-input-form-message'
                                    );
                                    if (formMessage) formMessage.innerHTML = '';
                                }}
                                onBlur={() => {
                                    const formMessage = document.getElementById(
                                        'role-input-form-message'
                                    );
                                    if (formMessage) {
                                        if (!roleInputValue)
                                            formMessage.innerHTML =
                                                texts.roleInputFormMessageRequire;
                                        else formMessage.innerHTML = '';
                                    }
                                }}
                            />
                            <span
                                id="role-input-form-message"
                                className={styles['form-message']}
                            ></span>
                        </div>
                    </div>
                    <div className={styles['form-action']}>
                        <Button
                            className={styles['submit']}
                            height={40}
                            disabled={isPending}
                            loading={buttonLoadingStates.create}
                            onClick={() => handleCreateUser()}
                        >
                            <i className={classNames('fal fa-plus')} />
                            {texts.createButton}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

CreateUserModalWindow.propTypes = {
    refreshCallback: PropTypes.func,
};

export default CreateUserModalWindow;
