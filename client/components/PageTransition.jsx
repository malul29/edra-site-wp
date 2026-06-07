"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useEffect, useState, useRef } from "react";

/**
 * Slide page transition — bulletproof approach.
 *
 * KEY FIXES for "new page flashing before transition":
 *  1. Content visibility is computed SYNCHRONOUSLY during render
 *     (not in an effect), so it's hidden on the exact same frame.
 *  2. The slide panel is ALWAYS mounted in the DOM (no AnimatePresence
 *     mount delay). It's just positioned off-screen when idle.
 *  3. CSS transitions drive the panel movement — no framer-motion needed
 *     for the panel itself, eliminating any animation-library frame delays.
 */

/* ── Route → display name ──────────────────────────── */
function getPageName(path) {
    if (path === "/") return "Home";
    if (path.startsWith("/project/")) return "Project";
    if (path.startsWith("/blog/")) return "Article";
    const segment = path.split("/").filter(Boolean)[0] || "Home";
    return segment.charAt(0).toUpperCase() + segment.slice(1);
}

/* ── Timing ────────────────────────────────────────── */
const SLIDE_IN_MS  = 550;
const HOLD_MS      = 280;
const SLIDE_OUT_MS = 550;
const TOTAL_MS     = SLIDE_IN_MS + HOLD_MS + SLIDE_OUT_MS;

export default function PageTransition({ children }) {
    const pathname = usePathname();

    // phase: "idle" | "slideIn" | "hold" | "slideOut"
    const [phase, setPhase] = useState("idle");
    const [pageName, setPageName] = useState("");

    const prevPathRef = useRef(pathname);
    const timersRef = useRef([]);

    /* ── Synchronous render-time check ──
     * This runs DURING render (before any effects or paint).
     * If the pathname has changed but we haven't started transitioning yet,
     * we know a route change just happened. We hide content immediately. */
    const routeJustChanged = pathname !== prevPathRef.current && phase === "idle";

    /* ── Content should be hidden when: ──
     *  - Route just changed (synchronous, before effect fires)
     *  - Panel is sliding in (covering the screen)
     *  - Panel is holding (fully covering)
     * Content is VISIBLE when:
     *  - Idle (normal state)
     *  - Panel is sliding out (revealing new page) */
    const contentHidden = routeJustChanged || phase === "slideIn" || phase === "hold";

    /* ── Detect route change → start transition ── */
    useLayoutEffect(() => {
        if (prevPathRef.current === pathname) return;

        // Clear pending timers
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];

        setPageName(getPageName(pathname));
        setPhase("slideIn");

        // Phase 1 complete → panel covers entire viewport
        const t1 = setTimeout(() => {
            window.scrollTo(0, 0);
            setPhase("hold");

            // Phase 2 → brief hold with page name
            const t2 = setTimeout(() => {
                setPhase("slideOut");
                prevPathRef.current = pathname;

                // Phase 3 complete → panel off-screen, new page visible
                const t3 = setTimeout(() => {
                    setPhase("idle");
                }, SLIDE_OUT_MS);
                timersRef.current.push(t3);
            }, HOLD_MS);
            timersRef.current.push(t2);
        }, SLIDE_IN_MS);
        timersRef.current.push(t1);

        return () => {
            timersRef.current.forEach(clearTimeout);
            timersRef.current = [];
        };
    }, [pathname]);

    /* ── First mount: skip transition ── */
    useEffect(() => {
        prevPathRef.current = pathname;
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /* ── Panel translateX per phase ── */
    let panelTranslate = "100%";   // off-screen right (idle)
    let panelDuration = "0s";
    let panelEasing = "cubic-bezier(0.76, 0, 0.24, 1)";

    if (phase === "slideIn" || routeJustChanged) {
        panelTranslate = "0%";     // covering viewport
        panelDuration = `${SLIDE_IN_MS / 1000}s`;
        panelEasing = "cubic-bezier(0.76, 0, 0.24, 1)";
    } else if (phase === "hold") {
        panelTranslate = "0%";     // still covering
        panelDuration = "0s";
    } else if (phase === "slideOut") {
        panelTranslate = "-100%";  // off-screen left
        panelDuration = `${SLIDE_OUT_MS / 1000}s`;
        panelEasing = "cubic-bezier(0.22, 1, 0.36, 1)";
    }

    /* ── Label visibility ── */
    const showLabel = phase === "hold";

    return (
        <>
            {/* Page content — hidden during transitions */}
            <div
                style={{
                    visibility: contentHidden ? "hidden" : "visible",
                }}
            >
                {children}
            </div>

            {/* ── Slide Panel (always mounted, positioned via CSS) ── */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 9990,
                    pointerEvents: phase === "idle" ? "none" : "all",
                    overflow: "hidden",
                }}
            >
                {/* Dark panel */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "#1a1a1a",
                        transform: `translateX(${panelTranslate})`,
                        transition: `transform ${panelDuration} ${panelEasing}`,
                        willChange: "transform",
                    }}
                />

                {/* Gold accent line on leading edge */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "2px",
                        height: "100%",
                        background: "linear-gradient(180deg, rgba(200,170,110,0.6) 0%, rgba(200,170,110,0) 100%)",
                        transform: `translateX(${panelTranslate})`,
                        transition: `transform ${panelDuration} ${panelEasing}`,
                        willChange: "transform",
                        zIndex: 2,
                    }}
                />

                {/* Page name label */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 3,
                        pointerEvents: "none",
                        opacity: showLabel ? 1 : 0,
                        transition: "opacity 0.2s ease",
                    }}
                >
                    <span
                        style={{
                            fontFamily: "var(--sans)",
                            fontSize: "clamp(1rem, 2vw, 1.4rem)",
                            fontWeight: 300,
                            letterSpacing: "0.08em",
                            color: "#f5f5f5",
                            textTransform: "capitalize",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            transform: showLabel ? "translateX(0)" : "translateX(20px)",
                            transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease",
                        }}
                    >
                        <span
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: "#f5f5f5",
                                display: "inline-block",
                                flexShrink: 0,
                            }}
                        />
                        {pageName}
                    </span>
                </div>
            </div>
        </>
    );
}
