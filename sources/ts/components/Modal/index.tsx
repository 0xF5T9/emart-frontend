/**
 * @file index.tsx
 * @description Modal.
 */

'use strict';
import type { AlertModal, CustomModal } from '@sources/ts/types/modal';
import { FunctionComponent, CSSProperties, useEffect, useRef } from 'react';

import { useModal } from '@sources/ts/hooks/useModal';
import { CircleExclamation } from '@sources/ts/components/Icons/CircleExclamation';
import { CircleInfo } from '@sources/ts/components/Icons/CircleInfo';
import { CircleCheck } from '@sources/ts/components/Icons/CircleCheck';
import Button from '@sources/ts/components/Button';
import * as styles from './Modal.module.css';

/**
 * Modal overlay.
 * @returns Returns the component.
 */
const ModalOverlay: FunctionComponent = function () {
    const { modal, setModal, modalVisibility } = useModal();

    const modalOverlay = useRef<HTMLDivElement>(),
        modalWindow = useRef<HTMLDivElement>(),
        isClosing = useRef<Boolean>(false);

    function closeModal() {
        isClosing.current = true;

        // Trigger modal window close animation animation.
        modalWindow?.current?.classList?.add('is-close');

        // Improvise: For chrome version less than 127, animation events and :has css pseudo are not supported.
        if (
            !!!getComputedStyle(modalOverlay?.current).animation.includes(
                styles['modal-overlay-fade-out'] // It should be fade-out if :has is supported.
            )
        ) {
            modalOverlay?.current?.classList.add('is-close');
            setTimeout(
                () => {
                    if (modal.onClose) modal.onClose();
                    if (!isClosing.current) return;
                    modalOverlay?.current?.classList.remove('is-close');

                    setModal(null);
                },
                parseFloat(
                    getComputedStyle(
                        modalOverlay?.current
                    ).animationDuration.replace('s', '')
                ) *
                    1000 +
                    100
            );
        }
    }

    // Actually destroy the modal element on the animation end.
    useEffect(() => {
        function handleModalOverlayCloseAnimationEnd(event: AnimationEvent) {
            if (!isClosing.current) return;

            if (
                event.target === event.currentTarget &&
                event.animationName === styles['modal-overlay-fade-out']
            ) {
                if (modal.onClose) modal.onClose();
                setModal(null);
            }
        }

        modalOverlay?.current?.addEventListener(
            'animationend',
            handleModalOverlayCloseAnimationEnd
        );

        return () => {
            modalOverlay?.current?.removeEventListener(
                'animationend',
                handleModalOverlayCloseAnimationEnd
            );
        };
    }, [modal]);

    useEffect(() => {
        if (!!modal) isClosing.current = false;

        // Close modal on escape key press.
        function handleKeyDown(event: any) {
            if (
                modal &&
                event.keyCode === 27 &&
                !modal.preventCloseOnEscapeKeyPress
            )
                closeModal();
        }
        window.addEventListener('keydown', handleKeyDown);

        // Set focus for default button.
        setTimeout(() => {
            (
                modalWindow?.current?.querySelector(
                    'button.default'
                ) as HTMLButtonElement
            )?.focus();
        }, 50);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [modal]);

    // Close the modal programmatically.
    useEffect(() => {
        if (!modalVisibility && modal) closeModal();
    }, [modalVisibility]);

    let Modal: JSX.Element = null;
    switch (modal?.type) {
        case 'alert':
            const alertModal: AlertModal = modal;

            let Icon = alertModal?.icon;
            if (!Icon) {
                switch (alertModal.variant) {
                    case 'success':
                        Icon = CircleCheck;
                        break;
                    case 'danger':
                        Icon = CircleExclamation;
                        break;
                    case 'warn':
                        Icon = CircleExclamation;
                        break;
                    case 'info':
                        Icon = CircleInfo;
                        break;
                }
            }

            let iconStyle: CSSProperties = {};
            if (alertModal?.iconColor) iconStyle.color = alertModal.iconColor;
            if (alertModal?.iconWidth) iconStyle.width = alertModal.iconWidth;

            let closeButtonVariant = alertModal?.closeButtonVariant,
                closeButtonText = alertModal?.closeButtonText || 'Close';
            if (!closeButtonVariant) {
                switch (alertModal.variant) {
                    case 'success':
                        closeButtonVariant = 'success';
                        break;
                    case 'danger':
                        closeButtonVariant = 'danger';
                        break;
                    case 'warn':
                        closeButtonVariant = 'warn';
                        break;
                    case 'info':
                        closeButtonVariant = 'info';
                        break;
                }
            }

            Modal = (
                <div
                    ref={modalWindow}
                    onClick={(event) => event.stopPropagation()}
                    onMouseUp={(event) => event.stopPropagation()}
                    className={`${styles['modal-window']} ${styles['alert-modal-window']} ${alertModal?.className || ''} ${styles[alertModal.variant] || ''}`}
                >
                    {Icon && (
                        <Icon className={styles['icon']} style={iconStyle} />
                    )}
                    {alertModal?.title && (
                        <span className={styles['title']}>
                            {alertModal.title}
                        </span>
                    )}
                    {(alertModal?.message &&
                        typeof alertModal.message === 'string' && (
                            <span className={styles['message']}>
                                {alertModal.message}
                            </span>
                        )) ||
                        (alertModal?.message && (
                            <div className={styles['message']}>
                                {alertModal?.message}
                            </div>
                        ))}
                    <div className={styles['button-block']}>
                        {!alertModal.removeDefaultCloseButton && (
                            <Button
                                className={`${alertModal.makeCloseButtonDefault ? 'default' : ''}`}
                                color={closeButtonVariant}
                                onClick={() => closeModal()}
                            >
                                {closeButtonText}
                            </Button>
                        )}
                        {alertModal.customButton}
                    </div>
                </div>
            );
            break;
        case 'custom':
            const customModal: CustomModal = modal;
            Modal = (
                <div
                    ref={modalWindow}
                    onClick={(event) => event.stopPropagation()}
                    onMouseUp={(event) => event.stopPropagation()}
                    className={`${styles['modal-window']} ${customModal?.className || ''}`}
                >
                    {customModal.content}
                </div>
            );
            break;
    }

    return (
        <div
            ref={modalOverlay}
            className={styles['modal-overlay']}
            onMouseUp={
                modal?.preventCloseOnBackgroundClick
                    ? undefined
                    : () => closeModal()
            }
        >
            {Modal}
        </div>
    );
};

export { ModalOverlay };
