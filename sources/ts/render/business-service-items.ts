/**
 * @file business-service-item.ts
 * @description Business service items.
 */

'use strict';
import type { BusinessServiceItem } from '@sources/ts/components/Sections/IndexSection/components/BusinessServices';

const businessServiceItems: BusinessServiceItem[] = [
    {
        title: 'FREE SHIPPING',
        text: 'For a radius of under 5km',
        icon: 'fal fa-person-carry-box',
    },
    {
        title: 'PRODUCT COMMITMENT',
        text: '100% Authentic',
        icon: 'fal fa-badge-check',
    },
    {
        title: 'CHECKING GOODS',
        text: 'Before payment',
        icon: 'fal fa-money-bill',
    },
    {
        title: 'NEW PRODUCTS',
        text: 'Updated daily',
        icon: 'fal fa-box',
    },
];

export default businessServiceItems;
