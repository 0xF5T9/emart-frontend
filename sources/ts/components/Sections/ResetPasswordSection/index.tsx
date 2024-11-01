/**
 * @file index.tsx
 * @description Reset password section.
 */

'use strict';
import { FunctionComponent, useState, useRef } from 'react';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import classNames from 'classnames';

import { useAuth } from '@sources/ts/hooks/useAuth';
import { useModal } from '@sources/ts/hooks/useModal';
import routes from '@sources/ts/global/react-router/routes';
import apis from '@sources/ts/apis';
import { FlexibleSection } from '@sources/ts/components/Content/components/GridSection';
import Input from '@sources/ts/components/Input';
import Button from '@sources/ts/components/Button';
import * as styles from './ResetPasswordSection.module.css';

/**
 * Reset password section.
 * @returns Returns the component.
 */
const ResetPasswordSection: FunctionComponent = function () {
    const navigate = useNavigate(),
        token = useSearchParams()[0].get('token'),
        { setModal, setModalVisibility } = useModal();
    if (!token) return <Navigate to={routes.home} />;

    const { sessionData } = useAuth();

    if (sessionData) {
        return <Navigate to={routes.home} />;
    }

    const passwordInput = useRef<HTMLInputElement>(),
        passwordConfirmInput = useRef<HTMLInputElement>(),
        serverMessage = useRef<HTMLSpanElement>();

    const [pending, setPending] = useState(false);

    const [passwordInputValue, setPasswordInputValue] = useState(''),
        [passwordConfirmInputValue, setPasswordConfirmInputValue] =
            useState('');

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

        if (!passwordInputValue) {
            passwordInput?.current?.focus();
            document.getElementById('password-input-form-message').innerHTML =
                'Vui lòng nhập mật khẩu mới';
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
            ).innerHTML = 'Vui lòng nhập mật khẩu mới';
            return;
        }
        if (passwordConfirmInputValue !== passwordInputValue) {
            passwordConfirmInput?.current?.focus();
            document.getElementById(
                'password-confirm-input-form-message'
            ).innerHTML = 'Mật khẩu không trùng khớp';
            return;
        }

        setPending(true);

        const { message, success } = await apis.backend.resetPassword(
            token,
            passwordInputValue
        );
        if (!success) {
            console.warn(message);
            setPending(false);
            serverMessage.current.innerHTML =
                message === 'Có lỗi xảy ra.'
                    ? 'Hệ thống đang bảo trì, vui lòng thử lại sau.'
                    : message;
            return;
        }

        serverMessage.current.innerHTML = message;
        setModal({
            type: 'custom',
            content: (
                <div className={styles['success-modal-window']}>
                    <span className={styles['title']}>Thành công</span>
                    <span className={styles['subtitle']}>
                        Mật khẩu mới đã được cập nhật.
                    </span>
                    <Button
                        className={classNames(styles['submit'], 'default')}
                        height={40}
                        onClick={() => setModalVisibility(false)}
                    >
                        Quay lại trang chủ
                    </Button>
                </div>
            ),
            onClose: () => navigate(routes.home),
        });
    };

    return (
        <>
            <FlexibleSection
                contentProps={{
                    style: {
                        display: 'flex',
                        flexFlow: 'column nowrap',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '50px 20px',
                    },
                }}
            >
                <div className={styles['wrapper']}>
                    <span className={styles['title']}>Khôi phục mật khẩu</span>
                    <span className={styles['subtitle']}>
                        Cập nhật mật khẩu mới cho tài khoản của bạn
                    </span>
                    <form className={styles['form']} onSubmit={handleSubmit}>
                        <div className={styles['form-group']}>
                            <label
                                className={styles['label']}
                                htmlFor="password-input"
                            >
                                Mật khẩu
                            </label>
                            <Input
                                inputRef={passwordInput}
                                type="password"
                                id="password-input"
                                height={40}
                                icon={{ position: 'left', icon: 'fal fa-lock' }}
                                placeholder="Nhập mật khẩu"
                                value={passwordInputValue}
                                disabled={pending}
                                autoComplete="on"
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
                                                'Vui lòng nhập mật khẩu mới';
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
                                    setPasswordConfirmInputValue(
                                        event.currentTarget.value
                                    );
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
                                                'Vui lòng nhập mật khẩu mới';
                                        else formMessage.innerHTML = '';
                                    }
                                }}
                            />
                            <span
                                id="password-confirm-input-form-message"
                                className={styles['form-message']}
                            ></span>
                        </div>
                        <Button
                            className={styles['submit']}
                            height={40}
                            disabled={pending}
                            loading={pending}
                        >
                            Khôi phục
                        </Button>
                        <span
                            ref={serverMessage}
                            className={styles['server-message']}
                        ></span>
                    </form>
                </div>
            </FlexibleSection>
        </>
    );
};

export default ResetPasswordSection;