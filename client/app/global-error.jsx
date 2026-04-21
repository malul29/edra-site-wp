"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("CAUGHT ERROR:", error);

        // Recover from stale deployment chunks by forcing one hard reload.
        const isChunkLoadError =
            error?.name === "ChunkLoadError" ||
            /Loading chunk\s+\d+\s+failed/i.test(error?.message || "");

        if (isChunkLoadError && typeof window !== "undefined") {
            const reloaded = window.sessionStorage.getItem("chunk-reload-once");
            if (!reloaded) {
                window.sessionStorage.setItem("chunk-reload-once", "1");
                window.location.reload();
            }
        }
    }, [error]);

    return (
        <html>
            <body>
                <h2>Something went wrong!</h2>
                <pre>{error.message}</pre>
                <pre>{error.stack}</pre>
                <p>Digest: {error.digest}</p>
                <button onClick={() => reset()}>Try again</button>
            </body>
        </html>
    );
}
