/**
 * @file index.tsx
 * @description Protect route wrapper component.
 */

'use strict';
import { FunctionComponent, ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

import { useAuth } from '@sources/ts/hooks/useAuth';
import routes from '@sources/ts/global/react-router/routes';
import { FlexibleSection } from '@sources/ts/components/Content/components/GridSection';
import { CircleLoading } from '@sources/ts/components/Icons/CircleLoading';

/**
 * This component is used to prevent unauthenticated users from accessing private routes.
 * @param props Component properties.
 * @param props.isAdmin Specifies whether the user must be an admin to access the route.
 * @param props.children Component children.
 * @returns Returns the component.
 */
const ProtectedRoute: FunctionComponent<{
    isAdmin?: boolean;
    children: ReactNode;
}> = function ({ isAdmin = false, children }) {
    const navigate = useNavigate();

    const { sessionData, getSessionData } = useAuth(),
        [isVerifying, setIsVerifying] = useState(true);

    function verifySession() {
        if (!sessionData) {
            setIsVerifying(false);
            navigate(routes.home);
            return;
        }

        setIsVerifying(true);
        (async () => {
            const sessionData = await getSessionData();
            if (!sessionData) {
                setIsVerifying(false);
                navigate(routes.home);
                return;
            }

            setIsVerifying(false);
            if (isAdmin && sessionData?.role !== 'admin') navigate(routes.home);
        })();
    }

    useEffect(() => {
        verifySession();
    }, []);

    if (isVerifying)
        return (
            <FlexibleSection
                contentProps={{
                    style: {
                        display: 'flex',
                        flexFlow: 'column nowrap',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '50px 20px',
                        textAlign: 'center',
                    },
                }}
            >
                <CircleLoading
                    style={{ width: '30px', color: 'var(--color-primary)' }}
                />
            </FlexibleSection>
        );

    return children;
};

ProtectedRoute.propTypes = {
    isAdmin: PropTypes.bool,
    children: PropTypes.node,
};

export default ProtectedRoute;
