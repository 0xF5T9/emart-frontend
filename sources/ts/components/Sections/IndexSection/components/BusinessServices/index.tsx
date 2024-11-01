/**
 * @file index.tsx
 * @desc Business services.
 */

'use strict';
import { FunctionComponent } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import * as styles from './BusinessServices.module.css';
import businessServiceItems from '@sources/ts/render/business-service-items';

export type BusinessServiceItem = {
    title: string;
    text: string;
    icon: string;
};

/**
 * Business service item.
 * @param props Component properties.
 * @param props.title Title.
 * @param props.text Text.
 * @param props.icon Icon.
 * @returns Returns the component.
 */
const BusinessServiceItem: FunctionComponent<BusinessServiceItem> = ({
    title,
    text,
    icon,
}) => {
    return (
        <li className={styles['service-item']}>
            <i className={classNames(styles['service-item-icon'], icon)} />
            <div className={styles['service-item-content']}>
                <span className={styles['service-item-heading']}>{title}</span>
                <span className={styles['service-item-desc']}>{text}</span>
            </div>
        </li>
    );
};

BusinessServiceItem.propTypes = {
    title: PropTypes.string,
    text: PropTypes.string,
    icon: PropTypes.string,
};

/**
 * Business services.
 * @param props Component properties.
 * @returns Returns the component.
 */
const BusinessServices: FunctionComponent = () => {
    return (
        <ul className={styles['service-list']}>
            {businessServiceItems?.map((item, index) => (
                <BusinessServiceItem
                    key={index}
                    title={item.title}
                    text={item.text}
                    icon={item.icon}
                />
            ))}
        </ul>
    );
};

export default BusinessServices;
