/**
 * @file header-category-navbar-items.ts
 * @description Static header category navbar items.
 */

'use strict';
import type { NavbarItem } from '@sources/ts/types/product-category-navigation-bar';
import staticUrls from './static-urls';

const staticNavbarItems: NavbarItem[] = [
    {
        text: 'All products',
        image: {
            url: staticUrls.allCategory,
            width: '30px',
            height: '30px',
        },
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
