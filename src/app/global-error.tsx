"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: 40, textAlign: 'center', fontFamily: 'system-ui' }}>
          <h2>Something went wrong!</h2>
          <p style={{ color: '#666' }}>Our team has been notified and is working on a fix.</p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: 16,
              padding: '10px 20px',
              borderRadius: 8,
              background: '#00F0FF',
              color: '#050A14',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
