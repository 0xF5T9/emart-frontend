/**
 * @file admin-section-aside-item.ts
 * @description Admin section aside item types.
 */

export type AdminAsideItem = {
    text: string;
    icon: string;
    to?: string;
    onClick?: React.DetailedHTMLProps<
        React.LiHTMLAttributes<HTMLLIElement>,
        HTMLLIElement
    >['onClick'];
    action?: 'logout';
};
