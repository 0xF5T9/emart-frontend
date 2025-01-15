/**
 * @file admin-section-bottom-aside-items.ts
 * @description Admin section bottom aside items.
 */

'use strict';
import type { AdminAsideItem } from '@sources/ts/types/admin-section-aside-item';
import routes from '@sources/ts/global/react-router/routes';

const adminSectionBottomAsideItems: AdminAsideItem[] = [
    {
        text: 'Back to Homepage',
        icon: 'fal fa-circle-chevron-left',
        to: routes.home,
    },
    {
        text: 'Account settings',
        icon: 'fal fa-user-circle',
        to: routes.profile,
    },
    {
        text: 'Logout',
        icon: 'fal fa-arrow-right-from-bracket',
        action: 'logout',
    },
];

export default adminSectionBottomAsideItems;
