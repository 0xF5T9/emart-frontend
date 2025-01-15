/**
 * @file index.tsx
 * @description User modal window.
 */

'use strict';
import { FunctionComponent, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useAuth } from '@sources/ts/hooks/useAuth';
import { useModal } from '@sources/ts/hooks/useModal';
import apis from '@sources/ts/apis';
import Input from '@sources/ts/components/Input';
import Checkbox from '@sources/ts/components/Checkbox';
import Button from '@sources/ts/components/Button';
import * as styles from './UserModalWindow.module.css';
import staticTexts from '@sources/ts/render/static-texts';
import apiStaticTexts from '@sources/ts/apis/emart/static-texts';
const texts = staticTexts.header.userModalWindow;

/**
 * Login form.
 * @param props Component properties.
 * @returns Returns the component.
 */
const LoginForm: FunctionComponent = () => {
    const { login } = useAuth(),
        { setModalVisibility } = useModal();

    const usernameInput = useRef<HTMLInputElement>(),
        passwordInput = useRef<HTMLInputElement>(),
        serverMessage = useRef<HTMLSpanElement>();

    const [pending, setPending] = useState(false);

    const [usernameInputValue, setUsernameInputValue] = useState(''),
        [passwordInputValue, setPasswordInputValue] = useState('');

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
        event
    ) => {
        event.preventDefault();
        if (pending) return;
        serverMessage.current.innerHTML = '';
        document
            .querySelectorAll(`.${styles['form-message']}`)
            .forEach((element) => {
                element.innerHTML = '';
            });
        if (!usernameInputValue) {
            usernameInput?.current?.focus();
            document.getElementById('username-input-form-message').innerHTML =
                texts.loginForm.usernameInputFormMessageRequire;
            return;
        }
        if (!passwordInputValue) {
            passwordInput?.current?.focus();
            document.getElementById('password-input-form-message').innerHTML =
                texts.loginForm.passwordInputFormMessageRequire;
            return;
        }

        setPending(true);

        const { message, success, data } = await apis.emart.authorize(
            usernameInputValue,
            passwordInputValue
        );
        if (!success) {
            console.warn(message);
            setPasswordInputValue('');
            setPending(false);
            setTimeout(() => {
                passwordInput?.current?.focus();
            }, 100);
            serverMessage.current.innerHTML =
                message === apiStaticTexts.unknownError
                    ? apiStaticTexts.maintenanceError
                    : message;
            return;
        }

        serverMessage.current.innerHTML = texts.loginForm.redirectMessage;
        setTimeout(async () => {
            await login(data);
            setModalVisibility(false);
        }, 300);
    };

    return (
        <form
            className={classNames(styles['login-form'], {
                'is-pending': pending,
            })}
            onSubmit={handleSubmit}
        >
            <div className={styles['form-group']}>
                <label className={styles['label']} htmlFor="username-input">
                    {texts.loginForm.usernameInputLabel}
                </label>
                <Input
                    inputRef={usernameInput}
                    type="text"
                    spellCheck={false}
                    id="username-input"
                    className={styles['input']}
                    height={40}
                    icon={{ position: 'left', icon: 'fal fa-user' }}
                    placeholder={texts.loginForm.usernameInputPlaceholder}
                    disabled={pending}
                    autoCapitalize="off"
                    value={usernameInputValue}
                    onChange={(event) => {
                        setUsernameInputValue(event.currentTarget.value);
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
                                    texts.loginForm.usernameInputFormMessageRequire;
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
                <label className={styles['label']} htmlFor="password-input">
                    {texts.loginForm.passwordInputLabel}
                </label>
                <Input
                    inputRef={passwordInput}
                    type="password"
                    id="password-input"
                    className={styles['input']}
                    height={40}
                    icon={{ position: 'left', icon: 'fal fa-lock' }}
                    placeholder={texts.loginForm.passwordInputPlaceholder}
                    value={passwordInputValue}
                    disabled={pending}
                    autoComplete="on"
                    onChange={(event) => {
                        setPasswordInputValue(event.currentTarget.value);
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
                                    texts.loginForm.passwordInputFormMessageRequire;
                            else formMessage.innerHTML = '';
                        }
                    }}
                />
                <span
                    id="password-input-form-message"
                    className={styles['form-message']}
                ></span>
            </div>
            <Button
                className={styles['submit']}
                height={40}
                disabled={pending}
                loading={pending}
            >
                {texts.loginForm.loginButton}
            </Button>
            <span
                ref={serverMessage}
                className={styles['server-message']}
            ></span>
        </form>
    );
};

/**
 * Forgot password form.
 * @param props Component properties.
 * @returns Returns the component.
 */
const ForgotPasswordForm: FunctionComponent = () => {
    const emailInput = useRef<HTMLInputElement>(),
        serverMessage = useRef<HTMLSpanElement>();

    const [pending, setPending] = useState(false);

    const [emailInputValue, setEmailInputValue] = useState('');

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
        event
    ) => {
        event.preventDefault();
        if (pending) return;
        serverMessage.current.innerHTML = '';
        document
            .querySelectorAll(`.${styles['form-message']}`)
            .forEach((element) => {
                element.innerHTML = '';
            });

        if (!emailInputValue) {
            emailInput?.current?.focus();
            document.getElementById('email-input-form-message').innerHTML =
                texts.forgotPasswordForm.emailInputFormMessageRequire;
            return;
        }
        if (
            !/^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/.test(
                emailInputValue
            )
        ) {
            emailInput?.current?.focus();
            document.getElementById('email-input-form-message').innerHTML =
                texts.forgotPasswordForm.emailInputFormMessageInvalidEmail;
            return;
        }

        setPending(true);

        const { message, success } =
            await apis.emart.forgotPassword(emailInputValue);
        if (!success) {
            console.warn(message);
            setPending(false);
            serverMessage.current.innerHTML =
                message === apiStaticTexts.unknownError
                    ? apiStaticTexts.maintenanceError
                    : message;
            return;
        }

        setPending(false);
        setEmailInputValue('');
        serverMessage.current.innerHTML = message;
    };

    return (
        <form
            className={classNames(styles['forgot-password-form'], {
                'is-pending': pending,
            })}
            onSubmit={handleSubmit}
        >
            <div className={styles['form-group']}>
                <label className={styles['label']} htmlFor="email-input">
                    {texts.forgotPasswordForm.emailInputLabel}
                </label>
                <Input
                    inputRef={emailInput}
                    type="email"
                    id="email-input"
                    className={styles['input']}
                    height={40}
                    icon={{ position: 'left', icon: 'fal fa-envelope' }}
                    placeholder={texts.forgotPasswordForm.emailInputPlaceholder}
                    disabled={pending}
                    autoCapitalize="off"
                    value={emailInputValue}
                    onChange={(event) => {
                        setEmailInputValue(event.currentTarget.value);
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
                                    texts.forgotPasswordForm.emailInputFormMessageRequire;
                            else formMessage.innerHTML = '';
                        }
                    }}
                />
                <span
                    id="email-input-form-message"
                    className={styles['form-message']}
                ></span>
            </div>
            <Button
                className={styles['submit']}
                height={40}
                disabled={pending}
                loading={pending}
            >
                {texts.forgotPasswordForm.recoverButton}
            </Button>
            <span
                ref={serverMessage}
                className={styles['server-message']}
            ></span>
        </form>
    );
};

/**
 * Register form.
 * @param props Component properties.
 * @returns Returns the component.
 */
const RegisterForm: FunctionComponent = () => {
    const { login } = useAuth(),
        { setModalVisibility } = useModal();

    const emailInput = useRef<HTMLInputElement>(),
        usernameInput = useRef<HTMLInputElement>(),
        passwordInput = useRef<HTMLInputElement>(),
        passwordConfirmInput = useRef<HTMLInputElement>(),
        agreementInput = useRef<HTMLInputElement>(),
        serverMessage = useRef<HTMLSpanElement>();

    const [pending, setPending] = useState(false);

    const [emailInputValue, setEmailInputValue] = useState(''),
        [usernameInputValue, setUsernameInputValue] = useState(''),
        [passwordInputValue, setPasswordInputValue] = useState(''),
        [passwordConfirmInputValue, setPasswordConfirmInputValue] =
            useState(''),
        [agreementInputValue, setAgreementInputValue] = useState(false);

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
        event
    ) => {
        event.preventDefault();
        if (pending) return;
        serverMessage.current.innerHTML = '';
        document
            .querySelectorAll(`.${styles['form-message']}`)
            .forEach((element) => {
                element.innerHTML = '';
            });

        if (!emailInputValue) {
            emailInput?.current?.focus();
            document.getElementById('email-input-form-message').innerHTML =
                texts.registerForm.emailInputFormMessageRequire;
            return;
        }
        if (
            !/^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/.test(
                emailInputValue
            )
        ) {
            emailInput?.current?.focus();
            document.getElementById('email-input-form-message').innerHTML =
                texts.registerForm.emailInputFormMessageInvalidEmail;
            return;
        }
        if (!usernameInputValue) {
            usernameInput?.current?.focus();
            document.getElementById('username-input-form-message').innerHTML =
                texts.registerForm.usernameInputFormMessageRequire;
            return;
        }
        if (!/^[a-zA-Z0-9]+$/.test(usernameInputValue)) {
            usernameInput?.current?.focus();
            document.getElementById('username-input-form-message').innerHTML =
                texts.registerForm.usernameInputFormMessageInvalidUsernameCharacters;
            return;
        }
        if (usernameInputValue.length < 6 || usernameInputValue.length > 16) {
            usernameInput?.current?.focus();
            document.getElementById('username-input-form-message').innerHTML =
                texts.registerForm.usernameInputFormMessageInvalidUsernameLength;
            return;
        }
        if (!passwordInputValue) {
            passwordInput?.current?.focus();
            document.getElementById('password-input-form-message').innerHTML =
                texts.registerForm.passwordInputFormMessageRequire;
            return;
        }
        if (passwordInputValue.length < 8 || passwordInputValue.length > 32) {
            passwordInput?.current?.focus();
            document.getElementById('password-input-form-message').innerHTML =
                texts.registerForm.passwordInputFormMessageInvalidPasswordLength;
            return;
        }
        if (!passwordConfirmInputValue) {
            passwordConfirmInput?.current?.focus();
            document.getElementById(
                'password-confirm-input-form-message'
            ).innerHTML = texts.registerForm.passwordInputFormMessageRequire;
            return;
        }
        if (passwordConfirmInputValue !== passwordInputValue) {
            passwordConfirmInput?.current?.focus();
            document.getElementById(
                'password-confirm-input-form-message'
            ).innerHTML = texts.registerForm.passwordInputFormMessageNotMatch;
            return;
        }
        if (!agreementInputValue) {
            agreementInput?.current?.focus();
            document.getElementById('agreement-input-form-message').innerHTML =
                texts.registerForm.tosCheckboxFormMessageRequire;
            return;
        }

        setPending(true);

        const { message: registerMessage, success: isRegisterSuccess } =
            await apis.emart.register(
                emailInputValue,
                usernameInputValue,
                passwordInputValue
            );
        if (!isRegisterSuccess) {
            console.warn(registerMessage);
            setPasswordInputValue('');
            setPasswordConfirmInputValue('');
            setPending(false);
            serverMessage.current.innerHTML =
                registerMessage === apiStaticTexts.unknownError
                    ? apiStaticTexts.maintenanceError
                    : registerMessage;
            return;
        }

        const {
            message: loginMessage,
            success: isLoginSuccess,
            data,
        } = await apis.emart.authorize(usernameInputValue, passwordInputValue);
        if (!isLoginSuccess) {
            console.warn(loginMessage);
            setPasswordInputValue('');
            setPasswordConfirmInputValue('');
            setPending(false);
            serverMessage.current.innerHTML =
                registerMessage === apiStaticTexts.unknownError
                    ? apiStaticTexts.maintenanceError
                    : registerMessage;
            return;
        }

        serverMessage.current.innerHTML = texts.registerForm.redirectMessage;
        setTimeout(async () => {
            await login(data);
            setModalVisibility(false);
        }, 300);
    };

    return (
        <form
            className={classNames(styles['register-form'], {
                'is-pending': pending,
            })}
            onSubmit={handleSubmit}
        >
            <div className={styles['form-group']}>
                <label className={styles['label']} htmlFor="email-input">
                    {texts.registerForm.emailInputLabel}
                </label>
                <Input
                    inputRef={emailInput}
                    type="email"
                    id="email-input"
                    className={styles['input']}
                    height={40}
                    icon={{ position: 'left', icon: 'fal fa-envelope' }}
                    placeholder={texts.registerForm.emailInputPlaceholder}
                    disabled={pending}
                    value={emailInputValue}
                    onChange={(event) => {
                        setEmailInputValue(event.currentTarget.value);
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
                                    texts.registerForm.emailInputFormMessageRequire;
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
                <label className={styles['label']} htmlFor="username-input">
                    {texts.registerForm.usernameInputLabel}
                </label>
                <Input
                    inputRef={usernameInput}
                    type="text"
                    id="username-input"
                    className={styles['input']}
                    height={40}
                    icon={{ position: 'left', icon: 'fal fa-user' }}
                    placeholder={texts.registerForm.usernameInputPlaceholder}
                    disabled={pending}
                    autoCapitalize="off"
                    value={usernameInputValue}
                    onChange={(event) => {
                        setUsernameInputValue(event.currentTarget.value);
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
                                    texts.registerForm.usernameInputFormMessageRequire;
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
                <label className={styles['label']} htmlFor="password-input">
                    {texts.registerForm.passwordInputLabel}
                </label>
                <Input
                    inputRef={passwordInput}
                    type="password"
                    id="password-input"
                    className={styles['input']}
                    height={40}
                    icon={{ position: 'left', icon: 'fal fa-lock' }}
                    placeholder={texts.registerForm.passwordInputPlaceholder}
                    value={passwordInputValue}
                    disabled={pending}
                    autoComplete="on"
                    onChange={(event) => {
                        setPasswordInputValue(event.currentTarget.value);
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
                                    texts.registerForm.passwordInputFormMessageRequire;
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
                    htmlFor="password-confirm-input"
                >
                    {texts.registerForm.confirmPasswordInputLabel}
                </label>
                <Input
                    inputRef={passwordConfirmInput}
                    type="password"
                    id="password-confirm-input"
                    className={styles['input']}
                    height={40}
                    icon={{ position: 'left', icon: 'fal fa-lock' }}
                    placeholder={
                        texts.registerForm.confirmPasswordInputPlaceholder
                    }
                    value={passwordConfirmInputValue}
                    disabled={pending}
                    autoComplete="on"
                    onChange={(event) => {
                        setPasswordConfirmInputValue(event.currentTarget.value);
                        const formMessage = document.getElementById(
                            'password-confirm-input-form-message'
                        );
                        if (formMessage) formMessage.innerHTML = '';
                    }}
                    onBlur={() => {
                        const formMessage = document.getElementById(
                            'password-confirm-input-form-message'
                        );
                        if (formMessage) {
                            if (!passwordConfirmInputValue)
                                formMessage.innerHTML =
                                    texts.registerForm.passwordInputFormMessageRequire;
                            else formMessage.innerHTML = '';
                        }
                    }}
                />
                <span
                    id="password-confirm-input-form-message"
                    className={styles['form-message']}
                ></span>
            </div>
            <div className={styles['form-group']}>
                <Checkbox
                    id="agreement-input"
                    checked={agreementInputValue}
                    onChange={(event) => {
                        setAgreementInputValue(event.currentTarget.checked);
                        const formMessage = document.getElementById(
                            'agreement-input-form-message'
                        );
                        if (formMessage) {
                            if (!event.currentTarget.checked)
                                formMessage.innerHTML =
                                    texts.registerForm.tosCheckboxFormMessageRequire;
                            else formMessage.innerHTML = '';
                        }
                    }}
                    labelHTML={
                        <span className={styles['agreement-text']}>
                            {texts.registerForm.argreementText}{' '}
                            <a
                                className={styles['term-of-service-link']}
                                href="#"
                                tabIndex={-1}
                            >
                                {texts.registerForm.argreementTextLink}
                            </a>
                        </span>
                    }
                />
                <span
                    id="agreement-input-form-message"
                    className={styles['form-message']}
                ></span>
            </div>
            <Button
                className={styles['submit']}
                height={40}
                disabled={pending}
                loading={pending}
            >
                {texts.registerForm.registerButton}
            </Button>
            <span
                ref={serverMessage}
                className={styles['server-message']}
            ></span>
        </form>
    );
};

const Separator: FunctionComponent<{ text: string }> = ({ text }) => {
    return (
        <>
            <style>{`.${styles['hr']}::after { content: '${text}' !important; }`}</style>
            <div className={styles['hr']} />
        </>
    );
};

/**
 * User modal window.
 * @param props Component properties.
 * @param props.initForm Initial form. (default: 'login')
 * @returns Returns the component.
 */
const UserModalWindow: FunctionComponent<{
    initForm: 'login' | 'register' | 'forgot-password';
}> = ({ initForm = 'login' }) => {
    const { setModalVisibility } = useModal();

    const modalWindow = useRef<HTMLDivElement>();

    const [form, setForm] = useState<'login' | 'register' | 'forgot-password'>(
        initForm
    );

    function handleChangeForm(
        formType: 'login' | 'register' | 'forgot-password'
    ) {
        if (!!!modalWindow?.current?.querySelector('.is-pending')) {
            setForm(formType);
        }
    }

    useEffect(() => {
        const modalOverlay = modalWindow?.current?.parentElement?.parentElement;

        const handleOverlayDoubleClick: HTMLDivElement['ondblclick'] = (
            event
        ) => {
            if (event.target !== event.currentTarget) return;
            if (!!modalWindow?.current?.querySelector('.is-pending')) return;
            setModalVisibility(false);
        };

        const handleEscapeKeyPress: HTMLDivElement['onkeydown'] = (event) => {
            if (
                event.keyCode === 27 &&
                !!!modalWindow?.current?.querySelector('.is-pending')
            )
                setModalVisibility(false);
        };

        modalOverlay?.addEventListener('dblclick', handleOverlayDoubleClick);
        window.addEventListener('keydown', handleEscapeKeyPress);
        return () => {
            modalOverlay?.removeEventListener(
                'dblclick',
                handleOverlayDoubleClick
            );
            window.removeEventListener('keydown', handleEscapeKeyPress);
        };
    }, []);

    return (
        <div ref={modalWindow} className={styles['modal-window']}>
            <span className={styles['title']}>
                {form === 'login'
                    ? texts.loginForm.title
                    : form === 'register'
                      ? texts.registerForm.title
                      : texts.forgotPasswordForm.title}
            </span>
            <span className={styles['subtitle']}>
                {form === 'login'
                    ? texts.loginForm.subtitle
                    : form === 'register'
                      ? texts.registerForm.subtitle
                      : texts.forgotPasswordForm.subtitle}
            </span>
            {form === 'login' ? (
                <LoginForm />
            ) : form === 'register' ? (
                <RegisterForm />
            ) : (
                <ForgotPasswordForm />
            )}
            <span className={styles['change-form']}>
                {form === 'login' ? (
                    <span>
                        {texts.registerSuggestionText}{' '}
                        <span
                            className={styles['change-form-button']}
                            onClick={() => handleChangeForm('register')}
                        >
                            {texts.registerSuggestionTextLink}
                        </span>
                    </span>
                ) : (
                    <span>
                        {texts.loginSuggestionText}{' '}
                        <span
                            className={styles['change-form-button']}
                            onClick={() => handleChangeForm('login')}
                        >
                            {texts.loginSuggestionTextLink}
                        </span>
                    </span>
                )}
            </span>
            {form === 'login' && (
                <>
                    <Separator text={texts.separatorText} />
                    <span className={styles['change-form']}>
                        {texts.forgotPasswordSuggestionText}{' '}
                        <span
                            className={styles['change-form-button']}
                            onClick={() => handleChangeForm('forgot-password')}
                        >
                            {texts.forgotPasswordSuggestionTextLink}
                        </span>
                    </span>
                </>
            )}
            <button
                className={styles['close-button']}
                onClick={() => {
                    if (!!modalWindow?.current?.querySelector('.is-pending'))
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
        </div>
    );
};

UserModalWindow.propTypes = {
    initForm: PropTypes.oneOf(['login', 'register', 'forgot-password']),
};

export default UserModalWindow;
