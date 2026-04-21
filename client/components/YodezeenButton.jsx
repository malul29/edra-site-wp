"use client";

import { useRouter, usePathname } from "next/navigation";

export default function YodezeenButton({ to = "/contact", children = "LET'S TALK" }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e) => {
    e.preventDefault();

    if (pathname === '/contact') {
      // Already on contact page, just scroll
      const contactMain = document.querySelector('.contact-main');
      if (contactMain) {
        contactMain.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Navigate to contact page with hash
      router.push('/contact#main');
    }
  };

  return (
    <a href={to} onClick={handleClick} className="yodezeen-hover-btn">
      {/* SVG distortion filter for liquid glass effect */}
      <svg className="btn-glass-filter" aria-hidden="true">
        <defs>
          <filter id="liquid-btn-glass" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.55 0.55" numOctaves="1" seed="3" result="turbulence" />
            <feGaussianBlur in="turbulence" stdDeviation="1" result="blurredNoise" />
            <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="6" xChannelSelector="R" yChannelSelector="B" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation="1" result="finalBlur" />
            <feComposite in="finalBlur" in2="finalBlur" operator="over" />
          </filter>
        </defs>
      </svg>

      {/* Distorted backdrop layer (progressive enhancement — visible in Firefox) */}
      <div
        className="btn-glass-distort"
        style={{ backdropFilter: 'url("#liquid-btn-glass")', WebkitBackdropFilter: 'url("#liquid-btn-glass")' }}
      />

      <div className="btn-inner">
        <div className="btn-text-wrap">
          <span className="btn-text letstalk-text">{children}</span>
          <span className="btn-text sayhi-text">SAY HI</span>
        </div>
        <div className="btn-circle">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </a>
  );
}
