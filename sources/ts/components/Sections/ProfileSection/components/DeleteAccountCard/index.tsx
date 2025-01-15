/**
 * @file index.tsx
 * @description Delete account card.
 */

'use strict';
import { CSSProperties, FunctionComponent, useState } from 'react';
import classNames from 'classnames';

import { useAuth } from '@sources/ts/hooks/useAuth';
import { useModal } from '@sources/ts/hooks/useModal';
import apis from '@sources/ts/apis';
import { showToast } from '@sources/ts/components/Toast';
import Button from '@sources/ts/components/Button';
import Input from '@sources/ts/components/Input';
import * as styles from '../../ProfileSection.module.css';
import * as deleteAccountCardStyles from './DeleteAccountCard.module.css';
import staticTexts from '@sources/ts/render/static-texts';
const texts = staticTexts.profileSection.deleteAccountCard;

/**
 * Delete account card.
 * @param props Component properties.
 * @returns Returns the component.
 */
const DeleteAccountCard: FunctionComponent = () => {
    const { getSessionData, logout } = useAuth(),
        { setModal, setModalVisibility, modalVisibility } = useModal();

    const [passwordInputValue, setPasswordInputValue] = useState('');

    const [isPending, setIsPending] = useState(false);

    const handleSubmitConfirmation = () => {
        setModal({
            type: 'alert',
            title: texts.confirmationWindowTitle,
            message: texts.confirmationWindowMessage,
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
                        {texts.confirmationWindowCancelButton}
                    </Button>
                    <Button
                        onClick={() => {
                            handleSubmit();
                            setModalVisibility(false);
                        }}
                    >
                        {texts.confirmationWindowConfirmButton}
                    </Button>
                </>
            ),
        });
    };

    const handleSubmit = () => {
        if (isPending) return;
        setIsPending(true);
        (async () => {
            const sessionData = await getSessionData();
            if (!sessionData) return;

            const { message, success } = await apis.emart.deleteUser(
                sessionData?.username,
                passwordInputValue
            );
            if (!success) {
                console.error(message);
                showToast({
                    variant: 'danger',
                    title: staticTexts.toast.errorDefaultTitle,
                    message,
                    duration: 5000,
                });
                setPasswordInputValue('');
                setIsPending(false);
                return;
            }

            setIsPending(false);
            setModal({
                type: 'alert',
                variant: 'success',
                iconColor: 'var(--color-primary)',
                title: texts.deleteSuccessWindowTitle,
                message: texts.deleteSuccessWindowMessage,
                closeButtonVariant: 'primary',
                closeButtonText: texts.deleteSuccessWindowCloseButton,
                makeCloseButtonDefault: true,
                onClose: () => logout(),
            });
        })();
    };

    return (
        <div id="settings-card" className={styles['card']}>
            <div className={styles['card-header']}>
                <span className={styles['card-header-title']}>
                    {texts.title}
                </span>
            </div>
            <form
                className={styles['card-body']}
                onSubmit={(event) => event.preventDefault()}
            >
                <div
                    className={styles['card-desc']}
                    style={{
                        display: 'flex',
                        flexFlow: 'column nowrap',
                        rowGap: '12px',
                    }}
                >
                    <span>{texts.description}</span>
                    <Input
                        wrapperProps={{
                            className:
                                deleteAccountCardStyles[
                                    'confirm-password-input'
                                ],
                        }}
                        type="password"
                        value={passwordInputValue}
                        onChange={(event) =>
                            setPasswordInputValue(event.currentTarget?.value)
                        }
                        placeholder={texts.currentPasswordInputPlaceholder}
                        disabled={isPending || modalVisibility}
                    />
                </div>

                <Button
                    type={'submit'}
                    height={40}
                    className={styles['submit']}
                    style={{ marginTop: '4px' }}
                    onClick={() => handleSubmitConfirmation()}
                    disabled={!!!passwordInputValue || isPending}
                    loading={isPending}
                >
                    <i className={classNames('fas fa-circle-exclamation')} />
                    {texts.confirmButton}
                </Button>
            </form>
        </div>
    );
};

export default DeleteAccountCard;
