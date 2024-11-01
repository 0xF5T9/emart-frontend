// https://icon-sets.iconify.design/line-md/loading-loop/

import React from 'react';
import type { SVGProps } from 'react';

export function CircleLoadingThird(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
            <path
                fill="none"
                stroke="currentColor"
                strokeDasharray={16}
                strokeDashoffset={16}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3c4.97 0 9 4.03 9 9"
            >
                <animate
                    fill="freeze"
                    attributeName="stroke-dashoffset"
                    dur="0.1s"
                    values="16;0"
                ></animate>
                <animateTransform
                    attributeName="transform"
                    dur="0.75s"
                    repeatCount="indefinite"
                    type="rotate"
                    values="0 12 12;360 12 12"
                ></animateTransform>
            </path>
        </svg>
    );
}