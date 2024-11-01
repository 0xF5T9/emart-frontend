/**
 * @file admin-section-top-aside-items.ts
 * @description Admin section top aside items.
 */

'use strict';
import type { AdminAsideItem } from '@sources/ts/types/admin-section-aside-item';

const adminSectionTopAsideItems: AdminAsideItem[] = [
    {
        text: 'Sản phẩm',
        icon: 'fal fa-pot-food',
        to: 'products',
    },
    {
        text: 'Danh mục',
        icon: 'fal fa-list',
        to: 'categories',
    },
    {
        text: 'Đơn hàng',
        icon: 'fal fa-basket-shopping',
        to: 'orders',
    },
    {
        text: 'Người dùng',
        icon: 'fal fa-users',
        to: 'users',
    },
];

export default adminSectionTopAsideItems;
