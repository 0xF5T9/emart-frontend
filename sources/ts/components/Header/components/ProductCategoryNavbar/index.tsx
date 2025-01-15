/**
 * @file index.tsx
 * @desc Product category navigation bar.
 */

'use strict';
import type { NavbarItem } from '@sources/ts/types/product-category-navigation-bar';
import { ElementType, FunctionComponent, useState, useEffect } from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { useAPI } from '@sources/ts/hooks/useAPI';
import apis from '@sources/ts/apis';
import ContextMenu from '@sources/ts/components/ContextMenu';
import * as styles from './ProductCategoryNavbar.module.css';
import staticNavbarItems from '@sources/ts/render/static-header-category-navbar-items';

/**
 * Navbar item.
 * @param props Component properties.
 * @param props.text Item text.
 * @param props.icon Item icon.
 * @param props.image Item image.
 * @param props.to React router route link.
 * @param props.items Subitems.
 * @param props.onClick On-click callback.
 * @param props.categoryFilter Category filter.
 * @param props.clearFilter Clear category filter.
 * @returns Returns the component.
 */
const NavbarItem: FunctionComponent<{
    text: NavbarItem['text'];
    icon?: NavbarItem['icon'];
    image?: NavbarItem['image'];
    to?: NavbarItem['to'];
    items?: NavbarItem['items'];
    onClick?: NavbarItem['onClick'];
    categoryFilter?: NavbarItem['categoryFilter'];
    clearFilter?: NavbarItem['clearFilter'];
}> = ({
    text,
    icon,
    image,
    to,
    items,
    onClick,
    categoryFilter,
    clearFilter = false,
}) => {
    const { productItems, productFilter, setProductFilter } = useAPI();

    const LinkComponent:
        | React.ForwardRefExoticComponent<
              NavLinkProps & React.RefAttributes<HTMLAnchorElement>
          >
        | ElementType = to ? NavLink : ('a' as ElementType);

    const Icon = icon;

    const handleClick: React.DetailedHTMLProps<
        React.LiHTMLAttributes<HTMLLIElement>,
        HTMLLIElement
    >['onClick'] = (event) => {
        if (!productItems || !productItems?.length) return;

        if (categoryFilter) {
            setProductFilter({ type: 'category', value: categoryFilter });
            setTimeout(() => {
                document?.getElementById('products-section')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'center',
                });
            }, 1);
        }
        if (clearFilter) setProductFilter(null);
        if (onClick) onClick(event);
    };

    return (
        <ContextMenu
            className={styles['navbar-item-context-popup']}
            placement="bottom"
            appendTo={document.body}
            trigger="mouseenter click"
            offset={[0, 10]}
            delay={[100, 0]}
            disabled={!!!items || !!!items?.length}
            menus={[
                {
                    id: 'default',
                    menu: items,
                },
            ]}
        >
            <li className={styles['navbar-item']} onClick={handleClick}>
                <LinkComponent
                    className={
                        to
                            ? ({ isActive, isPending }: any) => {
                                  return isPending
                                      ? classNames(
                                            styles['navbar-item-link'],
                                            styles['is-pending']
                                        )
                                      : isActive
                                        ? classNames(
                                              styles['navbar-item-link'],
                                              styles['is-active']
                                          )
                                        : styles['navbar-item-link'];
                              }
                            : classNames(styles['navbar-item-link'], {
                                  [styles['is-active']]:
                                      categoryFilter === productFilter?.value,
                              })
                    }
                    tabIndex={-1}
                    to={to}
                >
                    <div className={styles['navbar-item-link-content']}>
                        {icon && typeof icon === 'function' ? (
                            <Icon className={styles['navbar-item-icon']} />
                        ) : icon && typeof icon === 'string' ? (
                            <i
                                className={classNames(
                                    styles['navbar-item-icon'],
                                    icon
                                )}
                            />
                        ) : null}
                        {!icon && image && (
                            <img
                                className={styles['navbar-item-image']}
                                src={image.url}
                                alt={image.alt}
                                style={{
                                    width: image.width || '1rem',
                                    height: image.height || '1rem',
                                }}
                            />
                        )}

                        <span className={styles['navbar-item-text']}>
                            {text}
                        </span>
                    </div>
                </LinkComponent>
            </li>
        </ContextMenu>
    );
};

NavbarItem.propTypes = {
    text: PropTypes.string,
    icon: PropTypes.any,
    image: PropTypes.exact({
        url: PropTypes.string.isRequired,
        alt: PropTypes.string,
        width: PropTypes.string,
        height: PropTypes.string,
    }),
    to: PropTypes.string,
    items: PropTypes.array,
    onClick: PropTypes.func,
    categoryFilter: PropTypes.string,
    clearFilter: PropTypes.bool,
};

/**
 * Product category navigation bar.
 * @param props Component properties.
 * @param props.staticItems Static navbar items.
 * @returns Returns the component.
 */
const ProductCategoryNavbar: FunctionComponent<{
    staticItems?: NavbarItem[];
}> = ({ staticItems = staticNavbarItems }) => {
    const [items, setItems] = useState(() => {
        return staticItems;
    });

    useEffect(() => {
        (async () => {
            const { message, success, data } = await apis.emart.getCategories();
            if (!success) {
                console.error(message);
                return;
            }

            const fetchedCategories = data?.categories?.sort(
                    (a, b) => b?.priority - a?.priority
                ),
                transformedCategories: NavbarItem[] = fetchedCategories.map(
                    (category) => {
                        return {
                            text: category.name,
                            categoryFilter: category.slug,
                            image: category?.imageFileName
                                ? {
                                      url: `${process.env.UPLOAD_URL}/category/${category?.imageFileName}`,
                                      width: '30px',
                                      height: '30px',
                                  }
                                : undefined,
                        };
                    }
                );

            setItems([...items, ...transformedCategories]);
        })();
    }, []);

    return (
        <nav className={styles['navbar']}>
            <ul className={styles['navbar-list']}>
                {items?.map((item, index) => (
                    <NavbarItem
                        key={index}
                        text={item.text}
                        icon={item.icon}
                        image={item.image}
                        to={item.to}
                        items={item.items}
                        onClick={item.onClick}
                        categoryFilter={item.categoryFilter}
                        clearFilter={item.clearFilter}
                    />
                ))}
            </ul>
        </nav>
    );
};

ProductCategoryNavbar.propTypes = {
    staticItems: PropTypes.array,
};

export default ProductCategoryNavbar;
