/**
 * @file backend.ts
 * @description API that interacts with the backend server.
 */

'use strict';
import type {
    BackendResponse,
    AuthorizeResponseData,
    DeauthorizeResponseData,
    RefreshTokensResponseData,
    VerifySessionResponseData,
    RegisterResponseData,
    ForgotPasswordResponseData,
    ResetPasswordResponseData,
    UploadUserAvatarResponseData,
    GetUserInfoResponseData,
    UpdateUserInfoResponseData,
    UpdateEmailAddressResponseData,
    UpdatePasswordResponseData,
    DeleteUserResponseData,
    GetUsersAsAdminResponseData,
    CreateUserAsAdminResponseData,
    UpdateUserAsAdminResponseData,
    DeleteUserAsAdminResponseData,
    UploadUserAvatarAsAdminResponseData,
    GetProductsResponseData,
    CreateProductResponseData,
    UpdateProductResponseData,
    DeleteProductResponseData,
    UploadProductImageResponseData,
    GetCategoriesResponseData,
    GetCategoriesCountResponseData,
    CreateCategoryResponseData,
    UpdateCategoryResponseData,
    DeleteCategoryResponseData,
    UploadCategoryImageResponseData,
    GetOrdersResponseData,
    CreateOrderResponseData,
    UpdateOrderResponseData,
    DeleteOrderResponseData,
    RestoreProductQuantityResponseData,
    SubscribeNewsletterResponseData,
    SubscribeNewsletterConfirmationResponseData,
} from '@sources/ts/types/backend-api';
import axios from 'axios';

import { APIResult } from '@sources/ts/utility/api';
import staticTexts from '@sources/ts/render/static-texts';
const texts = staticTexts.api.backend;

const backend = axios.create({
    baseURL: process.env.API_URL,
    timeout: 60000,
    withCredentials: true,
    fetchOptions: {
        credentials: 'same-origin',
    },
});

/**
 * Register a user.
 * @param email Email.
 * @param username Username.
 * @param password Password.
 * @returns Returns the API response object.
 */
async function register(
    email: string,
    username: string,
    password: string
): Promise<APIResult<RegisterResponseData>> {
    try {
        email = email.toLowerCase();

        if (!/^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/.test(email))
            return new APIResult(texts.invalidEmail, false, null, 400);
        if (!/^[a-zA-Z0-9]+$/.test(username))
            return new APIResult(
                texts.invalidUsernameCharacters,
                false,
                null,
                400
            );
        if (username.length < 6 || username.length > 16)
            return new APIResult(texts.invalidUsernameLength, false, null, 400);
        if (password.length < 8 || password.length > 32)
            return new APIResult(texts.invalidPasswordLength, false, null, 400);

        const result = await backend.post(`register`, {
            email,
            username,
            password,
        });
        const { message, data }: BackendResponse<RegisterResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Get refresh token and access token using username and password.
 * @param username Username.
 * @param password Password.
 * @returns Returns the API response object.
 */
async function authorize(
    username: string,
    password: string
): Promise<APIResult<AuthorizeResponseData>> {
    try {
        const result = await backend.post(`authorize`, {
            username,
            password,
        });
        const { message, data }: BackendResponse<AuthorizeResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Send deauthorize request to the server. (Clear cookies)
 * @returns Returns the API response object.
 */
async function deauthorize(): Promise<APIResult<DeauthorizeResponseData>> {
    try {
        const result = await backend.post(`authorize/deauthorize`);
        const { message, data }: BackendResponse<DeauthorizeResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Get new refresh and access token using current refresh token.
 * @param refreshToken Refresh token.
 * @param username Username.
 * @returns Returns the API response object.
 */
async function refreshTokens(
    refreshToken: string,
    username: string
): Promise<APIResult<RefreshTokensResponseData>> {
    try {
        const result = await backend.post(`authorize/refreshTokens`, {
            refreshToken,
            username,
        });
        const { message, data }: BackendResponse<RefreshTokensResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Verify session.
 * @param forceRefreshToken Specifies whether to force refresh new token.
 * @returns Returns the API response object.
 */
async function verifySession(
    forceRefreshToken: boolean = false
): Promise<APIResult<VerifySessionResponseData>> {
    try {
        const result = await backend.post(
            `authorize/verifySession${forceRefreshToken ? '?forceRefreshToken=1' : ''}`
        );
        const { message, data }: BackendResponse<VerifySessionResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Send a forgot password request.
 * @param email Email address.
 * @returns Returns the API response object.
 */
async function forgotPassword(
    email: string
): Promise<APIResult<ForgotPasswordResponseData>> {
    try {
        email = email.toLowerCase();

        if (!/^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/.test(email))
            return new APIResult(texts.invalidEmail, false, null, 400);

        const result = await backend.post(`recovery/forgot-password`, {
            email,
        });
        const { message, data }: BackendResponse<ForgotPasswordResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Send a forgot password request.
 * @param token Reset password token.
 * @param newPassword New password.
 * @returns Returns the API response object.
 */
async function resetPassword(
    token: string,
    newPassword: string
): Promise<APIResult<ResetPasswordResponseData>> {
    try {
        if (!token || !newPassword)
            return new APIResult(
                texts.invalidResetPasswordRequest,
                false,
                null,
                400
            );

        if (newPassword.length < 8 || newPassword.length > 32)
            return new APIResult(texts.invalidPasswordLength, false, null, 400);

        const result = await backend.post(`recovery/reset-password`, {
            token,
            newPassword,
        });
        const { message, data }: BackendResponse<ResetPasswordResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Upload user avatar.
 * @param username Username.
 * @param avatarImage Avatar image.
 * @returns Returns the API response object.
 */
async function uploadUserAvatar(
    username: string,
    avatarImage: string | Blob
): Promise<APIResult<UploadUserAvatarResponseData>> {
    try {
        if (!username || !avatarImage)
            return new APIResult(
                `Thông tin 'username', 'avatarImage' bị thiếu.`,
                false,
                null,
                400
            );

        const form = new FormData();
        form.append('avatarImage', avatarImage);

        const result = await backend.post(
            `user/${username}/upload-avatar`,
            form
        );

        const { message, data }: BackendResponse<UploadUserAvatarResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Get user information.
 * @param username Username.
 * @returns Returns the API response object.
 */
async function getUserInfo(
    username: string
): Promise<APIResult<GetUserInfoResponseData>> {
    try {
        const result = await backend.get(`user/${username}`);
        const { message, data }: BackendResponse<GetUserInfoResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Update user information.
 * @param username Username.
 * @param fields Update fields.
 * @returns Returns the API response object.
 */
async function updateUserInfo(
    username: string,
    fields: { email?: string }
): Promise<APIResult<UpdateUserInfoResponseData>> {
    try {
        if (!username)
            return new APIResult(
                texts.invalidUpdateUserInfoRequest,
                false,
                null,
                400
            );

        const { email } = fields;

        if (
            email &&
            !/^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/.test(email)
        )
            return new APIResult(texts.invalidEmail, false, null, 400);

        const result = await backend.patch(`user/${username}`, {
            email,
        });
        const { message, data }: BackendResponse<UpdateUserInfoResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Update email address.
 * @param token Update email address token.
 * @returns Returns the API response object.
 */
async function updateEmailAddress(
    token: string
): Promise<APIResult<UpdateEmailAddressResponseData>> {
    try {
        if (!token)
            return new APIResult(
                texts.invalidUpdateEmailRequest,
                false,
                null,
                400
            );

        const result = await backend.post(`user/update-email-address`, {
            token,
        });
        const {
            message,
            data,
        }: BackendResponse<UpdateEmailAddressResponseData> = result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Update password.
 * @param username Username.
 * @param currentPassword Current password.
 * @param newPassword New password.
 * @returns Returns the API response object.
 */
async function updatePassword(
    username: string,
    currentPassword: string,
    newPassword: string
): Promise<APIResult<UpdatePasswordResponseData>> {
    try {
        if (!username || !currentPassword || !newPassword)
            return new APIResult(
                texts.invalidUpdatePasswordRequest,
                false,
                null,
                400
            );

        if (newPassword.length < 8 || newPassword.length > 32)
            return new APIResult(texts.invalidPasswordLength, false, null, 400);

        const result = await backend.post(`user/${username}/update-password`, {
            currentPassword,
            newPassword,
        });
        const { message, data }: BackendResponse<UpdatePasswordResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Delete user.
 * @param username Username.
 * @param currentPassword Current password.
 * @returns Returns the API response object.
 */
async function deleteUser(
    username: string,
    currentPassword: string
): Promise<APIResult<DeleteUserResponseData>> {
    try {
        if (!username || !currentPassword)
            return new APIResult(
                texts.invalidDeleteAccountRequest,
                false,
                null,
                400
            );

        const result = await backend.post(`user/${username}/delete-user`, {
            currentPassword,
        });
        const { message, data }: BackendResponse<DeleteUserResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Get users as admin.
 * @param page Pagination (default: 1)
 * @param itemPerPage Item per page. (default: 99999)
 * @returns Returns the API response object.
 */
async function getUsersAsAdmin(
    page: number = 1,
    itemPerPage: number = 99999
): Promise<APIResult<GetUsersAsAdminResponseData>> {
    try {
        const result = await backend.get(
            `/user/admin-get-users?page=${page}&itemPerPage=${itemPerPage}`
        );
        const { message, data }: BackendResponse<GetUsersAsAdminResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Create user as admin.
 * @param username Username.
 * @param password Password.
 * @param email Email address.
 * @param role User role.
 * @param avatarImage User avatar image.
 * @returns Returns the API response object.
 */
async function createUserAsAdmin(
    username: string,
    password: string,
    email: string,
    role: string,
    avatarImage: string | Blob
): Promise<APIResult<CreateUserAsAdminResponseData>> {
    try {
        email = email.toLowerCase();

        if (!username || !password || !email || !role)
            return new APIResult(
                `Thông tin 'username', 'password', 'email', 'role' bị thiếu.`,
                false,
                null,
                400
            );

        if (!/^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/.test(email))
            return new APIResult(texts.invalidEmail, false, null, 400);
        if (!/^[a-zA-Z0-9]+$/.test(username))
            return new APIResult(
                texts.invalidUsernameCharacters,
                false,
                null,
                400
            );
        if (username.length < 6 || username.length > 16)
            return new APIResult(texts.invalidUsernameLength, false, null, 400);
        if (password.length < 8 || password.length > 32)
            return new APIResult(texts.invalidPasswordLength, false, null, 400);

        const form = new FormData();
        form.append('username', username);
        form.append('password', password);
        form.append('email', email);
        form.append('role', role);
        form.append('avatarImage', avatarImage);

        const result = await backend.post('/user/admin-create', form);

        const {
            message,
            data,
        }: BackendResponse<CreateUserAsAdminResponseData> = result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Update user as admin.
 * @param targetUsername Target username.
 * @param username Username.
 * @param password Password.
 * @param email Email address.
 * @param role User role.
 * @returns Returns the API response object.
 */
async function updateUserAsAdmin(
    targetUsername: string,
    username: string,
    password: string,
    email: string,
    role: string
): Promise<APIResult<UpdateUserAsAdminResponseData>> {
    try {
        email = email.toLowerCase();

        if (!targetUsername)
            return new APIResult(
                `Thông tin 'targetUsername' bị thiếu.`,
                false,
                null,
                400
            );

        if (
            email &&
            !/^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/.test(email)
        )
            return new APIResult(texts.invalidEmail, false, null, 400);
        if (username && !/^[a-zA-Z0-9]+$/.test(username))
            return new APIResult(
                texts.invalidUsernameCharacters,
                false,
                null,
                400
            );
        if ((username && username.length < 6) || username.length > 16)
            return new APIResult(texts.invalidUsernameLength, false, null, 400);
        if ((password && password.length < 8) || password.length > 32)
            return new APIResult(texts.invalidPasswordLength, false, null, 400);

        const result = await backend.patch('/user/admin-update', {
            targetUsername,
            username,
            password,
            email,
            role,
        });

        const {
            message,
            data,
        }: BackendResponse<UpdateUserAsAdminResponseData> = result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Delete an user as admin.
 * @param username Username.
 * @returns Returns the API response object.
 */
async function deleteUserAsAdmin(
    username: string
): Promise<APIResult<DeleteUserAsAdminResponseData>> {
    try {
        if (!username)
            return new APIResult(
                `Thông tin 'username' bị thiếu.`,
                false,
                null,
                400
            );

        const result = await backend.delete(`user/admin-delete`, {
            data: {
                username,
            },
        });
        const {
            message,
            data,
        }: BackendResponse<DeleteUserAsAdminResponseData> = result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Upload user avatar as admin.
 * @param username Username.
 * @param avatarImage Avatar image.
 * @returns Returns the API response object.
 */
async function uploadUserAvatarAsAdmin(
    username: string,
    avatarImage: string | Blob
): Promise<APIResult<UploadUserAvatarAsAdminResponseData>> {
    try {
        if (!username || !avatarImage)
            return new APIResult(
                `Thông tin 'username', 'avatarImage' bị thiếu.`,
                false,
                null,
                400
            );

        const form = new FormData();
        form.append('username', username);
        form.append('avatarImage', avatarImage);

        const result = await backend.post('user/admin-upload-avatar', form);

        const {
            message,
            data,
        }: BackendResponse<UploadUserAvatarAsAdminResponseData> = result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Get products.
 * @param page Pagination (default: 1)
 * @param itemPerPage Item per page. (default: 99999)
 * @returns Returns the API response object.
 */
async function getProducts(
    page: number = 1,
    itemPerPage: number = 99999
): Promise<APIResult<GetProductsResponseData>> {
    try {
        const result = await backend.get(
            `product?page=${page}&itemPerPage=${itemPerPage}`
        );
        const { message, data }: BackendResponse<GetProductsResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Create product.
 * @param name Product name.
 * @param categories Product categories.
 * @param desc Product description.
 * @param price Product price.
 * @param quantity Product quantity.
 * @param priority Product priority.
 * @param image Product image.
 * @returns Returns the API response object.
 */
async function createProduct(
    name: string,
    categories: string,
    desc: string,
    price: number,
    quantity: number,
    priority: number,
    image: string | Blob
): Promise<APIResult<CreateProductResponseData>> {
    try {
        if (
            !name ||
            (!price && price !== 0) ||
            (!quantity && quantity !== 0) ||
            (!priority && priority !== 0)
        )
            return new APIResult(
                `Thông tin 'name', 'price', 'quantity', 'priority' bị thiếu.`,
                false,
                null,
                400
            );

        const form = new FormData();
        form.append('name', name);
        form.append('categories', categories);
        form.append('desc', desc);
        form.append('price', `${price}`?.replace(/\D/g, ''));
        form.append('quantity', `${quantity}`?.replace(/\D/g, ''));
        form.append('priority', `${priority}`?.replace(/\D/g, ''));
        form.append('image', image);

        const result = await backend.post('product', form);

        const { message, data }: BackendResponse<CreateProductResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Update product.
 * @param slug Product slug.
 * @param name Product name.
 * @param categories Product categories.
 * @param desc Product description.
 * @param price Product price.
 * @param priority Product priority.
 * @param quantity Product quantity.
 * @returns Returns the API response object.
 */
async function updateProduct(
    slug: string,
    name: string,
    categories: string,
    desc: string,
    price: number,
    priority: number,
    quantity?: number
): Promise<APIResult<UpdateProductResponseData>> {
    try {
        if (
            !slug ||
            !name ||
            (!price && price !== 0) ||
            (!priority && priority !== 0)
        )
            return new APIResult(
                `Thông tin 'slug', 'name', 'price', 'priority' bị thiếu.`,
                false,
                null,
                400
            );

        const result = await backend.put(`product`, {
            slug,
            name,
            categories,
            desc,
            price,
            quantity,
            priority,
        });
        const { message, data }: BackendResponse<UpdateProductResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Delete product.
 * @param slug Product slug.
 * @returns Returns the API response object.
 */
async function deleteProduct(
    slug: string
): Promise<APIResult<DeleteProductResponseData>> {
    try {
        if (!slug)
            return new APIResult(
                `Thông tin 'slug' bị thiếu.`,
                false,
                null,
                400
            );

        const result = await backend.delete(`product`, {
            data: {
                slug,
            },
        });
        const { message, data }: BackendResponse<DeleteProductResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Upload product image.
 * @param slug Product slug.
 * @param image Product image.
 * @returns Returns the API response object.
 */
async function uploadProductImage(
    slug: string,
    image: string | Blob
): Promise<APIResult<UploadProductImageResponseData>> {
    try {
        if (!slug || !image)
            return new APIResult(
                `Thông tin 'slug', 'image' bị thiếu.`,
                false,
                null,
                400
            );

        const form = new FormData();
        form.append('slug', slug);
        form.append('image', image);

        const result = await backend.post('product/image', form);

        const {
            message,
            data,
        }: BackendResponse<UploadProductImageResponseData> = result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Get categories.
 * @param page Pagination (default: 1)
 * @param itemPerPage Item per page. (default: 99999)
 * @returns Returns the API response object.
 */
async function getCategories(
    page: number = 1,
    itemPerPage: number = 99999
): Promise<APIResult<GetCategoriesResponseData>> {
    try {
        const result = await backend.get(
            `category?page=${page}&itemPerPage=${itemPerPage}`
        );
        const { message, data }: BackendResponse<GetCategoriesResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Get product counts from categories.
 * @returns Returns the API response object.
 */
async function getCategoriesCount(): Promise<
    APIResult<GetCategoriesCountResponseData>
> {
    try {
        const result = await backend.get(`category/categoriesCount`);
        const {
            message,
            data,
        }: BackendResponse<GetCategoriesCountResponseData> = result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Create category.
 * @param name Category name.
 * @param desc Category description.
 * @param priority Category priority.
 * @param image Category image.
 * @returns Returns the API response object.
 */
async function createCategory(
    name: string,
    desc: string,
    priority: number,
    image: string | Blob
): Promise<APIResult<CreateCategoryResponseData>> {
    try {
        if (!name || (!priority && priority !== 0))
            return new APIResult(
                `Thông tin 'name', 'priority' bị thiếu.`,
                false,
                null,
                400
            );

        const form = new FormData();
        form.append('name', name);
        form.append('desc', desc);
        form.append('priority', `${priority}`?.replace(/\D/g, ''));
        form.append('image', image);

        const result = await backend.post('category', form);

        const { message, data }: BackendResponse<CreateCategoryResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Update category.
 * @param slug Category slug.
 * @param name Category name.
 * @param desc Category description.
 * @param priority Category priority.
 * @returns Returns the API response object.
 */
async function updateCategory(
    slug: string,
    name: string,
    desc: string,
    priority: number
): Promise<APIResult<UpdateCategoryResponseData>> {
    try {
        if (!slug || !name || (!priority && priority !== 0))
            return new APIResult(
                `Thông tin 'slug', 'name', 'priority' bị thiếu.`,
                false,
                null,
                400
            );

        const result = await backend.put(`category`, {
            slug,
            name,
            desc,
            priority,
        });
        const { message, data }: BackendResponse<UpdateCategoryResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Delete category.
 * @param slug Category slug.
 * @returns Returns the API response object.
 */
async function deleteCategory(
    slug: string
): Promise<APIResult<DeleteCategoryResponseData>> {
    try {
        if (!slug)
            return new APIResult(
                `Thông tin 'slug' bị thiếu.`,
                false,
                null,
                400
            );

        const result = await backend.delete(`category`, {
            data: {
                slug,
            },
        });
        const { message, data }: BackendResponse<DeleteCategoryResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Upload category image.
 * @param slug Category slug.
 * @param image Category image.
 * @returns Returns the API response object.
 */
async function uploadCategoryImage(
    slug: string,
    image: string | Blob
): Promise<APIResult<UploadCategoryImageResponseData>> {
    try {
        if (!slug || !image)
            return new APIResult(
                `Thông tin 'slug', 'image' bị thiếu.`,
                false,
                null,
                400
            );

        const form = new FormData();
        form.append('slug', slug);
        form.append('image', image);

        const result = await backend.post('category/image', form);

        const {
            message,
            data,
        }: BackendResponse<UploadCategoryImageResponseData> = result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Get orders.
 * @param page Pagination (default: 1)
 * @param itemPerPage Item per page. (default: 99999)
 * @returns Returns the API response object.
 */
async function getOrders(
    page: number = 1,
    itemPerPage: number = 99999
): Promise<APIResult<GetOrdersResponseData>> {
    try {
        const result = await backend.get(
            `order?page=${page}&itemPerPage=${itemPerPage}`
        );
        const { message, data }: BackendResponse<GetOrdersResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Create order.
 * @param deliveryMethod Delivery method.
 * @param customerName Customer name.
 * @param customerPhoneNumber Customer phone number.
 * @param items Order items.
 * @param deliveryAddress Delivery address.
 * @param deliveryTime Delivery time.
 * @param pickupAt Pickup location.
 * @param deliveryNote Delivery note.
 * @returns Returns the API response object.
 */
async function createOrder(
    deliveryMethod: string,
    customerName: string,
    customerPhoneNumber: string,
    items: unknown,
    deliveryAddress?: string,
    deliveryTime?: number,
    pickupAt?: string,
    deliveryNote?: string
): Promise<APIResult<CreateOrderResponseData>> {
    try {
        if (!deliveryMethod || !customerName || !customerPhoneNumber || !items)
            return new APIResult(
                `Thông tin 'deliveryMethod', 'customerName', 'customerPhoneNumber', 'items' bị thiếu.`,
                false,
                null,
                400
            );

        if (deliveryMethod !== 'shipping' && deliveryMethod !== 'pickup')
            return new APIResult(
                `Phương thức thanh toán phải là 'shipping' hoặc 'pickup'.`,
                false,
                null,
                400
            );

        if (deliveryMethod === 'shipping' && !deliveryAddress)
            return new APIResult(
                `Thông tin 'deliveryAddress' bị thiếu.`,
                false,
                null,
                400
            );

        if (deliveryMethod === 'pickup' && !pickupAt)
            return new APIResult(
                `Thông tin 'pickupAt' bị thiếu.`,
                false,
                null,
                400
            );

        const result = await backend.post('order', {
            deliveryMethod,
            customerName,
            customerPhoneNumber,
            items,
            deliveryAddress,
            deliveryTime,
            pickupAt,
            deliveryNote,
        });

        const { message, data }: BackendResponse<CreateOrderResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Update order.
 * @param orderId Order id.
 * @param status Order status.
 * @returns Returns the API response object.
 */
async function updateOrder(
    orderId: number,
    status?:
        | 'processing'
        | 'shipping'
        | 'completed'
        | 'refunding'
        | 'aborted'
        | 'refunded'
): Promise<APIResult<UpdateOrderResponseData>> {
    try {
        if (!orderId)
            return new APIResult(
                `Thông tin 'orderId' bị thiếu.`,
                false,
                null,
                400
            );

        if (status) {
            if (
                status !== 'processing' &&
                status !== 'shipping' &&
                status !== 'completed' &&
                status !== 'refunding' &&
                status !== 'aborted' &&
                status !== 'refunded'
            )
                return new APIResult(
                    'Trạng thái đơn hàng không hợp lệ',
                    false,
                    null,
                    400
                );
        }

        const result = await backend.patch('order', {
            orderId,
            status,
        });

        const { message, data }: BackendResponse<UpdateOrderResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Delete order.
 * @param orderId Order id.
 * @returns Returns the API response object.
 */
async function deleteOrder(
    orderId: number
): Promise<APIResult<DeleteOrderResponseData>> {
    try {
        if (!orderId)
            return new APIResult(
                `Thông tin 'orderId' bị thiếu.`,
                false,
                null,
                400
            );

        const result = await backend.delete(`order`, {
            data: {
                orderId,
            },
        });
        const { message, data }: BackendResponse<DeleteOrderResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Restore order product quantity.
 * @param orderId Order id.
 * @returns Returns the API response object.
 */
async function restoreOrderProductQuantity(
    orderId: number
): Promise<APIResult<RestoreProductQuantityResponseData>> {
    try {
        if (!orderId)
            return new APIResult(
                `Thông tin 'orderId' bị thiếu.`,
                false,
                null,
                400
            );

        const result = await backend.post('order/restore-product-quantity', {
            orderId,
        });

        const {
            message,
            data,
        }: BackendResponse<RestoreProductQuantityResponseData> = result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Send a subscrible newsletter confirmation mail.
 * @param email The email.
 * @returns Returns the API response object.
 */
async function subscribeNewsletter(
    email: string
): Promise<APIResult<SubscribeNewsletterResponseData>> {
    try {
        if (!email)
            return new APIResult(
                `Thông tin 'email' bị thiếu.`,
                false,
                null,
                400
            );

        const result = await backend.post('newsletter/subscribe', {
            email,
        });

        const {
            message,
            data,
        }: BackendResponse<SubscribeNewsletterResponseData> = result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

/**
 * Confirm a newsletter subscribe request.
 * @param newsletterToken The subscribe newsletter token.
 * @returns Returns the API response object.
 */
async function subscribeNewsletterConfirmation(
    newsletterToken: string
): Promise<APIResult<SubscribeNewsletterConfirmationResponseData>> {
    try {
        if (!newsletterToken)
            return new APIResult(
                `Thông tin 'newsletterToken' bị thiếu.`,
                false,
                null,
                400
            );

        const result = await backend.post('newsletter/confirm', {
            newsletterToken,
        });

        const {
            message,
            data,
        }: BackendResponse<SubscribeNewsletterConfirmationResponseData> =
            result.data;

        return new APIResult(message, true, data, result.status);
    } catch (error) {
        if (error.response) {
            return new APIResult(
                error.response.data.message,
                false,
                error,
                error.response.status
            );
        } else {
            console.error(error);
            return new APIResult(texts.unknownError, false, error, null);
        }
    }
}

export {
    register,
    authorize,
    deauthorize,
    verifySession,
    refreshTokens,
    forgotPassword,
    resetPassword,
    uploadUserAvatar,
    getUserInfo,
    updateUserInfo,
    updateEmailAddress,
    updatePassword,
    deleteUser,
    getUsersAsAdmin,
    createUserAsAdmin,
    updateUserAsAdmin,
    deleteUserAsAdmin,
    uploadUserAvatarAsAdmin,
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    getCategories,
    getCategoriesCount,
    createCategory,
    updateCategory,
    deleteCategory,
    uploadCategoryImage,
    getOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    restoreOrderProductQuantity,
    subscribeNewsletter,
    subscribeNewsletterConfirmation,
};
