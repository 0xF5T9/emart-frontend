/**
 * @file api.ts
 * @description Utility classes and functions used by API module.
 */

'use strict';

/**
 * Processed API call result.
 */
class APIResult<DataType> {
    message: string;
    success: boolean;
    data: DataType;
    invalidToken: boolean;
    statusCode: number;

    /**
     * Constructs a API result object.
     * @param message Response message.
     * @param success Specifies whether the action is successful.
     * @param data Response associated data.
     * @param status Response status code.
     */
    constructor(
        message: string,
        success: boolean,
        data: DataType,
        status: number | null
    ) {
        this.message = message;
        this.success = success;
        this.data = data;
        this.invalidToken = status === 401 || status === 403;
        this.statusCode = status;
    }
}

export { APIResult };
