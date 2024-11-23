/**
 * @file index.tsx
 * @description Rich text editor sub-components.
 * @todo Rework the component.
 */

import React, { Ref, PropsWithChildren } from 'react';
import { cx, css } from '@emotion/css';

interface BaseProps {
    className: string;
    [key: string]: unknown;
}
type OrNull<T> = T | null;

export const EditorButton = React.forwardRef(
    (
        {
            className,
            active,
            reversed,
            ...props
        }: PropsWithChildren<
            {
                active: boolean;
                reversed: boolean;
            } & BaseProps
        >,
        ref: Ref<OrNull<HTMLSpanElement>>
    ) => (
        <span
            {...props}
            ref={ref}
            className={cx(
                className,
                css`
                    cursor: pointer;
                    color: ${reversed
                        ? active
                            ? 'white'
                            : '#aaa'
                        : active
                          ? 'black'
                          : '#ccc'};
                `
            )}
        />
    )
);

export const EditorValue = React.forwardRef(
    (
        {
            className,
            value,
            ...props
        }: PropsWithChildren<
            {
                value: any;
            } & BaseProps
        >,
        ref: Ref<OrNull<null>>
    ) => {
        const textLines = value.document.nodes
            .map((node: any) => node.text)
            .toArray()
            .join('\n');
        return (
            <div
                ref={ref}
                {...props}
                className={cx(
                    className,
                    css`
                        margin: 30px -20px 0;
                    `
                )}
            >
                <div
                    className={css`
                        font-size: 14px;
                        padding: 5px 20px;
                        color: #404040;
                        border-top: 2px solid #eeeeee;
                        background: #f8f8f8;
                    `}
                >
                    Slate's value as text
                </div>
                <div
                    className={css`
                        color: #404040;
                        font: 12px monospace;
                        white-space: pre-wrap;
                        padding: 10px 20px;
                        div {
                            margin: 0 0 0.5em;
                        }
                    `}
                >
                    {textLines}
                </div>
            </div>
        );
    }
);

export const EditorIcon = React.forwardRef(
    (
        { className, ...props }: PropsWithChildren<BaseProps>,
        ref: Ref<OrNull<HTMLSpanElement>>
    ) => (
        <span
            {...props}
            ref={ref}
            className={cx(
                'material-icons',
                className,
                css`
                    font-size: 18px;
                    vertical-align: text-bottom;
                `
            )}
        />
    )
);

export const Menu = React.forwardRef(
    (
        { className, ...props }: PropsWithChildren<BaseProps>,
        ref: Ref<OrNull<HTMLDivElement>>
    ) => (
        <div
            {...props}
            data-test-id="menu"
            ref={ref}
            className={cx(
                className,
                css`
                    & > * {
                        display: inline-block;
                    }

                    & > * + * {
                        margin-left: 15px;
                    }
                `
            )}
        />
    )
);

export const EditorToolbar = React.forwardRef(
    (
        { className, ...props }: PropsWithChildren<BaseProps>,
        ref: Ref<OrNull<HTMLDivElement>>
    ) => (
        <Menu
            {...props}
            ref={ref}
            className={cx(
                className,
                css`
                    position: relative;
                    padding: 1px 18px 17px;
                    margin: 0 0;
                    border-bottom: 2px solid #eee;
                    margin-bottom: 20px;
                `
            )}
        />
    )
);
