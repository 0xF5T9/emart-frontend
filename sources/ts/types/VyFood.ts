/**
 * @file VyFood.ts
 * @description Business types.
 */

'use strict';

import type { RawCategory } from '@sources/ts/types/backend-api';

export type Category = RawCategory;

export type Product = {
    slug: string;
    name: string;
    category: string[];
    desc: string;
    price: number;
    imageFileName: string;
    quantity: number;
    priority: number;
};

export type CartItem = {
    id: number;
    product: Product;
    totalItems: number;
    note: string;
};

export type Order = {
    orderId: number;
    deliveryMethod: 'shipping' | 'pickup';
    deliveryAddress: string;
    deliveryTime: Date;
    pickupAt: string;
    deliveryNote: string;
    customerName: string;
    customerPhoneNumber: string;
    items: CartItem[];
    status:
        | 'processing'
        | 'shipping'
        | 'completed'
        | 'refunding'
        | 'aborted'
        | 'refunded';
    createdAt: Date;
};

export type User = {
    username: string;
    email: string;
    role: string;
    avatarFileName: string;
    createdAt: Date;
};
