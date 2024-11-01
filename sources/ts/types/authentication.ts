/**
 * @file authentication.ts
 * @description Authentication related types.
 */

export type SessionData = {
    username: string;
    email: string;
    role: string;
    avatarFileName: string;
};

export type SessionLogin = (sessionData: SessionData) => Promise<void>;

export type SessionLogout = (route?: string) => Promise<void>;

export type SessionGetSessionData = () => Promise<SessionData>;

export type SessionRefreshSessionData = () => Promise<SessionData>;

export type AuthHook = {
    sessionData?: SessionData;
    getSessionData?: SessionRefreshSessionData;
    refreshSessionData?: SessionRefreshSessionData;
    login?: SessionLogin;
    logout?: SessionLogout;
};
