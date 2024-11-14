/**
 * @file index.tsx
 * @desc Hero slider.
 */

'use strict';
import { FunctionComponent } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

import * as styles from './HeroSlider.module.css';
import staticUrls from '@sources/ts/render/static-urls';

type HeroImage = {
    url: string;
    alt?: string;
};

/**
 * Hero image slider.
 * @param props Component properties.
 * @param props.images Images.
 * @returns Returns the component.
 */
const HeroSlider: FunctionComponent<{ images: HeroImage[] }> = ({ images }) => {
    return (
        <Carousel
            responsive={{
                desktop: {
                    breakpoint: { max: 4000, min: 1024 },
                    items: 1,
                },
                tablet: {
                    breakpoint: { max: 1024, min: 741 },
                    items: 1,
                },
                mobile: {
                    breakpoint: { max: 741, min: 0 },
                    items: 1,
                },
            }}
            containerClass={styles['hero-container']}
            sliderClass={styles['hero-slider']}
            itemClass={styles['hero-slider-item']}
            dotListClass={styles['hero-dot-list']}
            showDots
            autoPlay
            autoPlaySpeed={7000}
            rewind
            rewindWithAnimation
        >
            {images?.map((image) => (
                <img
                    key={image.url}
                    className={styles['hero-slider-item-image']}
                    src={image?.url}
                    alt={image?.alt}
                    onError={(event) => {
                        event.currentTarget.src = staticUrls.imagePlaceholder;
                    }}
                    onDragStart={(event) => event.preventDefault()}
                />
            ))}
        </Carousel>
    );
};

export default HeroSlider;
