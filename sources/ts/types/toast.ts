/**
 * @file toast.ts
 * @description Toast related types.
 */

export type ToastOption = {
    variant: string;
    title: string;
    message: string;
    icon?: string;
    duration?: number;
    animationDuration?: { fadeIn: number; fadeOut: number };
};

export type ToastMap =
    | ({ variant: 'primary' } & ToastOption)
    | ({ variant: 'success' } & ToastOption)
    | ({ variant: 'danger' } & ToastOption)
    | ({ variant: 'warn' } & ToastOption)
    | ({ variant: 'message' } & ToastOption)
    | ({ variant: 'info' } & ToastOption);
