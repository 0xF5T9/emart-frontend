/**
 * @file modal.ts
 * @description Modal related types.
 */

import { FunctionComponent } from 'react';

export type AlertModal = {
    type: 'alert';
    className?: string;
    variant?: 'success' | 'danger' | 'warn' | 'info';
    icon?: FunctionComponent<any>;
    iconColor?: string;
    iconWidth?: string;
    title?: string;
    message?: string | JSX.Element;
    closeButtonText?: string;
    closeButtonVariant?:
        | 'primary'
        | 'success'
        | 'danger'
        | 'warn'
        | 'info'
        | 'gray'
        | 'white';
    removeDefaultCloseButton?: boolean;
    makeCloseButtonDefault?: boolean;
    customButton?: JSX.Element;
    onClose?: (...args: any[]) => void;
};

export type CustomModal = {
    type: 'custom';
    content: JSX.Element;
    className?: string;
    onClose?: (...args: any[]) => void;
};

export type Modal =
    | (AlertModal & {
          preventCloseOnBackgroundClick?: boolean;
          preventCloseOnEscapeKeyPress?: boolean;
      })
    | (CustomModal & {
          preventCloseOnBackgroundClick?: boolean;
          preventCloseOnEscapeKeyPress?: boolean;
      })
    | null;

export type ModalHook = {
    modal: Modal;
    setModal: React.Dispatch<React.SetStateAction<Modal>>;
    modalVisibility: boolean;
    setModalVisibility: React.Dispatch<React.SetStateAction<boolean>>;
};
