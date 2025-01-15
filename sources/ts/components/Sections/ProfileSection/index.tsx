/**
 * @file index.tsx
 * @description Profile section.
 */

'use strict';
import type { User } from '@sources/ts/apis/emart/types';
import { FunctionComponent, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useAuth } from '@sources/ts/hooks/useAuth';
import { useGlobal } from '@sources/ts/hooks/useGlobal';
import apis from '@sources/ts/apis';
import { DynamicSection } from '@sources/ts/components/Content/components/GridSection';
import { showToast } from '@sources/ts/components/Toast';
import UserInfoCard from './components/UserInfoCard';
import UpdatePasswordCard from './components/UpdatePasswordCard';
import DeleteAccountCard from './components/DeleteAccountCard';
import staticTexts from '@sources/ts/render/static-texts';
import staticUrls from '@sources/ts/render/static-urls';
import * as styles from './ProfileSection.module.css';

/**
 * Settings item.
 * @param props Component properties.
 * @param props.text Item text.
 * @param props.icon Item icon.
 * @param props.isSelected Item selection state.
 * @param props.isDangerous Mark the item as an "dangerous" action.
 * @note Properties that are not explicitly stated here are passed to li element.
 * @returns Returns the component.
 */
const SettingsItem: FunctionComponent<
    React.DetailedHTMLProps<
        React.LiHTMLAttributes<HTMLLIElement>,
        HTMLLIElement
    > & {
        text: string;
        icon: string;
        isSelected?: boolean;
        isDangerous?: boolean;
    }
> = ({
    text,
    icon,
    isSelected = false,
    isDangerous = false,
    onClick,
    ...props
}) => {
    return (
        <li
            {...props}
            className={classNames(
                styles['settings-item'],
                {
                    [styles['is-selected']]: isSelected,
                    [styles['is-dangerous']]: isDangerous,
                },
                props?.className
            )}
            onClick={onClick}
        >
            <a className={styles['settings-item-link']}>
                <i className={classNames(styles['settings-item-icon'], icon)} />
                <span className={styles['settings-item-text']}>{text}</span>
            </a>
        </li>
    );
};

SettingsItem.propTypes = {
    text: PropTypes.string,
    icon: PropTypes.string,
    isSelected: PropTypes.bool,
    isDangerous: PropTypes.bool,
};

/**
 * Profile section.
 * @returns Returns the component.
 */
const ProfileSection: FunctionComponent = function () {
    const { sessionData, refreshSessionData, login } = useAuth();

    const { deviceInfo } = useGlobal();

    const [selectedSetting, setSelectedSetting] = useState<
        'account-info' | 'update-password' | 'delete-account'
    >('account-info');

    const [userInfo, setUserInfo] = useState<User>(null);

    const handleRefresh = useCallback(
        (onFinished?: (...args: any[]) => void) => {
            (async () => {
                const sessionData = await refreshSessionData();
                if (!sessionData) return;

                const { message, success, data } = await apis.emart.getUserInfo(
                    sessionData?.username
                );
                if (!success) {
                    console.error(message);
                    showToast({
                        variant: 'danger',
                        title: staticTexts.toast.errorDefaultTitle,
                        message,
                        duration: 5000,
                    });
                    return;
                }

                const rawUser = data,
                    transformedUser = {
                        ...rawUser,
                        avatarFileName: rawUser?.avatarFileName
                            ? `${process.env.UPLOAD_URL}/avatar/${rawUser.avatarFileName}`
                            : staticUrls.avatarPlaceholder,
                        createdAt: new Date(rawUser.createdAt),
                    };

                setUserInfo(transformedUser);
                if (data?.email !== sessionData?.email) {
                    const newSessionData = { ...sessionData };
                    newSessionData.email = data?.email;
                    login(newSessionData);
                }

                if (onFinished) onFinished();
            })();
        },
        [userInfo, sessionData]
    );

    useEffect(() => {
        handleRefresh();
    }, []);

    return (
        <>
            <DynamicSection
                contentProps={{
                    style: {
                        display: 'flex',
                        flexFlow: 'column nowrap',
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
                }}
            >
                <div className={styles['content-wrapper']}>
                    <div className={styles['settings-card']}>
                        <ul className={styles['settings-list']}>
                            <SettingsItem
                                text={
                                    staticTexts.profileSection.settingItems
                                        .accountInfo
                                }
                                icon="fal fa-user-circle"
                                isSelected={selectedSetting === 'account-info'}
                                onClick={() => {
                                    setSelectedSetting('account-info');
                                    if (deviceInfo?.screenWidth < 700)
                                        setTimeout(
                                            () =>
                                                document
                                                    ?.getElementById(
                                                        'settings-card'
                                                    )
                                                    ?.scrollIntoView({
                                                        behavior: 'smooth',
                                                        block: 'nearest',
                                                        inline: 'nearest',
                                                    }),
                                            10
                                        );
                                }}
                            />
                            <SettingsItem
                                text={
                                    staticTexts.profileSection.settingItems
                                        .updatePassword
                                }
                                icon="fal fa-lock"
                                isSelected={
                                    selectedSetting === 'update-password'
                                }
                                onClick={() => {
                                    setSelectedSetting('update-password');
                                    if (deviceInfo?.screenWidth < 700)
                                        setTimeout(
                                            () =>
                                                document
                                                    ?.getElementById(
                                                        'settings-card'
                                                    )
                                                    ?.scrollIntoView({
                                                        behavior: 'smooth',
                                                        block: 'nearest',
                                                        inline: 'nearest',
                                                    }),
                                            10
                                        );
                                }}
                            />
                            <SettingsItem
                                isDangerous
                                text={
                                    staticTexts.profileSection.settingItems
                                        .deleteAccount
                                }
                                icon="fal fa-trash"
                                onClick={() => {
                                    setSelectedSetting('delete-account');
                                    if (deviceInfo?.screenWidth < 700)
                                        setTimeout(
                                            () =>
                                                document
                                                    ?.getElementById(
                                                        'settings-card'
                                                    )
                                                    ?.scrollIntoView({
                                                        behavior: 'smooth',
                                                        block: 'nearest',
                                                        inline: 'nearest',
                                                    }),
                                            10
                                        );
                                }}
                            />
                        </ul>
                    </div>
                    {selectedSetting === 'account-info' && (
                        <UserInfoCard
                            user={userInfo}
                            refreshCallback={handleRefresh}
                        />
                    )}
                    {selectedSetting === 'update-password' && (
                        <UpdatePasswordCard />
                    )}
                    {selectedSetting === 'delete-account' && (
                        <DeleteAccountCard />
                    )}
                </div>
            </DynamicSection>
        </>
    );
};

export default ProfileSection;
