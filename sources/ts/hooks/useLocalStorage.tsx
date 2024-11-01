/**
 * @file useLocalStorage.tsx
 * @description Local storage hook.
 */

'use strict';
import { useState } from 'react';

/**
 * Hook provides a convenient way to access and-
 * manage data from browser local storage.
 * @param key Item key name.
 * @param initValue Initial value for the item. (If the item doesn't exist)
 * @returns Returns a tuple containing the stored value and a function to update the value.
 */
function useLocalStorage(key: string, initValue: string) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const value = window.localStorage.getItem(key);
            if (value) {
                return JSON.parse(value);
            } else {
                window.localStorage.setItem(key, JSON.stringify(initValue));
                return initValue;
            }
        } catch (error) {
            console.error(error);
            return initValue;
        }
    });

    function setValue(newValue: any) {
        try {
            window.localStorage.setItem(key, JSON.stringify(newValue));
        } catch (error) {
            console.log(error);
        }
        setStoredValue(newValue);
    }

    return [storedValue, setValue];
}

export { useLocalStorage };
