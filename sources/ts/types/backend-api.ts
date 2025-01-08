/**
 * @file backend-api.ts
 * @description Backend api related types.
 */

import type { SessionData } from '@sources/ts/types/authentication';
import type { CartItem } from '@sources/ts/types/VyFood';

export type BackendResponse<DataType> = {
    message: string;
    data: DataType;
};

export type AuthorizeResponseData = SessionData;

export type DeauthorizeResponseData = null;

export type RefreshTokensResponseData = {
    refreshToken: string;
    accessToken: string;
};

export type VerifySessionResponseData = SessionData;

export type RegisterResponseData = null;

export type ForgotPasswordResponseData = null;

export type ResetPasswordResponseData = null;

export type UploadUserAvatarResponseData = null;

export type GetUserInfoResponseData = RawUser;

export type UpdateUserInfoResponseData = null;

export type UpdateEmailAddressResponseData = null;

export type UpdatePasswordResponseData = null;

export type DeleteUserResponseData = null;

export type RawUser = {
    username: string;
    email: string;
    role: string;
    avatarFileName: string;
    createdAt: string;
};

export type GetUsersAsAdminResponseData = {
    meta: {
        page: number;
        itemPerPage: number;
        totalItems: number;
        isFirstPage: boolean;
        isLastPage: boolean;
        prevPage: string;
        nextPage: string;
    };
    users: RawUser[];
};

export type CreateUserAsAdminResponseData = null;

export type UpdateUserAsAdminResponseData = null;

export type DeleteUserAsAdminResponseData = null;

export type UploadUserAvatarAsAdminResponseData = null;

export type RawProduct = {
    slug: string;
    name: string;
    category: string[];
    desc: string;
    price: number;
    imageFileName: string;
    quantity: number;
    priority: number;
};

export type GetProductsResponseData = {
    meta: {
        page: number;
        itemPerPage: number;
        totalItems: number;
        isFirstPage: boolean;
        isLastPage: boolean;
        prevPage: string;
        nextPage: string;
    };
    products: RawProduct[];
};

export type CreateProductResponseData = null;

export type UpdateProductResponseData = null;

export type DeleteProductResponseData = null;

export type UploadProductImageResponseData = null;

export type RawCategory = {
    slug: string;
    name: string;
    desc: string;
    imageFileName: string;
    priority: number;
};

export type GetCategoriesResponseData = {
    meta: {
        page: number;
        itemPerPage: number;
        totalItems: number;
        isFirstPage: boolean;
        isLastPage: boolean;
        prevPage: string;
        nextPage: string;
    };
    categories: RawCategory[];
};

export type GetCategoriesCountResponseData = Array<{
    slug: string;
    count: number;
}>;

export type CreateCategoryResponseData = null;

export type UpdateCategoryResponseData = null;

export type DeleteCategoryResponseData = null;

export type UploadCategoryImageResponseData = null;

export type RawOrder = {
    orderId: number;
    deliveryMethod: 'shipping' | 'pickup';
    deliveryAddress: string;
    deliveryTime: string;
    pickupAt: string;
    deliveryNote: string;
    customerName: string;
    customerPhoneNumber: string;
    items: CartItem[];
    status: 'processing' | 'completed' | 'aborted';
    createdAt: string;
};

export type GetOrdersResponseData = {
    meta: {
        page: number;
        itemPerPage: number;
        totalItems: number;
        isFirstPage: boolean;
        isLastPage: boolean;
        prevPage: string;
        nextPage: string;
    };
    orders: RawOrder[];
};

export type CreateOrderResponseData = null;
export type UpdateOrderResponseData = null;
export type DeleteOrderResponseData = null;
export type RestoreProductQuantityResponseData = null;

export type SubscribeNewsletterResponseData = null;
export type SubscribeNewsletterConfirmationResponseData = null;
