/**
 * @file index.tsx
 * @description Grid section component.
 */

'use strict';
import { FunctionComponent, CSSProperties, ReactNode } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { Row, Column } from '@sources/ts/components/GridSystem';
import * as styles from './GridSection.module.css';

/**
 * Grid section component.
 * @param props Component properties.
 * @param props.type Section type. (Determine section height behavior)
 * @param props.wide Specfies whether to use wide grid.
 * @param props.height Specifies section fixed height. (For section with 'fixed' type only)
 * @param props.noAnimation Disable section initial animation.
 * @param props.style Section style.
 * @param props.children Component children.
 * @param props.sectionProps Section element properties.
 * @returns Returns the component.
 */
const GridSection: FunctionComponent<{
    type: 'dynamic' | 'fixed' | 'fit';
    wide?: boolean;
    height?: number;
    noAnimation?: boolean;
    style?: CSSProperties;
    children?: ReactNode;
    sectionProps?: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
    >;
}> = function ({
    type = 'fit',
    wide = false,
    height,
    noAnimation = false,
    style,
    children,
    sectionProps,
}) {
    let sectionStyle = { ...style };

    const typeClassName =
        type === 'dynamic' || type === 'fixed'
            ? classNames(styles['dynamic-height'])
            : '';
    if (type === 'fixed') {
        if (!height) {
            console.warn(
                `The section type is fixed but 'height' prop is ${height}`
            );
            height = 0;
        }
        sectionStyle.height = `${height.toFixed(2)}px`;
    }

    const classes = classNames(
        'grid',
        styles['section'],
        { wide },
        { [styles['no-animation']]: noAnimation },
        typeClassName
    );

    return (
        <section
            {...sectionProps}
            className={`${classes}${sectionProps?.className ? ` ${sectionProps?.className}` : ''}`}
            style={{ ...sectionProps?.style, ...sectionStyle }}
        >
            {children}
        </section>
    );
};

GridSection.propTypes = {
    type: PropTypes.oneOf(['dynamic', 'fixed', 'fit']),
    wide: PropTypes.bool,
    height: PropTypes.number,
    noAnimation: PropTypes.bool,
    style: PropTypes.object,
    children: PropTypes.node,
    sectionProps: PropTypes.object,
};

/**
 * Dynamic section.
 * This section's height is determined by its content.
 * @param props Component properties.
 * @param props.grid Specifies whether to use grid system for content div element.
 * @param props.wide Specifies whether to use wide grid for content div element.
 * @param props.noGutters Remove the default grid gutters.
 * @param props.noAnimation Disable section initial animation.
 * @param props.sectionProps Top-level section element properties.
 * @param props.contentProps Content div element properties.
 * @param props.children Component children.
 * @note 'Content div' refering to the element that is the direct parent of the component children.
 * @returns Returns the component.
 */
const DynamicSection: FunctionComponent<{
    grid?: boolean;
    wide?: boolean;
    noGutters?: boolean;
    noAnimation?: boolean;
    sectionProps?: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
    >;
    contentProps?: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
    >;
    children?: ReactNode;
}> = function ({
    grid = false,
    wide = false,
    noGutters = false,
    noAnimation = false,
    sectionProps,
    contentProps,
    children,
}) {
    const classes = classNames('c-12 m-12 l-12', { grid }, { wide });

    return (
        <GridSection
            type="dynamic"
            noAnimation={noAnimation}
            sectionProps={sectionProps}
        >
            <Row
                noGutters={noGutters}
                style={{
                    flexGrow: '1',
                }}
            >
                <Column
                    {...contentProps}
                    className={`${classes}${contentProps?.className ? ` ${contentProps?.className}` : ''}`}
                >
                    {children}
                </Column>
            </Row>
        </GridSection>
    );
};

DynamicSection.propTypes = {
    grid: PropTypes.bool,
    wide: PropTypes.bool,
    noGutters: PropTypes.bool,
    noAnimation: PropTypes.bool,
    sectionProps: PropTypes.object,
    contentProps: PropTypes.object,
    children: PropTypes.node,
};

/**
 * Fixed section.
 * This section has a fixed height.
 * @param props Component properties.
 * @param props.grid Specifies whether to use grid system for content div element.
 * @param props.wide Specifies whether to use wide grid for content div element.
 * @param props.noGutters Remove the default grid gutters.
 * @param props.noAnimation Disable section initial animation.
 * @param props.sectionProps Top-level section element properties.
 * @param props.contentProps Content div element properties.
 * @param props.height Specifies section fixed height.
 * @param props.children Component children.
 * @returns Returns the component.
 */
const FixedSection: FunctionComponent<{
    grid?: boolean;
    wide?: boolean;
    noGutters?: boolean;
    noAnimation?: boolean;
    sectionProps?: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
    >;
    contentProps?: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
    >;
    height: number;
    children?: ReactNode;
}> = function ({
    grid = false,
    wide = false,
    noGutters = false,
    noAnimation = false,
    sectionProps,
    contentProps,
    height,
    children,
}) {
    const classes = classNames('c-12 m-12 l-12', { grid }, { wide });
    return (
        <GridSection
            type="fixed"
            height={height}
            noAnimation={noAnimation}
            sectionProps={sectionProps}
            style={{ display: 'flex' }}
        >
            <Row
                noGutters={noGutters}
                style={{
                    flexGrow: '1',
                }}
            >
                <Column
                    {...contentProps}
                    className={`${classes}${contentProps?.className ? ` ${contentProps?.className}` : ''}`}
                >
                    {children}
                </Column>
            </Row>
        </GridSection>
    );
};

FixedSection.propTypes = {
    grid: PropTypes.bool,
    wide: PropTypes.bool,
    noGutters: PropTypes.bool,
    noAnimation: PropTypes.bool,
    sectionProps: PropTypes.object,
    contentProps: PropTypes.object,
    height: PropTypes.number.isRequired,
    children: PropTypes.node,
};

/**
 * Flexible section.
 * This section's height is automatically scaled to fit the remaining space.
 * @param props Component properties.
 * @param props.grid Specifies whether to use grid system for content div element.
 * @param props.wide Specifies whether to use wide grid for content div element.
 * @param props.noGutters Remove the default grid gutters.
 * @param props.noAnimation Disable section initial animation.
 * @param props.sectionProps Top-level section element properties.
 * @param props.contentProps Content div element properties.
 * @param props.children Component children.
 * @returns Returns the component.
 */
const FlexibleSection: FunctionComponent<{
    grid?: boolean;
    wide?: boolean;
    noGutters?: boolean;
    noAnimation?: boolean;
    sectionProps?: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
    >;
    contentProps?: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
    >;
    children?: ReactNode;
}> = function ({
    grid = false,
    wide = false,
    noGutters = false,
    noAnimation = false,
    sectionProps,
    contentProps,
    children,
}) {
    const classes = classNames('c-12 m-12 l-12', { grid }, { wide });

    return (
        <GridSection
            type="fit"
            noAnimation={noAnimation}
            sectionProps={sectionProps}
            style={{ display: 'flex' }}
        >
            <Row
                noGutters={noGutters}
                style={{
                    flexGrow: '1',
                }}
            >
                <Column
                    {...contentProps}
                    className={`${classes}${contentProps?.className ? ` ${contentProps?.className}` : ''}`}
                >
                    {children}
                </Column>
            </Row>
        </GridSection>
    );
};

FlexibleSection.propTypes = {
    grid: PropTypes.bool,
    wide: PropTypes.bool,
    noGutters: PropTypes.bool,
    noAnimation: PropTypes.bool,
    sectionProps: PropTypes.object,
    contentProps: PropTypes.object,
    children: PropTypes.node,
};

export default GridSection;
export { DynamicSection, FixedSection, FlexibleSection };
