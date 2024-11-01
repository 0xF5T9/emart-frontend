// https://icon-sets.iconify.design/fa6-solid/circle-exclamation/

import React from 'react';
import type { SVGProps } from 'react';

export function CircleExclamation(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            {...props}
        >
            <path
                fill="currentColor"
                d="M256 512a256 256 0 1 0 0-512a256 256 0 1 0 0 512m0-384c13.3 0 24 10.7 24 24v112c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24m-32 224a32 32 0 1 1 64 0a32 32 0 1 1-64 0"
            ></path>
        </svg>
    );
}
