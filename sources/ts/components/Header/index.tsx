/**
 * @file index.tsx
 * @description Header.
 */

'use strict';
import type { CartItem } from '@sources/ts/types/VyFood';
import {
    FunctionComponent,
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    useCallback,
} from 'react';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

import { useAuth } from '@sources/ts/hooks/useAuth';
import { useVyFood } from '@sources/ts/hooks/useVyFood';
import { useLocalStorage } from '@sources/ts/hooks/useLocalStorage';
import { useModal } from '@sources/ts/hooks/useModal';
import { CircleLoadingThird } from '@sources/ts/components/Icons/CircleLoadingThird';
import routes from '@sources/ts/global/react-router/routes';
import BrandLogo from './components/BrandLogo';
import ProductCategoryNavbar from './components/ProductCategoryNavbar';
import ContextMenu from '@sources/ts/components/ContextMenu';
import UserModalWindow from './components/UserModalWindow';
import CartModalWindow, {
    cartModalWindowStyles,
} from './components/CartModalWindow';
import staticTexts from '@sources/ts/render/static-texts';
import staticUrls from '@sources/ts/render/static-urls';
import * as styles from './Header.module.css';

/**
 * Product search input.
 * @param props Component properties.
 * @param props.debounceTime Search debounce time in milliseconds. (Default: 300)
 * @returns Returns the component.
 */
const ProductSearchInput: FunctionComponent<{ debounceTime?: number }> = ({
    debounceTime = 600,
}) => {
    const { pathname } = useLocation();

    const {
        productItems,
        setProductFilter,
        productSearchValue,
        setProductSearchValue,
        isBackendUnavailable,
        cartItems,
    } = useVyFood();

    const searchInput = useRef<HTMLInputElement>(null),
        timeoutId = useRef<NodeJS.Timeout>(null);

    const [totalCartItems, setTotalCartItems] = useState(0);

    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = useCallback(
        (searchValue?: string) => {
            if (timeoutId?.current) clearTimeout(timeoutId.current);
            setIsSearching(true);

            timeoutId.current = setTimeout(() => {
                if (searchInput?.current) {
                    if (searchValue && searchValue !== '') {
                        setProductFilter({
                            type: 'name',
                            value: searchValue.toLowerCase(),
                        });
                        document
                            ?.getElementById('products-section')
                            ?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start',
                                inline: 'center',
                            });
                    } else if (searchValue === '') {
                        setProductFilter(null);
                    }
                }
                setIsSearching(false);
            }, debounceTime);
        },
        [productSearchValue]
    );

    useEffect(() => {
        const parsedCartItems: CartItem[] = JSON.parse(cartItems);
        setTotalCartItems(parsedCartItems?.length);
    }, [cartItems]);

    return (
        <>
            <style>{`.${styles['basket-icon']}::after { content: '${totalCartItems <= 99 ? totalCartItems : '99+'}' !important; ${totalCartItems > 99 ? 'font-size: 8px;' : ''} }`}</style>

            {pathname === routes.home && (
                <form
                    className={styles['product-search-input-wrapper']}
                    onSubmit={(event) => event.preventDefault()}
                >
                    {isSearching ? (
                        <CircleLoadingThird
                            className={classNames(
                                styles['product-search-input-icon'],
                                styles['is-searching']
                            )}
                            onClick={() => searchInput?.current?.focus()}
                        />
                    ) : (
                        <i
                            className={classNames(
                                styles['product-search-input-icon'],
                                'fal fa-magnifying-glass'
                            )}
                            onClick={() => searchInput?.current?.focus()}
                        />
                    )}
                    <button
                        className={styles['product-search-input-button']}
                        onClick={() => {
                            handleSearch(productSearchValue);
                            document
                                ?.getElementById('products-section')
                                ?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start',
                                    inline: 'center',
                                });
                        }}
                    >
                        Tìm kiếm
                    </button>
                    <input
                        ref={searchInput}
                        className={styles['product-search-input']}
                        value={productSearchValue}
                        onChange={(event) => {
                            setProductSearchValue(event.currentTarget.value);
                            handleSearch(event.currentTarget.value);
                        }}
                        onFocus={() => {
                            document
                                ?.getElementById('products-section')
                                ?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start',
                                    inline: 'center',
                                });
                        }}
                        readOnly={!!!productItems || !!!productItems.length}
                        placeholder={
                            isBackendUnavailable
                                ? ''
                                : !productItems
                                  ? 'Đang tải danh sách...'
                                  : productItems && !productItems.length
                                    ? 'Không có sản phẩm nào'
                                    : 'Tìm kiếm món ăn...'
                        }
                        onClick={() => {
                            if (!!!productItems || !!!productItems.length)
                                document
                                    ?.getElementById('products-section')
                                    ?.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'start',
                                        inline: 'center',
                                    });
                        }}
                        onKeyUp={(event) => {
                            if (event?.key === 'Enter') {
                                (
                                    document.activeElement as HTMLInputElement
                                )?.blur();
                                document
                                    ?.getElementById('products-section')
                                    ?.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'start',
                                        inline: 'center',
                                    });
                            }
                        }}
                    />
                </form>
            )}
        </>
    );
};

ProductSearchInput.propTypes = {
    debounceTime: PropTypes.number,
};

/**
 * Header.
 * @returns Returns the component.
 */
const Header: FunctionComponent = function () {
    const { sessionData, logout } = useAuth(),
        { setModal } = useModal();

    const { pathname } = useLocation();

    const header = useRef<HTMLElement>(),
        timeoutId = useRef<NodeJS.Timeout>(null);

    const [showAnnouncement, setShowAnnouncement] = useLocalStorage(
            'showAnnouncement',
            'true'
        ),
        [announcementText, setAnnouncementText] = useLocalStorage(
            'announcementText',
            staticTexts.announcementText
        );

    const [showMobileSearchInput, setShowMobileSearchInput] = useState(false);

    useEffect(() => {
        let previousAnnouncementText = localStorage.getItem('announcementText');
        if (previousAnnouncementText)
            previousAnnouncementText = previousAnnouncementText.slice(1, -1);

        if (previousAnnouncementText !== staticTexts.announcementText) {
            setShowAnnouncement('true');
            setAnnouncementText(staticTexts.announcementText);
        }
    }, []);

    useLayoutEffect(() => {
        function handleHeaderResize() {
            if (timeoutId?.current) clearTimeout(timeoutId.current);

            timeoutId.current = setTimeout(() => {
                const currentHeaderHeight = getComputedStyle(
                    document.documentElement
                ).getPropertyValue('--header-height');
                if (!currentHeaderHeight) {
                    console.warn(
                        'Expect header height variable in root, but none were found.',
                        `\nFound value: '${currentHeaderHeight}'`
                    );
                    return;
                }

                const headerHeight =
                        header?.current?.getBoundingClientRect()?.height,
                    parsedHeight = parseFloat(headerHeight?.toFixed(2));

                document.documentElement.style.setProperty(
                    '--header-height',
                    `${parsedHeight}px`
                );
            }, 1);
        }

        // BUG: ResizeObserver loop completed with undelivered notifications.
        // Added 1ms debounce. To be observed.
        const observer = new ResizeObserver(handleHeaderResize);
        observer?.observe(header?.current);

        return () => {
            observer?.disconnect();

            const currentHeaderHeight = getComputedStyle(
                document.documentElement
            ).getPropertyValue('--header-height');
            if (!currentHeaderHeight)
                console.warn(
                    'Expect header height variable in root, but none were found.',
                    `\nFound value: '${currentHeaderHeight}'`
                );
            document.documentElement.style.setProperty(
                '--header-height',
                `0px`
            );
        };
    }, []);

    return (
        <header ref={header} className={styles['header']}>
            {showAnnouncement === 'true' && announcementText && (
                <Tippy
                    content={staticTexts.announcementCloseText}
                    theme="light"
                >
                    <div className={styles['header-content-announcement']}>
                        <div
                            className={
                                styles[
                                    'header-content-announcement-content-wrapper'
                                ]
                            }
                            onClick={() => setShowAnnouncement('false')}
                        >
                            <span className={styles['announcement-text']}>
                                <i className="fas fa-bullhorn"></i>
                                {announcementText}
                            </span>
                        </div>
                    </div>
                </Tippy>
            )}

            <div className={styles['header-content-main']}>
                <div
                    className={classNames(
                        styles['header-content-main-content-wrapper'],
                        {
                            [styles['show-mobile-search-input']]:
                                showMobileSearchInput,
                        }
                    )}
                >
                    <div
                        className={styles['header-content-main-left-content']}
                        style={{ flexGrow: '1' }}
                    >
                        <BrandLogo id="brand-logo" />
                        <ProductSearchInput />
                    </div>
                    <div
                        className={styles['header-content-main-right-content']}
                    >
                        <ul className={styles['header-items']}>
                            {pathname === routes.home && (
                                <li
                                    className={classNames(
                                        styles['header-item'],
                                        styles['header-item-search']
                                    )}
                                    onClick={() =>
                                        setShowMobileSearchInput(
                                            !showMobileSearchInput
                                        )
                                    }
                                >
                                    <i
                                        className={classNames(
                                            styles['header-item-icon'],
                                            'fal fa-magnifying-glass'
                                        )}
                                    />
                                    <span
                                        className={styles['header-item-text']}
                                    >
                                        Tìm kiếm
                                    </span>
                                </li>
                            )}
                            <ContextMenu
                                className={styles['user-context-menu']}
                                trigger="mouseenter click"
                                placement="bottom"
                                offset={[0, 10]}
                                delay={[0, 200]}
                                animation="slide-scale"
                                onMount={() => {
                                    document
                                        .getElementById('header-item-user')
                                        ?.classList.add('is-open');
                                }}
                                onHide={() => {
                                    document
                                        .getElementById('header-item-user')
                                        ?.classList.remove('is-open');
                                }}
                                menus={
                                    !sessionData
                                        ? [
                                              {
                                                  id: 'default',
                                                  menu: [
                                                      {
                                                          title: 'Đăng nhập',
                                                          icon: {
                                                              icon: 'fal fa-right-to-bracket',
                                                              width: '16px',
                                                              height: '16px',
                                                          },
                                                          onClick: () => {
                                                              setModal({
                                                                  type: 'custom',
                                                                  content: (
                                                                      <UserModalWindow initForm="login" />
                                                                  ),
                                                                  preventCloseOnBackgroundClick:
                                                                      true,
                                                                  preventCloseOnEscapeKeyPress:
                                                                      true,
                                                              });
                                                          },
                                                          hideOnClick: true,
                                                      },
                                                      {
                                                          title: 'Đăng ký',
                                                          icon: {
                                                              icon: 'fal fa-user-plus',
                                                              width: '16px',
                                                              height: '16px',
                                                          },
                                                          onClick: () => {
                                                              setModal({
                                                                  type: 'custom',
                                                                  content: (
                                                                      <UserModalWindow initForm="register" />
                                                                  ),
                                                                  preventCloseOnBackgroundClick:
                                                                      true,
                                                                  preventCloseOnEscapeKeyPress:
                                                                      true,
                                                              });
                                                          },
                                                          hideOnClick: true,
                                                      },
                                                  ],
                                              },
                                          ]
                                        : [
                                              {
                                                  id: 'default',
                                                  menu: [
                                                      {
                                                          title: 'Quản trị hệ thống',
                                                          icon: {
                                                              icon: 'fal fa-briefcase',
                                                              width: '16px',
                                                              height: '16px',
                                                          },
                                                          to: routes.admin,
                                                          adminOnly: true,
                                                      },
                                                      {
                                                          title: 'Thông tin tài khoản',
                                                          icon: {
                                                              icon: 'fal fa-user',
                                                              width: '16px',
                                                              height: '16px',
                                                          },
                                                          to: routes.profile,
                                                          hideOnClick: true,
                                                      },
                                                      {
                                                          title: 'Đăng xuất',
                                                          icon: {
                                                              icon: 'fal fa-right-to-bracket',
                                                              width: '16px',
                                                              height: '16px',
                                                          },
                                                          onClick: () =>
                                                              logout(),
                                                          hideOnClick: true,
                                                      },
                                                  ],
                                              },
                                          ]
                                }
                            >
                                <li
                                    id="header-item-user"
                                    className={classNames(
                                        styles['header-item'],
                                        styles['header-item-user']
                                    )}
                                >
                                    {sessionData ? (
                                        <img
                                            className={
                                                styles[
                                                    'header-item-user-avatar'
                                                ]
                                            }
                                            src={`${process.env.UPLOAD_URL}/avatar/${sessionData?.avatarFileName}`}
                                            onError={(event) => {
                                                event.currentTarget.src =
                                                    staticUrls.avatarPlaceholder;
                                            }}
                                        />
                                    ) : (
                                        <i
                                            className={classNames(
                                                styles['header-item-icon'],
                                                'fal fa-user'
                                            )}
                                        />
                                    )}

                                    <div
                                        style={{
                                            display: 'flex',
                                            flexFlow: 'column nowrap',
                                        }}
                                    >
                                        <span
                                            className={
                                                styles['header-item-text-top']
                                            }
                                            style={{ fontSize: '12px' }}
                                        >
                                            {!sessionData
                                                ? 'Đăng nhập / Đăng ký'
                                                : sessionData?.username}
                                        </span>
                                        <span
                                            className={
                                                styles[
                                                    'header-item-text-bottom'
                                                ]
                                            }
                                        >
                                            Tài khoản{' '}
                                            <i className="fas fa-caret-down" />
                                        </span>
                                    </div>
                                </li>
                            </ContextMenu>
                            <li
                                className={styles['header-item']}
                                onClick={() =>
                                    setModal({
                                        type: 'custom',
                                        className:
                                            cartModalWindowStyles[
                                                'modal-window-wrapper'
                                            ],
                                        content: <CartModalWindow />,
                                    })
                                }
                            >
                                <i
                                    className={classNames(
                                        styles['header-item-icon'],
                                        'fal fa-basket-shopping',
                                        styles['basket-icon']
                                    )}
                                />
                                <span className={styles['header-item-text']}>
                                    Giỏ hàng
                                </span>
                            </li>
                        </ul>
                        <i
                            className={classNames(
                                styles['hide-mobile-search-input'],
                                'fal fa-circle-xmark'
                            )}
                            onClick={() => setShowMobileSearchInput(false)}
                        />
                    </div>
                </div>
            </div>

            {pathname === routes.home && (
                <div className={styles['header-content-product-category']}>
                    <i
                        className={classNames(
                            'fas fa-caret-left',
                            styles['navbar-left-arrow']
                        )}
                        onClick={(event) => {
                            const navbar =
                                event.currentTarget.parentElement.querySelector(
                                    'nav'
                                );
                            navbar?.scrollBy({
                                left: -300,
                                behavior: 'smooth',
                            });
                        }}
                    />
                    <i
                        className={classNames(
                            'fas fa-caret-right',
                            styles['navbar-right-arrow']
                        )}
                        onClick={(event) => {
                            const navbar =
                                event.currentTarget.parentElement.querySelector(
                                    'nav'
                                );
                            navbar?.scrollBy({
                                left: 300,
                                behavior: 'smooth',
                            });
                        }}
                    />
                    <ProductCategoryNavbar />
                </div>
            )}
        </header>
    );
};

export default Header;
