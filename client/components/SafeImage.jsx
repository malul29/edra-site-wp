"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Wraps next/image with an onError handler.
 * If the primary src fails to load, automatically falls back to `fallbackSrc`.
 */
export default function SafeImage({ src, fallbackSrc, alt, unoptimized = false, ...props }) {
    const [imgSrc, setImgSrc] = useState(src);

    useEffect(() => {
        setImgSrc(src);
    }, [src]);

    return (
        <Image
            {...props}
            unoptimized={unoptimized}
            src={imgSrc || fallbackSrc}
            alt={alt}
            onError={(e) => {
                console.warn("SafeImage: could not load image, using fallback →", fallbackSrc, "(original:", imgSrc, ")");
                if (imgSrc !== fallbackSrc && fallbackSrc) {
                    setImgSrc(fallbackSrc);
                }
            }}
        />
    );
}
