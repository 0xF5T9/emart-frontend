/**
 * @file index.tsx
 * @description User information card.
 */

'use strict';
import type { User } from '@sources/ts/types/VyFood';
import { FunctionComponent, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useAuth } from '@sources/ts/hooks/useAuth';
import apis from '@sources/ts/apis';
import { showToast } from '@sources/ts/components/Toast';
import Button from '@sources/ts/components/Button';
import Input from '@sources/ts/components/Input';
import * as styles from '../../ProfileSection.module.css';
import * as infoCardStyles from './UserInfoCard.module.css';
import staticTexts from '@sources/ts/render/static-texts';
import staticUrls from '@sources/ts/render/static-urls';
const texts = staticTexts?.profileSection?.userInfoCard;

/**
 * User information card.
 * @param props Component properties.
 * @param props.userInfo User info data.
 * @param props.refreshCallback Refresh data callback.
 * @returns Returns the component.
 */
const UserInfoCard: FunctionComponent<{
    user: User;
    refreshCallback?: (onFinished?: (...args: any[]) => void) => void;
}> = ({ user, refreshCallback }) => {
    const { getSessionData, refreshSessionData } = useAuth();

    const userUploadImageInput = useRef<HTMLInputElement>(null);

    const [userBlobImageUrl, setProductBlobImageUrl] = useState(''),
        usernameInput = useRef<HTMLInputElement>(null),
        usernameInputFormMessage = useRef<HTMLSpanElement>(null),
        emailInput = useRef<HTMLInputElement>(null),
        emailInputFormMessage = useRef<HTMLSpanElement>(null),
        roleInput = useRef<HTMLInputElement>(null),
        roleInputFormMessage = useRef<HTMLSpanElement>(null),
        createdAtInput = useRef<HTMLInputElement>(null),
        createdAtInputFormMessage = useRef<HTMLSpanElement>(null);

    const [isPending, setIsPending] = useState(false),
        [buttonLoadingStates, setButtonLoadingStates] = useState({
            refresh: false,
            save: false,
        });

    const handleSubmit: React.ButtonHTMLAttributes<HTMLButtonElement>['onClick'] =
        () => {
            if (isPending) return;
            setIsPending(true);
            setButtonLoadingStates({ ...buttonLoadingStates, save: true });

            (async () => {
                const sessionData = await getSessionData();
                if (!sessionData) return;

                let isFormValid = true,
                    focusElement: HTMLInputElement;
                const emailInputValue = emailInput.current?.value;

                if (!emailInputValue) {
                    emailInputFormMessage.current.innerHTML =
                        texts.emailInputRequiredFormMessage;
                    if (!focusElement) focusElement = emailInput.current;
                    isFormValid = false;
                } else if (
                    !/^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/.test(
                        emailInputValue
                    )
                ) {
                    emailInputFormMessage.current.innerHTML =
                        staticTexts.api.backend.invalidEmail;
                    if (!focusElement) focusElement = emailInput.current;
                    isFormValid = false;
                }

                if (!isFormValid) {
                    if (focusElement)
                        setTimeout(() => focusElement.focus(), 100);
                    setIsPending(false);
                    setButtonLoadingStates({
                        ...buttonLoadingStates,
                        save: false,
                    });
                    return;
                }

                if (userUploadImageInput.current?.files?.length) {
                    const uploadImageResult =
                        await apis.backend.uploadUserAvatar(
                            user?.username,
                            userUploadImageInput.current?.files[0]
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
                        setButtonLoadingStates({
                            ...buttonLoadingStates,
                            save: false,
                        });
                        setIsPending(false);
                        return;
                    }
                }

                const { message, success } = await apis.backend.updateUserInfo(
                    sessionData?.username,
                    {
                        email:
                            emailInput.current?.value !== sessionData?.email
                                ? emailInput.current?.value
                                : '',
                    }
                );
                if (!success) {
                    console.error(message);
                    showToast({
                        variant: 'danger',
                        title: staticTexts.toast.errorDefaultTitle,
                        message,
                        duration: 5000,
                    });
                    setIsPending(false);
                    setButtonLoadingStates({
                        ...buttonLoadingStates,
                        save: false,
                    });
                    return;
                }

                if (emailInput.current?.value !== sessionData?.email) {
                    emailInputFormMessage.current.innerHTML =
                        texts.successEmailUpdateRequest;
                    emailInput.current.value = sessionData?.email;
                }

                setIsPending(false);
                setButtonLoadingStates({ ...buttonLoadingStates, save: false });
                await refreshSessionData();
            })();
        };

    useEffect(() => {
        if (emailInput.current) {
            emailInput.current.value = user?.email || '';
            emailInputFormMessage.current.innerHTML = '';
        }
    }, [user]);

    useEffect(() => {
        return () => {
            if (userBlobImageUrl) URL.revokeObjectURL(userBlobImageUrl);
        };
    }, [userBlobImageUrl]);

    return (
        <div id="settings-card" className={styles['card']}>
            <div className={styles['card-header']}>
                <span className={styles['card-header-title']}>
                    {texts.title}
                </span>
            </div>
            <div className={styles['card-body']}>
                <p className={styles['card-desc']}>{texts.description}</p>
                <div className={infoCardStyles['user-image-wrapper']}>
                    <img
                        className={infoCardStyles['user-image']}
                        src={
                            userBlobImageUrl ||
                            user?.avatarFileName ||
                            staticUrls.avatarPlaceholder
                        }
                        alt={texts.userAvatarImageAlt}
                        onError={(event) => {
                            event.currentTarget.src =
                                staticUrls.avatarPlaceholder;
                        }}
                    />
                    <Button
                        className={infoCardStyles['upload-user-image-button']}
                        height={40}
                        disabled={isPending}
                        onClick={() => userUploadImageInput.current?.click()}
                    >
                        <i className={classNames('fas fa-cloud-arrow-up')} />{' '}
                        {texts.uploadButton}
                    </Button>
                    <input
                        ref={userUploadImageInput}
                        className={infoCardStyles['hidden-user-upload-input']}
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
                    className={styles['form']}
                    onSubmit={(event) => event.preventDefault()}
                >
                    <div className={styles['form-group']}>
                        <label
                            className={styles['label']}
                            htmlFor="username-input"
                        >
                            {texts.usernameInputLabel}
                        </label>
                        <Input
                            inputRef={usernameInput}
                            readOnly
                            disabled
                            type="text"
                            id="username-input"
                            className={styles['input']}
                            height={40}
                            icon={{ position: 'left', icon: 'fal fa-user' }}
                            placeholder={texts.usernameInputPlaceholder}
                            autoCapitalize="off"
                            defaultValue={user?.username || ''}
                        />
                        <span
                            ref={usernameInputFormMessage}
                            className={styles['form-message']}
                        ></span>
                    </div>
                    <div className={styles['form-group']}>
                        <label
                            className={styles['label']}
                            htmlFor="email-input"
                        >
                            {texts.emailInputLabel}
                        </label>
                        <Input
                            inputRef={emailInput}
                            type="email"
                            id="email-input"
                            className={styles['input']}
                            height={40}
                            icon={{ position: 'left', icon: 'fal fa-envelope' }}
                            placeholder={texts.emailInputPlaceholder}
                            autoCapitalize="off"
                            disabled={isPending}
                            onBlur={(event) => {
                                if (emailInputFormMessage.current) {
                                    if (!event?.currentTarget?.value)
                                        emailInputFormMessage.current.innerHTML =
                                            texts.emailInputRequiredFormMessage;
                                    else
                                        emailInputFormMessage.current.innerHTML =
                                            '';
                                }
                            }}
                            onChange={() => {
                                if (emailInputFormMessage.current)
                                    emailInputFormMessage.current.innerHTML =
                                        '';
                            }}
                            defaultValue={user?.email || ''}
                        />
                        <span
                            ref={emailInputFormMessage}
                            className={styles['form-message']}
                        ></span>
                    </div>
                    <div className={styles['form-group']}>
                        <label className={styles['label']} htmlFor="role-input">
                            {texts.roleInputLabel}
                        </label>
                        <Input
                            inputRef={roleInput}
                            readOnly
                            disabled
                            type="text"
                            id="role-input"
                            className={styles['input']}
                            height={40}
                            icon={{ position: 'left', icon: 'fal fa-users' }}
                            placeholder={texts.roleInputPlaceholder}
                            autoCapitalize="off"
                            value={
                                user?.role === 'member'
                                    ? texts.roleMember
                                    : user?.role === 'admin'
                                      ? texts.roleAdmin
                                      : texts.roleUnknown
                            }
                        />
                        <span
                            ref={roleInputFormMessage}
                            className={styles['form-message']}
                        ></span>
                    </div>
                    <div className={styles['form-group']}>
                        <label
                            className={styles['label']}
                            htmlFor="created-at-input"
                        >
                            {texts.createdAtInputLabel}
                        </label>
                        <Input
                            inputRef={createdAtInput}
                            readOnly
                            disabled
                            type="text"
                            id="created-at-input"
                            className={styles['input']}
                            height={40}
                            icon={{ position: 'left', icon: 'fal fa-timer' }}
                            autoCapitalize="off"
                            value={
                                user?.createdAt?.toLocaleString('en-US') || ''
                            }
                        />
                        <span
                            ref={createdAtInputFormMessage}
                            className={styles['form-message']}
                        ></span>
                    </div>
                    <div className={styles['submit-wrapper']}>
                        <Button
                            type="button"
                            height={40}
                            className={styles['submit']}
                            onClick={() => {
                                (async () => {
                                    if (!isPending && refreshCallback) {
                                        setIsPending(true);
                                        setButtonLoadingStates({
                                            ...buttonLoadingStates,
                                            refresh: true,
                                        });
                                        await refreshSessionData();
                                        refreshCallback(() => {
                                            setIsPending(false);
                                            setButtonLoadingStates({
                                                ...buttonLoadingStates,
                                                refresh: false,
                                            });
                                        });
                                    }
                                })();
                            }}
                            disabled={isPending}
                            loading={buttonLoadingStates.refresh}
                        >
                            <i className={classNames('fal fa-rotate-right')} />
                            {texts.refreshButton}
                        </Button>
                        <Button
                            type="submit"
                            height={40}
                            className={styles['submit']}
                            onClick={handleSubmit}
                            disabled={isPending}
                            loading={buttonLoadingStates.save}
                        >
                            <i className={classNames('fas fa-save')} />
                            {texts.saveButton}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

UserInfoCard.propTypes = {
    user: PropTypes.any,
    refreshCallback: PropTypes.func,
};

export default UserInfoCard;
