"use client";
import { useState, useEffect } from "react";
import IntroAnimation from "../components/IntroAnimation";
import BackToTop from "../components/BackToTop";

function useScrollReveal(enabled) {
    useEffect(() => {
        if (!enabled) return;

        const SELECTOR = ".reveal:not(.revealed)";

        const observe = (root) => {
            const els = root.querySelectorAll ? root.querySelectorAll(SELECTOR) : [];
            els.forEach(el => io.observe(el));
        };

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("revealed");
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
        );

        // Observe already-present elements
        observe(document);

        // Watch for elements added by client-side navigation
        const mo = new MutationObserver((mutations) => {
            mutations.forEach((m) => {
                m.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        if (node.matches && node.matches(SELECTOR)) io.observe(node);
                        observe(node);
                    }
                });
            });
        });
        mo.observe(document.body, { childList: true, subtree: true });

        return () => { io.disconnect(); mo.disconnect(); };
    }, [enabled]);
}

export default function BodyWrapper({ children }) {
    const [introPlaying, setIntroPlaying] = useState(true);
    useScrollReveal(!introPlaying);

    return (
        <>
            {introPlaying && (
                <IntroAnimation onComplete={() => setIntroPlaying(false)} />
            )}
            <div style={{ visibility: introPlaying ? "hidden" : "visible" }}>
                {children}
                <BackToTop />
            </div>
        </>
    );
}
