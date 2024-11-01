/**
 * @file context-menu.ts
 * @description Context menu types.
 */

import { FunctionComponent } from 'react';

export type ContextMenuItem = {
    title: string;
    desc?: string;
    icon?: {
        icon: FunctionComponent<any> | string;
        width?: string;
        height?: string;
    };
    image?: { url: string; alt?: string; width?: string; height?: string };
    to?: string;
    className?: string;
    onClick?: React.DetailedHTMLProps<
        React.LiHTMLAttributes<HTMLLIElement>,
        HTMLLIElement
    >['onClick'];
    hideOnClick?: boolean;
    action?: 'logout';
    gotoMenu?: string;
    adminOnly?: boolean;
};

export type ContextMenu = {
    id: string;
    menu: ContextMenuItem[];
};
