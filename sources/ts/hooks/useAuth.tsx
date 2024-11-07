/**
 * @file useAuth.tsx
 * @description Authentication hook.
 */

'use strict';
import type {
    SessionData,
    SessionGetSessionData,
    SessionRefreshSessionData,
    SessionLogin,
    SessionLogout,
    AuthHook,
} from '@sources/ts/types/authentication';
import {
    FunctionComponent,
    ReactNode,
    useContext,
    useMemo,
    createContext,
} from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

import { useLocalStorage } from './useLocalStorage';
import { showToast } from '@sources/ts/components/Toast';
import apis from '@sources/ts/apis';
import routes from '@sources/ts/global/react-router/routes';
import staticTexts from '@sources/ts/render/static-texts';

// Authentication context.
const authContext = createContext(null);

/**
 * Authentication context provider component.
 * @param props Component properties.
 * @param props.children Context children.
 * @returns Returns the component.
 */
const AuthProvider: FunctionComponent<{ children: ReactNode }> = function ({
    children,
}) {
    const [sessionData, setSessionData] = useLocalStorage('sessionData', null),
        navigate = useNavigate();

    const login: SessionLogin = async (sessionData: SessionData) => {
        if (!sessionData) {
            console.error('Invalid session data.');
            await apis.backend.deauthorize();
            navigate(routes.home);
            return;
        }

        let invalidSessionData = false;
        Object.keys(sessionData)?.forEach((key) => {
            if (key === 'avatarFileName') return;

            if (!sessionData[key as keyof SessionData]) {
                invalidSessionData = true;
                return;
            }
        });
        if (invalidSessionData) {
            console.error('Invalid session data.');
            setSessionData(null);
            await apis.backend.deauthorize();
            navigate(routes.home);
            return;
        }

        setSessionData(sessionData);
        navigate(routes.profile);
    };

    const logout: SessionLogout = async (route?: string) => {
        setSessionData(null);
        await apis.backend.deauthorize();
        navigate(route || routes.home, { replace: true });
    };

    const getSessionData: SessionGetSessionData = async () => {
        const verifySessionResult = await apis.backend.verifySession(false);
        if (!verifySessionResult.success) {
            console.error('Phiên đăng nhập hết hạn.');
            setTimeout(
                () =>
                    showToast({
                        variant: 'danger',
                        title: staticTexts.toast.errorDefaultTitle,
                        message: 'Phiên đăng nhập hết hạn.',
                        duration: 5000,
                    }),
                100
            );
            setSessionData(null);
            navigate(routes.home, { replace: true });
            return null;
        }

        setSessionData(verifySessionResult.data);
        return verifySessionResult.data;
    };

    const refreshSessionData: SessionRefreshSessionData = async () => {
        const verifySessionResult = await apis.backend.verifySession(true);
        if (!verifySessionResult.success) {
            console.error('Phiên đăng nhập hết hạn.');
            setTimeout(
                () =>
                    showToast({
                        variant: 'danger',
                        title: staticTexts.toast.errorDefaultTitle,
                        message: 'Phiên đăng nhập hết hạn.',
                        duration: 5000,
                    }),
                100
            );
            setSessionData(null);
            navigate(routes.home, { replace: true });
            return null;
        }

        setSessionData(verifySessionResult.data);
        return verifySessionResult.data;
    };

    const value: AuthHook = useMemo(
        () => ({
            sessionData,
            getSessionData,
            refreshSessionData,
            login,
            logout,
        }),
        [sessionData]
    );
    return (
        <authContext.Provider value={value}>{children}</authContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node,
};

/**
 * Hook provides a convenient way to access and manage user
 * authentication status from application components.
 * @returns sessionData, login, logout
 */
function useAuth(): AuthHook {
    return useContext(authContext);
}

/**
 * Get the authentication session data directly from the local storage.
 * Use this when we can't use the `useAuth()` hook, such as outside a component function.
 * @returns Returns the authentication session data.
 */
function getSessionData(): SessionData | null {
    try {
        const value = window.localStorage.getItem('sessionData');
        if (!value) return null;
        const parsedValue = JSON.parse(value);
        return parsedValue;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export { useAuth, AuthProvider, getSessionData };
