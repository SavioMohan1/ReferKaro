import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://6b0a1dc7b1501c8b167e8ae494037296@o4511389117579264.ingest.us.sentry.io/4511389142089728",
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
});
