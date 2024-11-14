/**
 * @file index.tsx
 * @description Index section.
 */

'use strict';
import { FunctionComponent } from 'react';

import { DynamicSection } from '@sources/ts/components/Content/components/GridSection';
import HeroSlider from './components/HeroSlider';
import BusinessServices from './components/BusinessServices';
import ProductsView from './components/ProductsView';
import staticUrls from '@sources/ts/render/static-urls';
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
                <HeroSlider
                    images={[
                        {
                            url: staticUrls.heroSliderImage1,
                        },
                        {
                            url: staticUrls.heroSliderImage2,
                        },
                        {
                            url: staticUrls.heroSliderImage3,
                        },
                        {
                            url: staticUrls.heroSliderImage4,
                        },
                    ]}
                />
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
