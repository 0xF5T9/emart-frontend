/**
 * @file index.tsx
 * @description Footer.
 */

'use strict';
import type { Category } from '@sources/ts/apis/emart/types';
import {
    FunctionComponent,
    useState,
    useLayoutEffect,
    useRef,
    useEffect,
} from 'react';

import { showToast } from '@sources/ts/components/Toast';
import { useModal } from '@sources/ts/hooks/useModal';
import { useAPI } from '@sources/ts/hooks/useAPI';
import { Github } from '@sources/ts/components/Icons/Github';
import { Discord } from '@sources/ts/components/Icons/Discord';
import Button from '@sources/ts/components/Button';
import staticTexts from '@sources/ts/render/static-texts';
import staticUrls from '@sources/ts/render/static-urls';
import * as styles from './Footer.module.css';
import classNames from 'classnames';
import apis from '@sources/ts/apis';
const texts = staticTexts.footer,
    { brandLogoUrl } = staticUrls;

/**
 * Footer.
 * @returns Returns the component.
 */
const Footer: FunctionComponent = function () {
    const { setProductFilter } = useAPI(),
        { setModal } = useModal(),
        footer = useRef<HTMLElement>(),
        emailInput = useRef<HTMLInputElement>(),
        timeoutId = useRef<NodeJS.Timeout>(null);

    const [isPending, setIsPending] = useState<boolean>(false),
        [categories, setCategories] = useState<Category[]>(null);

    const handleSubscribeNewsletter: React.DetailedHTMLProps<
        React.FormHTMLAttributes<HTMLFormElement>,
        HTMLFormElement
    >['onSubmit'] = (event) => {
        event.preventDefault();
        if (isPending) return;
        (async () => {
            if (!emailInput?.current?.value) {
                emailInput?.current?.focus();
                showToast({
                    variant: 'danger',
                    title: staticTexts.toast.errorDefaultTitle,
                    message: 'Vui lòng nhập địa chỉ email hợp lệ.',
                    duration: 5000,
                });
                return;
            }
            if (
                !/^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/.test(
                    emailInput?.current?.value
                )
            ) {
                emailInput?.current?.focus();
                showToast({
                    variant: 'danger',
                    title: staticTexts.toast.errorDefaultTitle,
                    message: 'Địa chỉ email không hợp lệ (Chỉ hỗ trợ Gmail)',
                    duration: 5000,
                });
                return;
            }

            setIsPending(true);

            const { success, message } = await apis.emart.subscribeNewsletter(
                emailInput?.current?.value
            );
            if (!success) {
                console.error(message);
                showToast({
                    variant: 'danger',
                    title: staticTexts.toast.errorDefaultTitle,
                    message: message,
                    duration: 5000,
                });
                setIsPending(false);
                return;
            }

            setModal({
                type: 'alert',
                variant: 'success',
                title: texts.subscribeSuccessfulModal.title,
                message,
                closeButtonText: texts.subscribeSuccessfulModal.closeButton,
                closeButtonVariant: 'primary',
                iconColor: 'var(--color-primary, blue)',
                className: styles['subscribe-newsletter-success-modal'],
            });

            emailInput.current.value = '';

            setIsPending(false);
        })();
    };

    const handleUpdateCategoryView = (categorySlug: string) => {
        setProductFilter({
            type: 'category',
            value: categorySlug,
        });
        setTimeout(() => {
            document?.getElementById('products-section')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'center',
            });
        }, 1);
    };

    useLayoutEffect(() => {
        function handleFooterResize() {
            if (timeoutId?.current) clearTimeout(timeoutId.current);

            timeoutId.current = setTimeout(() => {
                const currentFooterHeight = getComputedStyle(
                    document.documentElement
                ).getPropertyValue('--footer-height');
                if (!currentFooterHeight) {
                    console.warn(
                        'Expect footer height variable in root, but none were found.',
                        `\nFound value: '${currentFooterHeight}'`
                    );
                    return;
                }

                const footerHeight =
                        footer?.current?.getBoundingClientRect()?.height,
                    parsedHeight = parseFloat(footerHeight.toFixed(2));

                document.documentElement.style.setProperty(
                    '--footer-height',
                    `${parsedHeight}px`
                );
            }, 1);
        }

        // BUG: ResizeObserver loop completed with undelivered notifications.
        // Added 1ms debounce. To be observed.
        const observer = new ResizeObserver(handleFooterResize);
        observer?.observe(footer?.current);

        return () => {
            observer?.disconnect();

            const currentFooterHeight = getComputedStyle(
                document.documentElement
            ).getPropertyValue('--footer-height');
            if (!currentFooterHeight)
                console.warn(
                    'Expect footer height variable in root, but none were found.',
                    `\nFound value: '${currentFooterHeight}'`
                );
            document.documentElement.style.setProperty(
                '--footer-height',
                `0px`
            );
        };
    }, []);

    useEffect(() => {
        setIsPending(true);
        (async () => {
            const { message, success, data } = await apis.emart.getCategories(
                1,
                5
            );
            if (!success) {
                console.error(message);
                setIsPending(false);
                return;
            }
            setCategories(data.categories);
            setIsPending(false);
        })();
    }, []);

    return (
        <footer ref={footer} className={styles['footer']}>
            <div className={styles['subscribe-section-wrapper']}>
                <div className={styles['subscribe-section']}>
                    <div className={styles['subscribe-section-logo-wrapper']}>
                        <img
                            className={styles['subscribe-section-logo']}
                            src={brandLogoUrl}
                            alt={texts.brandLogoAlt}
                        />
                    </div>
                    <div className={styles['subscribe-section-titles-wrapper']}>
                        <span className={styles['subscribe-section-title']}>
                            {texts.subscribeTitle}
                        </span>
                        <span className={styles['subscribe-section-subtitle']}>
                            {texts.subscribeText}
                        </span>
                    </div>
                    <form
                        className={styles['subscribe-section-form']}
                        onSubmit={handleSubscribeNewsletter}
                    >
                        <input
                            ref={emailInput}
                            className={styles['subscribe-section-form-input']}
                            type="email"
                            placeholder={texts.subscribeInputPlaceholder}
                            disabled={isPending}
                            required
                        />
                        <Button
                            className={styles['subscribe-section-form-submit']}
                            loading={isPending}
                            disabled={isPending}
                        >
                            {texts.subscribeButton}{' '}
                            <i className="fas fa-arrow-right" />
                        </Button>
                    </form>
                </div>
            </div>
            <div className={styles['widget-section-wrapper']}>
                <div className={styles['widget-section']}>
                    <div className={styles['widget-item-about-us']}>
                        <span className={styles['about-us-title']}>
                            {texts.aboutUsLinkTitle}
                        </span>
                        <span className={styles['about-us-desc']}>
                            {texts.aboutUsLinkText}
                        </span>
                        <img
                            className={styles['about-us-brand-logo']}
                            src={brandLogoUrl}
                            alt={texts.brandLogoAlt}
                        />
                        <ul className={styles['about-us-socials']}>
                            <li className={styles['about-us-social-item']}>
                                <a
                                    className={
                                        styles['about-us-social-item-link']
                                    }
                                >
                                    <i
                                        className={classNames(
                                            styles['about-us-social-item-icon'],
                                            'fab fa-facebook-f'
                                        )}
                                    />
                                </a>
                            </li>
                            <li className={styles['about-us-social-item']}>
                                <a
                                    className={
                                        styles['about-us-social-item-link']
                                    }
                                >
                                    <i
                                        className={classNames(
                                            styles['about-us-social-item-icon'],
                                            'fab fa-twitter'
                                        )}
                                    />
                                </a>
                            </li>
                            <li className={styles['about-us-social-item']}>
                                <a
                                    className={
                                        styles['about-us-social-item-link']
                                    }
                                >
                                    <i
                                        className={classNames(
                                            styles['about-us-social-item-icon'],
                                            'fab fa-linkedin-in'
                                        )}
                                    />
                                </a>
                            </li>
                            <li className={styles['about-us-social-item']}>
                                <a
                                    className={
                                        styles['about-us-social-item-link']
                                    }
                                >
                                    <i
                                        className={classNames(
                                            styles['about-us-social-item-icon'],
                                            'fab fa-whatsapp'
                                        )}
                                    />
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className={styles['widget-item-links']}>
                        <span className={styles['links-title']}>
                            {texts.linksLinkTitle}
                        </span>
                        <ul className={styles['links-list']}>
                            <li className={styles['links-item']}>
                                <a
                                    className={styles['links-anchor']}
                                    href="https://www.popmart.com"
                                    target="_blank"
                                >
                                    <i
                                        className={classNames(
                                            styles['links-icon'],
                                            'far fa-arrow-right'
                                        )}
                                    />
                                    <span>Official POP MART</span>
                                </a>
                            </li>
                            <li className={styles['links-item']}>
                                <a
                                    className={styles['links-anchor']}
                                    href="https://www.popmart.com/us/news"
                                    target="_blank"
                                >
                                    <i
                                        className={classNames(
                                            styles['links-icon'],
                                            'far fa-arrow-right'
                                        )}
                                    />
                                    <span>News</span>
                                </a>
                            </li>
                            <li className={styles['links-item']}>
                                <a
                                    className={styles['links-anchor']}
                                    href="https://www.popmart.com/us/ip-artist-zone"
                                    target="_blank"
                                >
                                    <i
                                        className={classNames(
                                            styles['links-icon'],
                                            'far fa-arrow-right'
                                        )}
                                    />
                                    <span>Artists</span>
                                </a>
                            </li>
                            <li className={styles['links-item']}>
                                <a
                                    className={styles['links-anchor']}
                                    href="https://www.popmart.com/us/blog"
                                    target="_blank"
                                >
                                    <i
                                        className={classNames(
                                            styles['links-icon'],
                                            'far fa-arrow-right'
                                        )}
                                    />
                                    <span>Blog</span>
                                </a>
                            </li>
                            <li className={styles['links-item']}>
                                <a
                                    className={styles['links-anchor']}
                                    href="https://www.popmart.com/us/help/faqs"
                                    target="_blank"
                                >
                                    <i
                                        className={classNames(
                                            styles['links-icon'],
                                            'far fa-arrow-right'
                                        )}
                                    />
                                    <span>FAQ</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                    {categories?.length && (
                        <div className={styles['widget-item-links']}>
                            <span className={styles['links-title']}>
                                {texts.menuLinkTitle}
                            </span>
                            <ul className={styles['links-list']}>
                                {categories?.map((category) => (
                                    <li
                                        key={category.slug}
                                        className={styles['links-item']}
                                    >
                                        <a
                                            className={styles['links-anchor']}
                                            onClick={() =>
                                                handleUpdateCategoryView(
                                                    category.slug
                                                )
                                            }
                                        >
                                            <i
                                                className={classNames(
                                                    styles['links-icon'],
                                                    'far fa-arrow-right'
                                                )}
                                            />
                                            <span>{category.name}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className={styles['widget-item-contact']}>
                        <span className={styles['contact-title']}>
                            {texts.contactLinkTitle}
                        </span>
                        <ul className={styles['contact-list']}>
                            <li className={styles['contact-item']}>
                                <div
                                    className={
                                        styles['contact-item-icon-wrapper']
                                    }
                                >
                                    <i
                                        className={classNames(
                                            styles['contact-item-icon'],
                                            'far fa-location-dot'
                                        )}
                                    />
                                </div>
                                <div className={styles['contact-item-content']}>
                                    <span>
                                        485 Maple Drive (later 211 Pine St.),
                                        Mayfield, U.S.
                                    </span>
                                </div>
                            </li>
                            <li className={styles['contact-item']}>
                                <div
                                    className={
                                        styles['contact-item-icon-wrapper']
                                    }
                                >
                                    <i
                                        className={classNames(
                                            styles['contact-item-icon'],
                                            'far fa-phone'
                                        )}
                                    />
                                </div>
                                <div className={styles['contact-item-content']}>
                                    <span>0123 456 789</span>
                                    <span>0987 654 321</span>
                                </div>
                            </li>
                            <li className={styles['contact-item']}>
                                <div
                                    className={
                                        styles['contact-item-icon-wrapper']
                                    }
                                >
                                    <i
                                        className={classNames(
                                            styles['contact-item-icon'],
                                            'far fa-envelope'
                                        )}
                                    />
                                </div>
                                <div className={styles['contact-item-content']}>
                                    <span>support@e-mart.com</span>
                                    <span>info@e-mart.com</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className={styles['copyright-section-wrapper']}>
                <div className={styles['copyright-section']}>
                    <span className={styles['copyright']}>
                        {texts.footerCopyRightText}
                    </span>
                    <div className={styles['extra-social-links']}>
                        <a
                            className={styles['extra-social-link']}
                            style={
                                {
                                    '--social-link-color-hover': '#3a3a3a',
                                    '--social-link-filter-hover':
                                        'brightness(1)',
                                } as React.CSSProperties
                            }
                            href="https://github.com/0xF5T9"
                            target="_blank"
                        >
                            <Github />
                        </a>
                        <a
                            className={styles['extra-social-link']}
                            style={
                                {
                                    '--social-link-color-hover': '#5868f2',
                                    '--social-link-filter-hover':
                                        'brightness(1)',
                                } as React.CSSProperties
                            }
                            href="https://discord.com/"
                            target="_blank"
                        >
                            <Discord />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
