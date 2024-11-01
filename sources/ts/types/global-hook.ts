/**
 * @file global-hook.ts
 * @description Global hook types.
 */

export type GlobalHook = {
    theme: string;
    setTheme: React.Dispatch<React.SetStateAction<string>>;
    deviceInfo: {
        type: 'desktop' | 'tablet' | 'mobile';
        screenWidth: number;
        screenHeight: number;
    };
    setAllowScrolling: React.Dispatch<React.SetStateAction<boolean>>;
};
