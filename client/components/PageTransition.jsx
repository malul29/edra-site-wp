"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Dennis Snellenberg-style page transition.
 *
 * A dark curved SVG curtain slides up from the bottom, covering the screen.
 * While the screen is covered, the page name is shown centered.
 * Then the curtain continues upward, peeling away with a convex curve
 * to reveal the new page underneath.
 *
 * KEY: We freeze the old page content until the curtain fully covers,
 * preventing any flash of the new page.
 */

/* ── Route → display name ──────────────────────────── */
function getPageName(path) {
    if (path === "/") return "Home";
    if (path.startsWith("/project/")) return "Project";
    if (path.startsWith("/blog/")) return "Article";
    const segment = path.split("/").filter(Boolean)[0] || "Home";
    return segment.charAt(0).toUpperCase() + segment.slice(1);
}

/* ── SVG path helpers ──────────────────────────────── */
const initialPath = `M 0 100 Q 50 200 100 100 L 100 200 L 0 200 Z`;
const targetPath  = `M 0 0   Q 50 0   100 0   L 100 200 L 0 200 Z`;
const exitStart   = `M 0 0 L 100 0 L 100 100 Q 50 100 0 100 Z`;
const exitEnd     = `M 0 0 L 100 0 L 100 0   Q 50 0   0 0   Z`;

/* ── Timing ────────────────────────────────────────── */
const ENTER_MS = 700;
const HOLD_MS  = 350;
const EXIT_MS  = 700;

export default function PageTransition({ children }) {
    const pathname = usePathname();

    // Frozen children — we control WHEN the displayed content updates
    const [frozenChildren, setFrozenChildren] = useState(children);
    const [transitioning, setTransitioning] = useState(false);
    const [phase, setPhase] = useState("idle"); // idle | enter | hold | exit
    const [pageName, setPageName] = useState("");
    const [isFirstMount, setIsFirstMount] = useState(true);

    const prevPathRef = useRef(pathname);
    const pendingChildrenRef = useRef(children);
    const timersRef = useRef([]);

    // Always track the latest children
    pendingChildrenRef.current = children;

    // Skip transition on first mount
    useEffect(() => {
        if (isFirstMount) setIsFirstMount(false);
    }, [isFirstMount]);

    // Detect route change → start transition
    useEffect(() => {
        // Same path or first mount — just update immediately
        if (pathname === prevPathRef.current || isFirstMount) {
            prevPathRef.current = pathname;
            setFrozenChildren(children);
            return;
        }

        // Clear any pending timers
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];

        // Freeze current (old) children — don't show new page yet
        setPageName(getPageName(pathname));
        setTransitioning(true);
        setPhase("enter");

        // Phase 1: Curtain covers screen
        const t1 = setTimeout(() => {
            // NOW swap content — user can't see it behind the curtain
            setFrozenChildren(pendingChildrenRef.current);
            window.scrollTo(0, 0);
            setPhase("hold");

            // Phase 2: Brief hold with page name visible
            const t2 = setTimeout(() => {
                setPhase("exit");

                // Phase 3: Curtain reveals new page
                const t3 = setTimeout(() => {
                    setPhase("idle");
                    setTransitioning(false);
                    prevPathRef.current = pathname;
                }, EXIT_MS);
                timersRef.current.push(t3);
            }, HOLD_MS);
            timersRef.current.push(t2);
        }, ENTER_MS);
        timersRef.current.push(t1);

        return () => {
            timersRef.current.forEach(clearTimeout);
            timersRef.current = [];
        };
    }, [pathname]); // intentionally only depend on pathname

    // When idle and no transition, keep children in sync
    useEffect(() => {
        if (!transitioning) {
            setFrozenChildren(children);
        }
    }, [children, transitioning]);

    return (
        <>
            {/* Page content — frozen during transition */}
            {frozenChildren}

            {/* ── SVG Curtain Overlay ── */}
            <AnimatePresence>
                {phase !== "idle" && (
                    <motion.div
                        key="curtain"
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 9990,
                            pointerEvents: "all",
                        }}
                        exit={{ opacity: 0, transition: { duration: 0, delay: 0 } }}
                    >
                        <svg
                            viewBox="0 0 100 200"
                            preserveAspectRatio="none"
                            style={{
                                position: "absolute",
                                width: "100%",
                                height: "100%",
                            }}
                        >
                            <motion.path
                                fill="#1a1a1a"
                                initial={{ d: initialPath }}
                                animate={{
                                    d: phase === "enter"
                                        ? targetPath
                                        : phase === "hold"
                                            ? exitStart
                                            : phase === "exit"
                                                ? exitEnd
                                                : initialPath,
                                }}
                                transition={{
                                    duration:
                                        phase === "enter"
                                            ? ENTER_MS / 1000
                                            : phase === "hold"
                                                ? 0.01
                                                : EXIT_MS / 1000,
                                    ease: [0.76, 0, 0.24, 1],
                                }}
                            />
                        </svg>

                        {/* Page name label */}
                        <motion.div
                            style={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 2,
                                pointerEvents: "none",
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                                opacity: phase === "hold" || phase === "enter" ? 1 : 0,
                                y: phase === "exit" ? -40 : 0,
                            }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
