/**
 * @file product-category-navigation-bar.ts
 * @description Product category navigation bar types.
 */

'use strict';
import type { ContextMenuItem } from '@sources/ts/types/context-menu';
import { FunctionComponent } from 'react';

export type NavbarItem = {
    text: string;
    icon?: FunctionComponent<any> | string;
    image?: { url: string; alt?: string; width?: string; height?: string };
    to?: string;
    items?: NavbarSubitem[];
    onClick?: React.DetailedHTMLProps<
        React.LiHTMLAttributes<HTMLLIElement>,
        HTMLLIElement
    >['onClick'];
    categoryFilter?: string;
    clearFilter?: boolean;
};

export type NavbarSubitem = ContextMenuItem;
