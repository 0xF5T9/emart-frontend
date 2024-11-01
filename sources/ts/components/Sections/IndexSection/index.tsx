/**
 * @file index.tsx
 * @description Index section.
 */

'use strict';
import { FunctionComponent } from 'react';
import { DynamicSection } from '@sources/ts/components/Content/components/GridSection';

import HeroBanner from './components/HeroBanner';
import BusinessServices from './components/BusinessServices';
import ProductsView from './components/ProductsView';
import './IndexSection.module.css';

/**
 * Index section.
 * @returns Returns the component.
 */
const IndexSection: FunctionComponent = function () {
    return (
        <>
            <DynamicSection
                noGutters
                contentProps={{
                    style: {
                        display: 'flex',
                        flexFlow: 'column nowrap',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                    },
                }}
            >
                <HeroBanner />
            </DynamicSection>
            <DynamicSection
                noGutters
                contentProps={{
                    style: {
                        display: 'flex',
                        flexFlow: 'column nowrap',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                    },
                }}
            >
                <BusinessServices />
            </DynamicSection>
            <DynamicSection
                noGutters
                sectionProps={{ id: 'products-section' }}
                contentProps={{
                    style: {
                        display: 'flex',
                        flexFlow: 'column nowrap',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        paddingTop: '32px',
                    },
                }}
            >
                <ProductsView
                    onPaginationChange={() => {
                        setTimeout(() => {
                            document
                                ?.getElementById('products-section')
                                ?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start',
                                    inline: 'center',
                                });
                        }, 1);
                    }}
                />
            </DynamicSection>
        </>
    );
};

export default IndexSection;
