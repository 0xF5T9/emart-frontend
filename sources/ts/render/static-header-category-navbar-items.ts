/**
 * @file header-category-navbar-items.ts
 * @description Static header category navbar items.
 */

'use strict';
import type { NavbarItem } from '@sources/ts/types/product-category-navigation-bar';

const staticNavbarItems: NavbarItem[] = [
    {
        text: 'Tất cả món',
        clearFilter: true,
        onClick: () => {
            setTimeout(() => {
                document?.getElementById('products-section')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'center',
                });
            }, 1);
        },
    },
];

export default staticNavbarItems;
