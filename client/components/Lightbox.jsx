"use client";

import { useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import SafeImage from "@/components/SafeImage";

const FULL_WIDTH_PX = 110;
const COLLAPSED_WIDTH_PX = 32;
const GAP_PX = 2;
const MARGIN_PX = 2;

function LightboxThumbs({ images, currentIndex, onGoTo }) {
    const stripRef = useRef(null);

    useEffect(() => {
        if (stripRef.current) {
            let scrollPos = 0;
            for (let i = 0; i < currentIndex; i++) scrollPos += COLLAPSED_WIDTH_PX + GAP_PX;
            scrollPos += MARGIN_PX;
            const containerW = stripRef.current.offsetWidth;
            scrollPos -= containerW / 2 - FULL_WIDTH_PX / 2;
            stripRef.current.scrollTo({ left: scrollPos, behavior: "smooth" });
        }
    }, [currentIndex]);

    return (
        <div ref={stripRef} className="lightbox-thumb-strip">
            <div className="lightbox-thumb-inner">
                {images.map((img, i) => (
                    <motion.button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); onGoTo(i); }}
                        initial={false}
                        animate={i === currentIndex ? "active" : "inactive"}
                        variants={{
                            active: { width: FULL_WIDTH_PX, marginLeft: MARGIN_PX, marginRight: MARGIN_PX },
                            inactive: { width: COLLAPSED_WIDTH_PX, marginLeft: 0, marginRight: 0 },
                        }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                        className={`lightbox-thumb${i === currentIndex ? " lightbox-thumb-active" : ""}`}
                    >
                        <SafeImage
                            src={img}
                          fallbackSrc="/edra-logo.png"
                            alt={`Thumbnail ${i + 1}`}
                            fill
                            sizes="110px"
                            style={{ objectFit: "cover", pointerEvents: "none", userSelect: "none" }}
                            loading="lazy"
                            quality={50}
                        />
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

export default function Lightbox({ images, currentIndex, onClose, onNext, onPrev, onGoTo }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowRight") onNext();
    if (e.key === "ArrowLeft") onPrev();
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    if (currentIndex !== null && images && images.length > 0) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [handleKeyDown, currentIndex, images]);

  if (currentIndex === null || !images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Body: image + side navs */}
      <div className="lightbox-body" onClick={(e) => e.stopPropagation()}>
        {images.length > 1 && (
          <button
            className="lightbox-nav lightbox-nav-prev"
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            aria-label="Previous image"
            disabled={currentIndex === 0}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        <div className="lightbox-content">
          <SafeImage
            src={currentImage}
            fallbackSrc="/edra-logo.png"
            alt={`Gallery image ${currentIndex + 1}`}
            className="lightbox-image"
            width={1920}
            height={1080}
            sizes="100vw"
            style={{ width: "100%", height: "auto", maxHeight: "100%", objectFit: "contain" }}
            quality={85}
          />
        </div>

        {images.length > 1 && (
          <button
            className="lightbox-nav lightbox-nav-next"
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            aria-label="Next image"
            disabled={currentIndex === images.length - 1}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>

      {/* Footer: counter + thumbnail strip */}
      <div className="lightbox-footer" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-counter">
          {currentIndex + 1} / {images.length}
        </div>
        {images.length > 1 && onGoTo && (
          <LightboxThumbs images={images} currentIndex={currentIndex} onGoTo={onGoTo} />
        )}
      </div>
    </div>
  );
}
