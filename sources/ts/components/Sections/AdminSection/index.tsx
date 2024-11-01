/**
 * @file index.tsx
 * @description Admin section.
 */

'use strict';
import type { AdminAsideItem } from '@sources/ts/types/admin-section-aside-item';
import { FunctionComponent, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { useAuth } from '@sources/ts/hooks/useAuth';
import { useGlobal } from '@sources/ts/hooks/useGlobal';
import { useLocalStorage } from '@sources/ts/hooks/useLocalStorage';
import routes from '@sources/ts/global/react-router/routes';
import GridSection from '@sources/ts/components/Content/components/GridSection';
import * as styles from './AdminSection.module.css';
import adminSectionTopAsideItems from '@sources/ts/render/admin-section-top-aside-items';
import adminSectionBottomAsideItems from '@sources/ts/render/admin-section-bottom-aside-items';
import staticUrls from '@sources/ts/render/static-urls';
import staticTexts from '@sources/ts/render/static-texts';

/**
 * Aside list item.
 * @param props Component properties.
 * @param props.text Item text.
 * @param props.icon Item icon.
 * @param props.to React router route.
 * @param props.onClick On-click callback.
 * @param props.action Special action.
 * @returns Returns the component.
 */
const AsideItem: FunctionComponent<AdminAsideItem> = ({
    text,
    icon,
    to,
    onClick,
    action,
}) => {
    const { logout } = useAuth();

    const location = useLocation();
    if (location?.pathname === routes.admin) return <Navigate to="products" />;

    const handleClick: React.DetailedHTMLProps<
        React.LiHTMLAttributes<HTMLLIElement>,
        HTMLLIElement
    >['onClick'] = (event) => {
        if (action === 'logout') {
            logout();
            return;
        }

        if (onClick) onClick(event);
    };

    return (
        <li className={styles['aside-list-item']} onClick={handleClick}>
            <NavLink
                to={to}
                className={({ isActive, isPending }) =>
                    isPending
                        ? classNames(
                              styles['aside-list-item-link'],
                              styles['is-pending']
                          )
                        : isActive
                          ? classNames(styles['aside-list-item-link'], {
                                [styles['is-active']]: !!to,
                            })
                          : classNames(styles['aside-list-item-link'])
                }
            >
                <i
                    className={classNames(styles['aside-list-item-icon'], icon)}
                />
                <span className={classNames(styles['aside-list-item-text'])}>
                    {text}
                </span>
            </NavLink>
        </li>
    );
};

AsideItem.propTypes = {
    text: PropTypes.string,
    icon: PropTypes.string,
    to: PropTypes.string,
    onClick: PropTypes.func,
    action: PropTypes.any,
};

/**
 * Admin section.
 * @returns Returns the component.
 */
const AdminSection: FunctionComponent = function () {
    const { deviceInfo } = useGlobal();

    const asideRef = useRef<HTMLElement>(null);

    const [isCollapsed, setIsCollapsed] = useLocalStorage(
        'isAdminAsideCollapsed',
        'false'
    );

    useEffect(() => {
        const handleAutoCollapse: HTMLElement['onclick'] = (event) => {
            if (
                !asideRef.current?.contains(event.target as any) &&
                deviceInfo?.screenWidth <= 768
            )
                setIsCollapsed('true');
        };
        window.addEventListener('click', handleAutoCollapse);

        return () => window.removeEventListener('click', handleAutoCollapse);
    }, [deviceInfo.screenWidth]);

    return (
        <>
            <GridSection
                type="fit"
                style={{
                    display: 'flex',
                    flexFlow: 'column nowrap',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexGrow: '1',
                    width: '100%',
                    height: '100%',
                }}
            >
                <div className={styles['content-wrapper']}>
                    <aside
                        ref={asideRef}
                        className={classNames(styles['aside'], {
                            [styles['is-collapsed']]: isCollapsed === 'true',
                        })}
                    >
                        <i
                            className={classNames(
                                styles['aside-toggle'],
                                `fal fa-angles-${isCollapsed === 'true' ? 'right' : 'left'}`,
                                {
                                    [styles['is-collapsed']]:
                                        isCollapsed === 'true',
                                }
                            )}
                            onClick={() =>
                                setIsCollapsed(
                                    isCollapsed === 'true' ? 'false' : 'true'
                                )
                            }
                        />
                        <div className={styles['aside-top']}>
                            <div className={styles['aside-logo-wrapper']}>
                                <img
                                    className={styles['aside-logo']}
                                    src={staticUrls.brandLogoOnly}
                                    alt={`Logo ${staticTexts.brandName}`}
                                />
                                <img
                                    className={styles['aside-logo-text']}
                                    src={staticUrls.brandTextOnly}
                                    alt={`Logo ${staticTexts.brandName}`}
                                />
                            </div>
                            <div className={styles['aside-main-wrapper']}>
                                <ul className={styles['aside-item-list']}>
                                    {adminSectionTopAsideItems?.map(
                                        (item, index) => (
                                            <AsideItem
                                                key={index}
                                                text={item?.text}
                                                icon={item?.icon}
                                                to={item?.to}
                                                onClick={item?.onClick}
                                                action={item?.action}
                                            />
                                        )
                                    )}
                                </ul>
                            </div>
                        </div>
                        <div className={styles['aside-bottom']}>
                            <ul className={styles['aside-item-list']}>
                                {adminSectionBottomAsideItems?.map(
                                    (item, index) => (
                                        <AsideItem
                                            key={index}
                                            text={item?.text}
                                            icon={item?.icon}
                                            to={item?.to}
                                            onClick={item?.onClick}
                                            action={item?.action}
                                        />
                                    )
                                )}
                            </ul>
                        </div>
                    </aside>
                    <main className={styles['content']}>
                        <Outlet />
                    </main>
                </div>
            </GridSection>
        </>
    );
};

export default AdminSection;
