/**
 * @file app-router.tsx
 * @description React router app router.
 */

'use strict';
import type { RouteObject } from 'react-router-dom';
import routes from './routes';
import { AuthProvider } from '@sources/ts/hooks/useAuth';
import { GlobalProvider } from '@sources/ts/hooks/useGlobal';
import { ModalProvider } from '@sources/ts/hooks/useModal';
import { APIProvider } from '@sources/ts/hooks/useAPI';
import App from '@sources/ts/components/App';
import ProtectedRoute from '@sources/ts/components/ProtectedRoute';
import { DefaultLayout, BlankLayout } from '@sources/ts/components/Layouts';
import * as Sections from '@sources/ts/components/Sections';
import AdminProducts from '@sources/ts/components/Sections/AdminSection/Products';
import AdminCategories from '@sources/ts/components/Sections/AdminSection/Categories';
import AdminOrders from '@sources/ts/components/Sections/AdminSection/Orders';
import AdminUsers from '@sources/ts/components/Sections/AdminSection/Users';

const appRouter: RouteObject[] = [
    {
        path: routes.home,
        element: (
            <GlobalProvider>
                <AuthProvider>
                    <ModalProvider>
                        <APIProvider>
                            <App />
                        </APIProvider>
                    </ModalProvider>
                </AuthProvider>
            </GlobalProvider>
        ),
        errorElement: (
            <GlobalProvider>
                <AuthProvider>
                    <ModalProvider>
                        <APIProvider>
                            <div id="app">
                                <BlankLayout>
                                    <Sections.ErrorSection />
                                </BlankLayout>
                            </div>
                        </APIProvider>
                    </ModalProvider>
                </AuthProvider>
            </GlobalProvider>
        ),
        children: [
            {
                children: [
                    {
                        index: true,
                        element: (
                            <DefaultLayout>
                                <Sections.IndexSection />
                            </DefaultLayout>
                        ),
                    },
                    {
                        path: routes.resetPassword,
                        element: (
                            <BlankLayout>
                                <Sections.ResetPasswordSection />
                            </BlankLayout>
                        ),
                    },
                    {
                        path: routes.updateEmail,
                        element: (
                            <BlankLayout>
                                <Sections.UpdateEmailSection />
                            </BlankLayout>
                        ),
                    },
                    {
                        path: routes.newsletterSubscribeConfirmation,
                        element: (
                            <BlankLayout>
                                <Sections.ConfirmNewsletterSubscribeSection />
                            </BlankLayout>
                        ),
                    },
                    {
                        path: routes.profile,
                        element: (
                            <DefaultLayout>
                                <ProtectedRoute>
                                    <Sections.ProfileSection />
                                </ProtectedRoute>
                            </DefaultLayout>
                        ),
                    },
                    {
                        path: routes.admin,
                        element: (
                            <BlankLayout>
                                <ProtectedRoute isAdmin>
                                    <Sections.AdminSection />
                                </ProtectedRoute>
                            </BlankLayout>
                        ),
                        children: [
                            { path: 'products', element: <AdminProducts /> },
                            {
                                path: 'categories',
                                element: <AdminCategories />,
                            },
                            { path: 'orders', element: <AdminOrders /> },
                            { path: 'users', element: <AdminUsers /> },
                        ],
                    },
                ],
            },
        ],
    },
] as const;

export default appRouter;
