/**
 * @file index.tsx
 * @description Update email section.
 */

'use strict';
import { FunctionComponent, useState, useEffect } from 'react';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import classNames from 'classnames';

import routes from '@sources/ts/global/react-router/routes';
import apis from '@sources/ts/apis';
import { FlexibleSection } from '@sources/ts/components/Content/components/GridSection';
import Button from '@sources/ts/components/Button';
import * as styles from './UpdateEmailSection.module.css';
import staticTexts from '@sources/ts/render/static-texts';
const texts = staticTexts.updateEmailSection;

/**
 * Update email section.
 * @returns Returns the component.
 */
const UpdateEmailSection: FunctionComponent = function () {
    const navigate = useNavigate(),
        token = useSearchParams()[0].get('token');
    if (!token) return <Navigate to={routes.home} />;

    const [pending, setPending] = useState(true),
        [statusText, setStatusText] = useState<string>(texts.processingMessage);

    useEffect(() => {
        setPending(true);
        (async () => {
            const { message, success } =
                await apis.emart.updateEmailAddress(token);
            if (!success) {
                setStatusText(message);
                setPending(false);
                return;
            }

            setStatusText(texts.successfulMessage);
            setPending(false);
        })();
    }, []);

    return (
        <>
            <FlexibleSection
                contentProps={{
                    style: {
                        display: 'flex',
                        flexFlow: 'column nowrap',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '50px 20px',
                    },
                }}
            >
                <div className={styles['wrapper']}>
                    <span className={styles['title']}>{texts.title}</span>
                    <p className={styles['status-text']}>
                        {pending && (
                            <i
                                className={classNames(
                                    styles['status-text-loading-icon'],
                                    'far fa-spinner-third fa-spin'
                                )}
                            />
                        )}
                        {statusText}
                    </p>
                    {!pending && (
                        <Button
                            className={styles['submit']}
                            height={40}
                            disabled={pending}
                            loading={pending}
                            onClick={() => navigate(routes.profile)}
                        >
                            {texts.backToHomepage}
                        </Button>
                    )}
                </div>
            </FlexibleSection>
        </>
    );
};

export default UpdateEmailSection;
