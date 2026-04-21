"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import SafeImage from "@/components/SafeImage";

const FULL_WIDTH_PX = 120;
const COLLAPSED_WIDTH_PX = 35;
const GAP_PX = 2;
const MARGIN_PX = 2;

function Thumbnails({ images, index, setIndex }) {
    const stripRef = useRef(null);

    useEffect(() => {
        if (stripRef.current) {
            let scrollPosition = 0;
            for (let i = 0; i < index; i++) {
                scrollPosition += COLLAPSED_WIDTH_PX + GAP_PX;
            }
            scrollPosition += MARGIN_PX;
            const containerWidth = stripRef.current.offsetWidth;
            const centerOffset = containerWidth / 2 - FULL_WIDTH_PX / 2;
            scrollPosition -= centerOffset;
            stripRef.current.scrollTo({ left: scrollPosition, behavior: "smooth" });
        }
    }, [index]);

    return (
        <div ref={stripRef} className="tcarousel-strip">
            <div className="tcarousel-strip-inner">
                {images.map((img, i) => (
                    <motion.button
                        key={i}
                        onClick={() => setIndex(i)}
                        initial={false}
                        animate={i === index ? "active" : "inactive"}
                        variants={{
                            active: { width: FULL_WIDTH_PX, marginLeft: MARGIN_PX, marginRight: MARGIN_PX },
                            inactive: { width: COLLAPSED_WIDTH_PX, marginLeft: 0, marginRight: 0 },
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={`tcarousel-thumb${i === index ? " tcarousel-thumb-active" : ""}`}
                    >
                        <SafeImage
                            src={img}
                            fallbackSrc="/edra-logo.png"
                            alt={`Thumbnail ${i + 1}`}
                            fill
                            style={{ objectFit: "cover", pointerEvents: "none", userSelect: "none" }}
                            sizes="120px"
                            loading="lazy"
                            quality={50}
                        />
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

export default function ThumbnailCarousel({ images, onImageClick }) {
    const [index, setIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);
    const x = useMotionValue(0);

    useEffect(() => {
        setIndex(0);
        x.set(0);
    }, [images, x]);

    useEffect(() => {
        if (index > images.length - 1) {
            setIndex(Math.max(0, images.length - 1));
        }
    }, [images.length, index]);

    useEffect(() => {
        if (!isDragging && containerRef.current) {
            const w = containerRef.current.offsetWidth || 1;
            animate(x, -index * w, { type: "spring", stiffness: 300, damping: 30 });
        }
    }, [index, x, isDragging]);

    if (!images || images.length === 0) return null;

    return (
        <div className="tcarousel-wrapper">
            {/* Main viewport */}
            <div className="tcarousel-main" ref={containerRef}>
                <motion.div
                    className="tcarousel-track"
                    drag="x"
                    dragElastic={0.2}
                    dragMomentum={false}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={(e, info) => {
                        setIsDragging(false);
                        const w = containerRef.current?.offsetWidth || 1;
                        let next = index;
                        if (Math.abs(info.velocity.x) > 500) {
                            next = info.velocity.x > 0 ? index - 1 : index + 1;
                        } else if (Math.abs(info.offset.x) > w * 0.3) {
                            next = info.offset.x > 0 ? index - 1 : index + 1;
                        }
                        setIndex(Math.max(0, Math.min(images.length - 1, next)));
                    }}
                    style={{ x }}
                >
                    {images.map((img, i) => (
                        <div
                            key={i}
                            className="tcarousel-slide"
                            onClick={() => {
                                if (!isDragging && onImageClick) onImageClick(i);
                            }}
                        >
                            <SafeImage
                                src={img}
                                fallbackSrc="/edra-logo.png"
                                alt={`Gallery image ${i + 1}`}
                                fill
                                style={{ objectFit: "cover", userSelect: "none", pointerEvents: "none" }}
                                sizes="(max-width: 900px) 100vw, 900px"
                                priority={i === 0}
                                loading={i === 0 ? "eager" : "lazy"}
                                quality={75}
                                draggable={false}
                            />
                            <div className="tcarousel-slide-overlay">
                                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="15 3 21 3 21 9" />
                                    <polyline points="9 21 3 21 3 15" />
                                    <line x1="21" y1="3" x2="14" y2="10" />
                                    <line x1="3" y1="21" x2="10" y2="14" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Prev */}
                {images.length > 1 && (
                    <button
                        disabled={index === 0}
                        onClick={() => setIndex(i => Math.max(0, i - 1))}
                        className={`tcarousel-btn tcarousel-btn-prev${index === 0 ? " tcarousel-btn-disabled" : ""}`}
                        aria-label="Previous image"
                    >
                        <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}

                {/* Next */}
                {images.length > 1 && (
                    <button
                        disabled={index === images.length - 1}
                        onClick={() => setIndex(i => Math.min(images.length - 1, i + 1))}
                        className={`tcarousel-btn tcarousel-btn-next${index === images.length - 1 ? " tcarousel-btn-disabled" : ""}`}
                        aria-label="Next image"
                    >
                        <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}

                {/* Counter */}
                {images.length > 1 && (
                    <div className="tcarousel-counter">
                        {index + 1} / {images.length}
                    </div>
                )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
                <Thumbnails images={images} index={index} setIndex={setIndex} />
            )}
        </div>
    );
}
