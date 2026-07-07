import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ['pdf-parse'],
};

export default withSentryConfig(nextConfig, {
    // Sentry build options
    org: "referkaro",
    project: "referkaro",
    authToken: process.env.SENTRY_AUTH_TOKEN,

    // Upload source maps for better error debugging
    silent: !process.env.CI,

    // Automatically tree-shake Sentry logger statements
    webpack: {
        treeshake: {
            removeDebugLogging: true,
        },
    },
});