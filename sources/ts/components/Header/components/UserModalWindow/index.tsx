/**
 * @file index.tsx
 * @description User modal window.
 */

'use strict';
import { FunctionComponent, useState, useEffect, useRef } from 'react';
import jwt from 'jsonwebtoken';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useAuth } from '@sources/ts/hooks/useAuth';
import { useModal } from '@sources/ts/hooks/useModal';
import apis from '@sources/ts/apis';
import Input from '@sources/ts/components/Input';
import Checkbox from '@sources/ts/components/Checkbox';
import Button from '@sources/ts/components/Button';
import * as styles from './UserModalWindow.module.css';

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
                'Vui lòng nhập tên người dùng';
            return;
        }
        if (!passwordInputValue) {
            passwordInput?.current?.focus();
            document.getElementById('password-input-form-message').innerHTML =
                'Vui lòng nhập mật khẩu';
            return;
        }

        setPending(true);

        const { message, success, data } = await apis.backend.authorize(
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
                message === 'Có lỗi xảy ra.'
                    ? 'Hệ thống đang bảo trì, vui lòng thử lại sau.'
                    : message;
            return;
        }

        serverMessage.current.innerHTML =
            'Đăng nhập thành công, đang chuyển hướng...';
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
                    Tên người dùng
                </label>
                <Input
                    inputRef={usernameInput}
                    type="text"
                    spellCheck={false}
                    id="username-input"
                    className={styles['input']}
                    height={40}
                    icon={{ position: 'left', icon: 'fal fa-user' }}
                    placeholder="Nhập tên người dùng"
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
                                    'Vui lòng nhập tên người dùng';
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
                    Mật khẩu
                </label>
                <Input
                    inputRef={passwordInput}
                    type="password"
                    id="password-input"
                    className={styles['input']}
                    height={40}
                    icon={{ position: 'left', icon: 'fal fa-lock' }}
                    placeholder="Nhập mật khẩu"
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
                                    'Vui lòng nhập mật khẩu';
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
                Đăng nhập
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
                'Vui lòng nhập địa chỉ email';
            return;
        }
        if (
            !/^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/.test(
                emailInputValue
            )
        ) {
            emailInput?.current?.focus();
            document.getElementById('email-input-form-message').innerHTML =
                'Địa chỉ email không hợp lệ (Chỉ hỗ trợ Gmail)';
            return;
        }

        setPending(true);

        const { message, success } =
            await apis.backend.forgotPassword(emailInputValue);
        if (!success) {
            console.warn(message);
            setPending(false);
            serverMessage.current.innerHTML =
                message === 'Có lỗi xảy ra.'
                    ? 'Hệ thống đang bảo trì, vui lòng thử lại sau.'
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
                    Email
                </label>
                <Input
                    inputRef={emailInput}
                    type="email"
                    id="email-input"
                    className={styles['input']}
                    height={40}
                    icon={{ position: 'left', icon: 'fal fa-envelope' }}
                    placeholder="Nhập địa chỉ email"
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
                                    'Vui lòng nhập địa chỉ email';
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
                Quên mật khẩu
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
                'Vui lòng nhập địa chỉ email';
            return;
        }
        if (
            !/^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/.test(
                emailInputValue
            )
        ) {
            emailInput?.current?.focus();
            document.getElementById('email-input-form-message').innerHTML =
                'Địa chỉ email không hợp lệ (Chỉ hỗ trợ Gmail)';
            return;
        }
        if (!usernameInputValue) {
            usernameInput?.current?.focus();
            document.getElementById('username-input-form-message').innerHTML =
                'Vui lòng nhập tên người dùng';
            return;
        }
        if (!/^[a-zA-Z0-9]+$/.test(usernameInputValue)) {
            usernameInput?.current?.focus();
            document.getElementById('username-input-form-message').innerHTML =
                'Tên tài khoản chứa ký tự không hợp lệ [a-zA-Z0-9]';
            return;
        }
        if (usernameInputValue.length < 6 || usernameInputValue.length > 16) {
            usernameInput?.current?.focus();
            document.getElementById('username-input-form-message').innerHTML =
                'Tên tài khoản phải có tối thiểu 6 ký tự và tối đa 16 ký tự';
            return;
        }
        if (!passwordInputValue) {
            passwordInput?.current?.focus();
            document.getElementById('password-input-form-message').innerHTML =
                'Vui lòng nhập mật khẩu';
            return;
        }
        if (passwordInputValue.length < 8 || passwordInputValue.length > 32) {
            passwordInput?.current?.focus();
            document.getElementById('password-input-form-message').innerHTML =
                'Mật khẩu phải có tối thiểu 8 ký tự và tối đa 32 ký tự';
            return;
        }
        if (!passwordConfirmInputValue) {
            passwordConfirmInput?.current?.focus();
            document.getElementById(
                'password-confirm-input-form-message'
            ).innerHTML = 'Vui lòng nhập mật khẩu';
            return;
        }
        if (passwordConfirmInputValue !== passwordInputValue) {
            passwordConfirmInput?.current?.focus();
            document.getElementById(
                'password-confirm-input-form-message'
            ).innerHTML = 'Mật khẩu không trùng khớp';
            return;
        }
        if (!agreementInputValue) {
            agreementInput?.current?.focus();
            document.getElementById('agreement-input-form-message').innerHTML =
                'Bạn phải đồng ý điều khoản sử dụng để tiếp tục';
            return;
        }

        setPending(true);

        const { message: registerMessage, success: isRegisterSuccess } =
            await apis.backend.register(
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
                registerMessage === 'Có lỗi xảy ra.'
                    ? 'Hệ thống đang bảo trì, vui lòng thử lại sau.'
                    : registerMessage;
            return;
        }

        const {
            message: loginMessage,
            success: isLoginSuccess,
            data,
        } = await apis.backend.authorize(
            usernameInputValue,
            passwordInputValue
        );
        if (!isLoginSuccess) {
            console.warn(loginMessage);
            setPasswordInputValue('');
            setPasswordConfirmInputValue('');
            setPending(false);
            serverMessage.current.innerHTML =
                registerMessage === 'Có lỗi xảy ra.'
                    ? 'Hệ thống đang bảo trì, vui lòng thử lại sau.'
                    : registerMessage;
            return;
        }

        serverMessage.current.innerHTML =
            'Đăng ký thành công, đang chuyển hướng...';
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
                    Email
                </label>
                <Input
                    inputRef={emailInput}
                    type="email"
                    id="email-input"
                    className={styles['input']}
                    height={40}
                    icon={{ position: 'left', icon: 'fal fa-envelope' }}
                    placeholder="Nhập địa chỉ email"
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
                                    'Vui lòng nhập địa chỉ email';
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
                    Tên người dùng
                </label>
                <Input
                    inputRef={usernameInput}
                    type="text"
                    id="username-input"
                    className={styles['input']}
                    height={40}
                    icon={{ position: 'left', icon: 'fal fa-user' }}
                    placeholder="Nhập tên người dùng"
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
                                    'Vui lòng nhập tên người dùng';
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
                    Mật khẩu
                </label>
                <Input
                    inputRef={passwordInput}
                    type="password"
                    id="password-input"
                    className={styles['input']}
                    height={40}
                    icon={{ position: 'left', icon: 'fal fa-lock' }}
                    placeholder="Nhập mật khẩu"
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
                                    'Vui lòng nhập mật khẩu';
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
                    Nhập lại mật khẩu
                </label>
                <Input
                    inputRef={passwordConfirmInput}
                    type="password"
                    id="password-confirm-input"
                    className={styles['input']}
                    height={40}
                    icon={{ position: 'left', icon: 'fal fa-lock' }}
                    placeholder="Nhập lại mật khẩu"
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
                                    'Vui lòng nhập mật khẩu';
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
                                    'Bạn phải đồng ý điều khoản sử dụng để tiếp tục';
                            else formMessage.innerHTML = '';
                        }
                    }}
                    labelHTML={
                        <span className={styles['agreement-text']}>
                            Tôi đồng ý với{' '}
                            <a
                                className={styles['term-of-service-link']}
                                href="#"
                                tabIndex={-1}
                            >
                                chính sách trang web
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
                Đăng ký
            </Button>
            <span
                ref={serverMessage}
                className={styles['server-message']}
            ></span>
        </form>
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
                    ? 'Đăng nhập tài khoản'
                    : form === 'register'
                      ? 'Đăng ký tài khoản'
                      : 'Quên mật khẩu'}
            </span>
            <span className={styles['subtitle']}>
                {form === 'login'
                    ? 'Đăng nhập thành viên để mua hàng và nhận những ưu đãi đặc biệt từ chúng tôi'
                    : form === 'register'
                      ? 'Đăng ký thành viên để mua hàng và nhận những ưu đãi đặc biệt từ chúng tôi'
                      : 'Khôi phục mật khẩu tài khoản sử dụng địa chỉ email'}
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
                        Bạn chưa có tài khoản ?{' '}
                        <span
                            className={styles['change-form-button']}
                            onClick={() => handleChangeForm('register')}
                        >
                            Đăng kí ngay
                        </span>
                    </span>
                ) : (
                    <span>
                        Bạn đã có tài khoản ?{' '}
                        <span
                            className={styles['change-form-button']}
                            onClick={() => handleChangeForm('login')}
                        >
                            Đăng nhập ngay
                        </span>
                    </span>
                )}
            </span>
            {form === 'login' && (
                <>
                    <div className={styles['hr']} />
                    <span className={styles['change-form']}>
                        Quên mật khẩu ?{' '}
                        <span
                            className={styles['change-form-button']}
                            onClick={() => handleChangeForm('forgot-password')}
                        >
                            Khôi phục tài khoản
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
