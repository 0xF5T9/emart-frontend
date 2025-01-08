/**
 * @file routes.ts
 * @description React router routes.
 */

const routes = {
    home: '/',
    profile: '/profile',
    admin: '/admin',
    resetPassword: '/reset-password',
    updateEmail: '/update-email',
    newsletterSubscribeConfirmation: '/newsletter-subscribe',
} as const;

export default routes;
