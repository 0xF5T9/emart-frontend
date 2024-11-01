/**
 * @file index.tsx
 * @description Popup window. (<Tippy /> wrapper)
 */

'use strict';
import { DetailedHTMLProps, FunctionComponent, HTMLAttributes } from 'react';
import Tippy, { TippyProps } from '@tippyjs/react/headless';
import PropTypes from 'prop-types';

import * as styles from './PopupWindow.module.css';

/**
 * Popup render wrapper.
 * @param props Component properties.
 * @param props.className Class names.
 * @param props.children Component children.
 * @returns Returns the component.
 */
const PopupRender: FunctionComponent<
    DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        className?: string;
        [prop: string]: any;
    }
> = function ({ className, children, ...divProps }) {
    const classes = `${styles['popup-window']} ${className || ''}`;
    return (
        <div className={classes} {...divProps}>
            {children}
        </div>
    );
};

PopupRender.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node,
};

/**
 * Popup window. (Tippy wrapper)
 * @param props Component properties.
 * @param props.content Popup content.
 * @param props.customAnimation Animation object.
 * @param props.disableAnimation Disable animations.
 * @note This component is a <Tippy /> component wrapper.
 *       If rendering content with tippy 'render' prop, the content must be wrapped inside <PopupRender />
 * @returns Returns the component.
 */
const PopupWindow: FunctionComponent<
    TippyProps & {
        onMount?: (instance: any) => void;
        onHide?: (instance: any) => void;
        content?: React.ReactNode;
        customAnimation?: {
            classIn: string;
            classOut: string;
            outAnimationName: string;
        };
        disableAnimation?: boolean;
        [key: string]: any;
    }
> = function ({
    onMount,
    onHide,
    content,
    customAnimation,
    disableAnimation = false,
    children,
    ...tippyProps
}) {
    function onPopupMount(instance: any) {
        const popup = instance.popper.firstElementChild;
        requestAnimationFrame(() => {
            if (customAnimation) {
                popup?.classList?.remove(customAnimation.classOut);
                popup?.classList?.add(customAnimation.classIn);
            } else {
                popup?.classList?.remove(styles['animation-out']);
                popup?.classList?.add(styles['animation-in']);
            }
        });

        if (onMount) onMount(instance);
    }

    function onPopupHide(instance: any) {
        const popup = instance.popper.firstElementChild;
        requestAnimationFrame(() => {
            if (customAnimation) {
                popup?.classList?.remove(customAnimation.classIn);
                popup?.classList?.add(customAnimation.classOut);
            } else {
                popup?.classList?.remove(styles['animation-in']);
                popup?.classList?.add(styles['animation-out']);
            }
        });

        function handleAnimationEnd(event: any) {
            if (customAnimation) {
                if (event.animationName === customAnimation.outAnimationName) {
                    popup.removeEventListener(
                        'animationend',
                        handleAnimationEnd
                    );
                    instance.unmount();
                }
            } else {
                if (event.animationName === styles['popup-out']) {
                    popup.removeEventListener(
                        'animationend',
                        handleAnimationEnd
                    );
                    instance.unmount();
                }
            }
        }
        popup?.addEventListener('animationend', handleAnimationEnd);

        if (onHide) onHide(instance);
    }

    return (
        <Tippy
            animation={disableAnimation ? undefined : true}
            onMount={disableAnimation ? undefined : onPopupMount}
            onHide={disableAnimation ? undefined : onPopupHide}
            render={
                content ? () => <PopupRender>{content}</PopupRender> : undefined
            }
            {...tippyProps}
        >
            {children}
        </Tippy>
    );
};

PopupWindow.propTypes = {
    onMount: PropTypes.func,
    onHide: PropTypes.func,
    content: PropTypes.node,
    customAnimation: PropTypes.exact({
        classIn: PropTypes.string,
        classOut: PropTypes.string,
        outAnimationName: PropTypes.string,
    }),
    disableAnimation: PropTypes.bool,
};

export default PopupWindow;
export { PopupRender };
