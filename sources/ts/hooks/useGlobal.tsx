/**
 * @file useGlobal.tsx
 * @description Global hook.
 */

'use strict';
import type { GlobalHook } from '@sources/ts/types/global-hook';
import {
    FunctionComponent,
    ReactNode,
    createContext,
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    useContext,
} from 'react';
import { useNavigation } from 'react-router-dom';
import PropTypes from 'prop-types';
import LoadingBar from 'react-top-loading-bar';

import themes from '@sources/ts/components/Theme';
import themeConfig from '@sources/ts/render/theme';

// Global context.
const globalContext = createContext(null);

/**
 * Global context provider component.
 * @param props Component properties.
 * @param props.children Context children.
 * @returns Returns the component.
 */
const GlobalProvider: FunctionComponent<{ children: ReactNode }> = function ({
    children,
}) {
    const navigation = useNavigation(),
        loadingBarRef = useRef(null);

    const [theme, setTheme] = useState(() => {
            let theme = localStorage.getItem('theme');
            if (!theme) {
                localStorage.setItem('theme', themeConfig.defaultTheme);
                theme = themeConfig.defaultTheme;
            }

            return theme;
        }),
        [deviceInfo, setDeviceInfo] = useState<{
            type: 'desktop' | 'tablet' | 'mobile';
            screenWidth: number;
            screenHeight: number;
        }>(() => ({
            type:
                window.innerWidth >= 1024
                    ? 'desktop'
                    : window.innerWidth >= 741
                      ? 'tablet'
                      : 'mobile',
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
        })),
        [allowScrolling, setAllowScrolling] = useState(true);

    let Theme = themes[theme];
    if (!Theme) {
        Theme = themes['Light'];
        localStorage.setItem('theme', 'Light');
        setTheme('Light');
        console.error('Invalid theme detected.');
    }

    // https://github.com/0xF5T9/react-boilerplate/issues/8
    useLayoutEffect(() => {
        function handleUpdateViewPortHeight() {
            document.documentElement.style.setProperty(
                '--100vh',
                `${window.innerHeight}px`
            );
        }

        handleUpdateViewPortHeight();

        window.addEventListener('resize', handleUpdateViewPortHeight);
        return () => {
            window.removeEventListener('resize', handleUpdateViewPortHeight);
        };
    }, []);

    useEffect(() => {
        window.addEventListener('resize', handleUpdateDeviceInfo);
        return () => {
            window.removeEventListener('resize', handleUpdateDeviceInfo);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        switch (navigation.state) {
            case 'idle':
                loadingBarRef?.current?.complete();
                break;
            case 'loading':
                loadingBarRef?.current?.continuousStart();
                break;
            case 'submitting':
                break;
        }
    }, [navigation.state]);

    function handleUpdateDeviceInfo() {
        const deviceTypeString =
            window.innerWidth >= 1024
                ? 'desktop'
                : window.innerWidth >= 741
                  ? 'tablet'
                  : 'mobile';
        setDeviceInfo({
            type: deviceTypeString,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
        });
    }

    const value: GlobalHook = {
        theme,
        setTheme,
        deviceInfo,
        setAllowScrolling,
    };

    return (
        <globalContext.Provider value={value}>
            <LoadingBar
                ref={loadingBarRef}
                color="var(--color-primary)"
                transitionTime={100}
                loaderSpeed={100}
                waitingTime={500}
                shadow={false}
            />
            {!allowScrolling && (
                <style>
                    {`
                    :root {
                        --general-html-overflow: hidden;
                    }
                    `}
                </style>
            )}
            {Theme && <Theme />}
            {children}
        </globalContext.Provider>
    );
};

GlobalProvider.propTypes = {
    children: PropTypes.node,
};

/**
 * Hook that access global states.
 * @returns theme, setTheme, deviceType, setAllowScrolling
 */
function useGlobal(): GlobalHook {
    return useContext(globalContext);
}

export { globalContext, GlobalProvider, useGlobal };
