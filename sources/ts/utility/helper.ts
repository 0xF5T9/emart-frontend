/**
 * @file helper.ts
 * @description Helper module.
 * @note Populate a 'helper' object to the browser window object upon import.
 */

'use strict';

declare global {
    interface Window {
        myHelper: {
            parseJSON: (jsonString: string) => object | boolean;
            convertVNDStringToNumber: (string: string) => number;
            convertVNDNumberToString: (number: number) => string;
        };
    }
}

(() => {
    window.myHelper = {
        /**
         * Parse a JSON string into object.
         * @param jsonString JSON string.
         * @returns Returns the parsed JSON object if the string
         *          is a valid JSON string, otherwise returns false.
         */
        parseJSON(jsonString: string): object | boolean {
            try {
                return JSON.parse(jsonString);
            } catch (error) {
                return false;
            }
        },
        /**
         * Converts a string representation of Vietnamese Dong (VND) to a number. (₫1.234.567 = 1234567)
         * @param string The string.
         * @returns Returns the numeric value of the amount in VND.
         */
        convertVNDStringToNumber(string: string): number {
            return parseInt(string.replace('₫', '').replace('.', ''));
        },
        /**
         * Converts a numeric value representing Vietnamese Dong (VND) to a formatted string.
         * @param number The number.
         * @returns Returns the formatted string representation of the amount in VND.
         */
        convertVNDNumberToString(number: number): string {
            return `${number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} ₫`;
        },
    };
})();
