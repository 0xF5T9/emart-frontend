/**
 * @file business-service-item.ts
 * @description Business service items.
 */

'use strict';
import type { BusinessServiceItem } from '@sources/ts/components/Sections/IndexSection/components/BusinessServices';

const businessServiceItems: BusinessServiceItem[] = [
    {
        title: 'MIỄN PHÍ GIAO HÀNG',
        text: 'Cho bán kính dưới 5km',
        icon: 'fal fa-person-carry-box',
    },
    {
        title: 'SẢN PHẨM AN TOÀN',
        text: 'Cam kết chất lượng',
        icon: 'fal fa-shield-heart',
    },
    {
        title: 'THỜI GIAN MỞ CỬA',
        text: 'Từ thứ 2 đến thứ 7',
        icon: 'fal fa-business-time',
    },
    {
        title: 'THỰC ĐƠN',
        text: 'Cập nhật mỗi ngày',
        icon: 'fal fa-utensils',
    },
];

export default businessServiceItems;
