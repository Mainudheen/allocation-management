import React, { useEffect, useRef } from "react";

export default function ErrorReporter({ error, reset }) {
  const lastOverlayMsg = useRef("");
  const pollRef = useRef();

  useEffect(() => {
    const inIframe = window.parent !== window;
    if (!inIframe) return;

    const send = (payload) => window.parent.postMessage(payload, "*");

    const onError = (e) => {
      send({
        type: "ERROR_CAPTURED",
        error: {
          message: e.message,
          stack: e.error?.stack,
          filename: e.filename,
          lineno: e.lineno,
          colno: e.colno,
          source: "window.onerror",
        },
        timestamp: Date.now(),
      });
    };

    const onReject = (e) => {
      send({
        type: "ERROR_CAPTURED",
        error: {
          message: e.reason?.message ?? String(e.reason),
          stack: e.reason?.stack,
          source: "unhandledrejection",
        },
        timestamp: Date.now(),
      });
    };

    const pollOverlay = () => {
      const overlay = document.querySelector("[data-nextjs-dialog-overlay]");
      const node =
        overlay?.querySelector("h1, h2, .error-message, [data-nextjs-dialog-body]") || null;

      const txt = node?.textContent || node?.innerHTML || "";

      if (txt && txt !== lastOverlayMsg.current) {
        lastOverlayMsg.current = txt;
        send({
          type: "ERROR_CAPTURED",
          error: { message: txt, source: "nextjs-dev-overlay" },
          timestamp: Date.now(),
        });
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onReject);
    pollRef.current = setInterval(pollOverlay, 1000);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onReject);
      clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (!error) return;

    window.parent.postMessage(
      {
        type: "global-error-reset",
        error: {
          message: error.message,
          stack: error.stack,
          digest: error.digest,
          name: error.name,
        },
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      },
      "*"
    );
  }, [error]);

  if (!error) return null;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Something went wrong!</h1>
        <p style={styles.text}>
          An unexpected error occurred. Please try again.
        </p>

        {process.env.NODE_ENV === "development" && (
          <details style={styles.details}>
            <summary style={styles.summary}>Error Details</summary>
            <pre style={styles.pre}>
              {error.message}
              {error.stack && <div>{error.stack}</div>}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

/* ------------------ NORMAL CSS STYLES ------------------ */
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    padding: "20px",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f5f5",
  },
  card: {
    maxWidth: "400px",
    width: "100%",
    textAlign: "center",
    padding: "24px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#b00020",
  },
  text: {
    color: "#444",
  },
  details: {
    marginTop: "16px",
    textAlign: "left",
  },
  summary: {
    cursor: "pointer",
    fontWeight: "bold",
  },
  pre: {
    background: "#eee",
    marginTop: "10px",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "12px",
    overflowX: "auto",
  },
};
