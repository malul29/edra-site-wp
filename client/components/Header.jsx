"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import YodezeenButton from "./YodezeenButton";
import TextRoll from "@/components/ui/text-roll";

export default function Header() {
  const [solid, setSolid] = useState(false);
  const [visible, setVisible] = useState(true);
  const [isLightBg, setIsLightBg] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isProjectDetail = pathname.startsWith("/project/");
  const isLightPage = pathname === "/blogs";

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  // Prevent body scroll when any overlay is open
  useEffect(() => {
    if (servicesOpen || mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [servicesOpen, mobileOpen]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollState = () => {
      const scrollY = window.scrollY;

      // Set solid background - transparent on all pages at top, frosted-glass when scrolled
      setSolid(scrollY > 40);

      // Check if navbar is over light section
      if (isHome) {
        const statementSection = document.querySelector(".statement-section");
        let isOverLight = false;
        if (statementSection) {
          const rect = statementSection.getBoundingClientRect();
          if (rect.top < 100 && rect.bottom > 0) {
            isOverLight = true;
          }
        }
        setIsLightBg(isOverLight);
      } else if (pathname === "/projects") {
        setIsLightBg(false);
      } else if (pathname === "/blogs") {
        const blogHero = document.querySelector(".blog-hero");
        let isOverLight = false;
        if (blogHero) {
          const heroRect = blogHero.getBoundingClientRect();
          if (heroRect.bottom < 100) {
            isOverLight = true;
          }
        }
        setIsLightBg(isOverLight);
      } else if (pathname === "/about") {
        const aboutHero = document.querySelector(".about-redesign-hero");
        let isOverLight = false;
        if (aboutHero) {
          const heroRect = aboutHero.getBoundingClientRect();
          if (heroRect.bottom < 100) {
            isOverLight = true;
          }
        }
        setIsLightBg(isOverLight);
      } else if (pathname === "/contact") {
        const contactHero = document.querySelector(".contact-hero");
        let isOverLight = false;
        if (contactHero) {
          const heroRect = contactHero.getBoundingClientRect();
          if (heroRect.bottom < 100) {
            isOverLight = true;
          }
        }
        setIsLightBg(isOverLight);
      } else {
        setIsLightBg(isLightPage);
      }

      // Hide/show navbar based on scroll direction
      if (scrollY <= 50) {
        setVisible(true);
      } else if (scrollY > lastScrollY && scrollY > 150) {
        setVisible(false);
      } else if (scrollY < lastScrollY - 10) {
        setVisible(true);
      }

      lastScrollY = scrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateScrollState();

    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome, isProjectDetail, isLightPage, pathname]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header
      className={`header ${solid ? "solid" : ""} ${isLightBg ? "light" : ""} ${servicesOpen ? "services-active" : ""} ${mobileOpen ? "mobile-open" : ""}`}
      style={{
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.3s ease-in-out"
      }}
    >
      <div className="header-inner">
        {/* Desktop Left Nav */}
        <nav className="header-left">
          <Link href="/projects" className="nav-link">
            <TextRoll className="text-[inherit] leading-[1] font-[inherit] tracking-[inherit]">PROJECTS</TextRoll>
          </Link>
          <Link
            href="/services"
            className={`nav-link nav-button ${servicesOpen ? 'active' : ''}`}
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <span className="nav-circle">
              <TextRoll className="text-[inherit] leading-[1] font-[inherit] tracking-[inherit]">SERVICES</TextRoll>
            </span>
          </Link>
          <Link href="/about" className="nav-link">
            <TextRoll className="text-[inherit] leading-[1] font-[inherit] tracking-[inherit]">ABOUT</TextRoll>
          </Link>
        </nav>

        <Link href="/" className="brand">
          <Image src="/edra-logo.png" alt="EDRA Arsitek Indonesia" className="brand-logo" width={120} height={40} priority quality={75} />
        </Link>

        {/* Desktop Right Nav */}
        <nav className="header-right">
          <Link href="/contact" className="nav-link">
            <TextRoll className="text-[inherit] leading-[1] font-[inherit] tracking-[inherit]">CONTACT</TextRoll>
          </Link>
          <Link href="/blogs" className="nav-link">
            <TextRoll className="text-[inherit] leading-[1] font-[inherit] tracking-[inherit]">BLOGS</TextRoll>
          </Link>
          <YodezeenButton to="/contact" />
        </nav>

        {/* Hamburger Button (mobile only) */}
        <button
          className={`hamburger ${mobileOpen ? 'open' : ''}`}
          onClick={() => setMobileOpen(prev => !prev)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span className="hamburger-line top" />
          <span className="hamburger-line middle" />
          <span className="hamburger-line bottom" />
        </button>
      </div>

      {/* Fullscreen Services Menu (desktop hover) */}
      <div
        className={`services-overlay ${servicesOpen ? 'active' : ''} ${isLightBg ? 'light' : ''}`}
      >
        <div className="services-content">
          <div className="services-menu">
            <Link href="/services" className="services-item" onClick={() => setServicesOpen(false)}>
              <TextRoll className="text-[inherit] leading-[1] font-[inherit] tracking-[inherit]">ARCHITECTURE</TextRoll>
            </Link>
            <Link href="/services" className="services-item" onClick={() => setServicesOpen(false)}>
              <TextRoll className="text-[inherit] leading-[1] font-[inherit] tracking-[inherit]">MANAGEMENT</TextRoll>
            </Link>
            <Link href="/services" className="services-item" onClick={() => setServicesOpen(false)}>
              <TextRoll className="text-[inherit] leading-[1] font-[inherit] tracking-[inherit]">CONSTRUCTION</TextRoll>
            </Link>
            <Link href="/services" className="services-item" onClick={() => setServicesOpen(false)}>
              <TextRoll className="text-[inherit] leading-[1] font-[inherit] tracking-[inherit]">INTERIOR DESIGN</TextRoll>
            </Link>
          </div>
        </div>
      </div>

      {/* Fullscreen Mobile Menu */}
      <div className={`mobile-menu ${mobileOpen ? 'active' : ''}`}>
        <nav className="mobile-nav">
          <Link href="/projects" className="mobile-nav-item" onClick={closeMobile}><TextRoll className="text-[inherit] leading-[1] font-[inherit] tracking-[inherit]">PROJECTS</TextRoll></Link>
          <Link href="/services" className="mobile-nav-item" onClick={closeMobile}><TextRoll className="text-[inherit] leading-[1] font-[inherit] tracking-[inherit]">SERVICES</TextRoll></Link>
          <Link href="/about" className="mobile-nav-item" onClick={closeMobile}><TextRoll className="text-[inherit] leading-[1] font-[inherit] tracking-[inherit]">ABOUT</TextRoll></Link>
          <Link href="/contact" className="mobile-nav-item" onClick={closeMobile}><TextRoll className="text-[inherit] leading-[1] font-[inherit] tracking-[inherit]">CONTACT</TextRoll></Link>
          <Link href="/blogs" className="mobile-nav-item" onClick={closeMobile}><TextRoll className="text-[inherit] leading-[1] font-[inherit] tracking-[inherit]">BLOGS</TextRoll></Link>
        </nav>

        <div className="mobile-menu-footer">
          <div className="mobile-social">
            {/* Instagram */}
            <a href="https://instagram.com/edra.architect" target="_blank" rel="noopener noreferrer" className="mobile-social-link" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                <circle cx="18" cy="6" r="1" fill="currentColor" />
              </svg>
            </a>
            {/* YouTube */}
            <a href="https://youtube.com/@edraarchitect" target="_blank" rel="noopener noreferrer" className="mobile-social-link" aria-label="YouTube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9.75 15.02l5.75-3.27-5.75-3.27v6.54z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            {/* Facebook */}
            <a href="https://facebook.com/edra.architects" target="_blank" rel="noopener noreferrer" className="mobile-social-link" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            {/* Behance */}
            <a href="https://behance.net/edra-architects" target="_blank" rel="noopener noreferrer" className="mobile-social-link" aria-label="Behance">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h5.5a3 3 0 010 6H4V6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M4 12h6.5a3.5 3.5 0 010 7H4v-7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M15 10h6M15.75 14a3.25 3.25 0 106.5 0H15.75z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="https://linkedin.com/company/pt-edra-arsitek-indonesia" target="_blank" rel="noopener noreferrer" className="mobile-social-link" aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2" />
              </svg>
            </a>
            {/* Pinterest */}
            <a href="https://pinterest.com/edraarchitects" target="_blank" rel="noopener noreferrer" className="mobile-social-link" aria-label="Pinterest">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.852 0 1.265.64 1.265 1.408 0 .858-.546 2.141-.828 3.33-.236.995.498 1.806 1.476 1.806 1.772 0 3.138-1.868 3.138-4.566 0-2.387-1.716-4.057-4.165-4.057-2.837 0-4.502 2.128-4.502 4.328 0 .857.33 1.776.741 2.279a.3.3 0 01.069.286c-.075.314-.243.995-.276 1.134-.044.183-.146.222-.337.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.966-.527-2.292-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446C17.523 22 22 17.523 22 12S17.523 2 12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            {/* TikTok */}
            <a href="https://tiktok.com/@edra.architect" target="_blank" rel="noopener noreferrer" className="mobile-social-link" aria-label="TikTok">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 12a4 4 0 104 4V4a5 5 0 005 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
