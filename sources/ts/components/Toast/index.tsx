/**
 * @file index.tsx
 * @description Toast.
 */

'use strict';
import type { ToastOption, ToastMap } from '@sources/ts/types/toast';
import { FunctionComponent } from 'react';
import * as styles from './Toast.module.css';
const $ = document.querySelector.bind(document);

class CToastOption implements ToastOption {
    variant: string = '';
    title: string = '';
    message: string = '';
    icon?: string = '';
    duration?: number = 3000;
    animationDuration?: { fadeIn: number; fadeOut: number } = {
        fadeIn: 300,
        fadeOut: 300,
    };

    constructor(options: ToastOption) {
        const validOptions: ToastOption & { [key: string]: any } = {
            ...options,
        };
        Object.keys(validOptions)
            .filter((key) => !(key in this))
            .forEach((key) => {
                delete validOptions[key];
            });
        Object.assign(this, validOptions);

        if (!this.icon) {
            switch (validOptions.variant) {
                case 'success':
                    this.icon = 'fa-solid fa-circle-check';
                    break;
                case 'danger':
                    this.icon = 'fa-solid fa-circle-exclamation';
                    break;
                case 'warn':
                    this.icon = 'fa-solid fa-circle-exclamation';
                    break;
                case 'message':
                    this.icon = 'fa-solid fa-message';
                    break;
                case 'info':
                    this.icon = 'fa-solid fa-circle-info';
                    break;
                default:
                    this.icon = 'fa-solid fa-circle-info';
            }
        }
    }
}

/**
 * Show a toast notification.
 * @param type Toast type.
 * @param options Toast options.
 */
function showToast(toast: ToastMap): void {
    const toastOverlay = $(`.${styles['toast-overlay'] || ''}`);
    if (!toastOverlay) {
        console.error('Toast overlay not found.');
        return;
    }

    const toastOptions = new CToastOption(toast);

    const fadeinDurationFloat = (
            toastOptions.animationDuration.fadeIn / 1000
        ).toFixed(2),
        fadeoutDurationFloat = (
            toastOptions.animationDuration.fadeOut / 1000
        ).toFixed(2),
        fadeOutDelayDuration = (
            toastOptions.animationDuration.fadeIn / 1000 +
            toastOptions.duration / 1000
        ).toFixed(2);

    const toastElement = document.createElement(`div`);
    toastElement.classList.add(styles['toast']);
    toastElement.classList.add(styles[`toast-${toastOptions.variant}`]);

    toastElement.style.animation = `${styles['toast-fade-in']} ${fadeinDurationFloat}s ease, ${styles['toast-fade-out']} ${fadeoutDurationFloat}s linear ${fadeOutDelayDuration}s forwards`;
    toastElement.innerHTML = `
            <div class="${styles['toast-icon']}"><i class="${toastOptions.icon}"></i></div>
            <div class="${styles['toast-message']}">
                <p class="${styles['toast-title']}">${toastOptions.title}</p>
                <p class="${styles['toast-desc']}">${toastOptions.message}</p>
            </div>
            <div class="${styles['toast-close']}"><i class="fa-solid fa-xmark"></i></div>
            `;

    toastElement.onanimationend = (event: any) => {
        if (event.animationName === styles['toast-fade-out'])
            toastElement.remove();
    };

    toastElement.onclick = function (event: any) {
        if (event.target.closest(`.${styles['toast-close']}`)) {
            toastElement.remove();
        }
    };

    toastOverlay.append(toastElement);
}

/**
 * Toast overlay component.
 * @returns Returns the component.
 */
const ToastOverlay: FunctionComponent = function () {
    return <div className={styles['toast-overlay']}></div>;
};

export { ToastOverlay, showToast };
