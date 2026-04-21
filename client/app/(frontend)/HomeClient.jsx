"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SafeImage from "@/components/SafeImage";
import StickyScroll from "@/components/ui/sticky-scroll";
import { resolveMediaUrl, resolveMediaUrlForSize } from "@/lib/mediaUrl";

const SERVICE_FALLBACKS = {
    architecture: "/media/gateway-pasteur-bandung-main.png",
    interior: "/media/la-montana-apartment-main.png",
    management: "/media/the-mansion-main.png",
    construction: "/media/tod-poris-plawad-gallery-0.png",
    default: "/media/gateway-pasteur-bandung-main.png",
};

function getServiceFallback(service) {
    const title = String(service?.title || "").toLowerCase();
    const subtitle = String(service?.subtitle || "").toLowerCase();
    const text = `${title} ${subtitle}`;

    if (text.includes("interior")) return SERVICE_FALLBACKS.interior;
    if (text.includes("management")) return SERVICE_FALLBACKS.management;
    if (text.includes("construction")) return SERVICE_FALLBACKS.construction;
    if (text.includes("architecture") || text.includes("architect")) return SERVICE_FALLBACKS.architecture;

    return SERVICE_FALLBACKS.default;
}

const HERO_IMG = "/hero.jpg";
const HERO_INTERVAL = 15000; // 15 seconds

export default function HomeClient({ initialPortfolio, initialServices }) {
    const portfolio = initialPortfolio;
    const services = initialServices;
    const heroRef = useRef(null);
    const [heroIndex, setHeroIndex] = useState(0);

    // Subtle parallax on hero with mouse move
    useEffect(() => {
        const el = heroRef.current;
        if (!el) return;
        const getActiveImg = () => el.querySelector(".hero-img-active");

        let currentScrollY = window.scrollY;
        let ticking = false;

        const applyTransform = (img, transform) => { if (img) img.style.transform = transform; };

        if (currentScrollY > window.innerHeight * 0.2) {
            applyTransform(getActiveImg(), `scale(1.04) translateY(${currentScrollY * 0.12}px)`);
        } else {
            applyTransform(getActiveImg(), `scale(1.04) translate(0px, 0px)`);
        }

        let mouseX = 0;
        let mouseY = 0;
        let mouseAnimFrame = null;

        const updateMouseParallax = () => {
            const img = getActiveImg();
            if (!img || currentScrollY > window.innerHeight * 0.2) return;
            const moveX = mouseX * 2;
            const moveY = mouseY * 2;
            img.style.transform = `scale(1.04) translate(${moveX}px, ${moveY}px)`;
            mouseAnimFrame = null;
        };

        const onMouseMove = (e) => {
            if (currentScrollY > window.innerHeight * 0.2) return;
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const xPercent = (clientX / innerWidth - 0.5) * 2;
            const yPercent = (clientY / innerHeight - 0.5) * 2;
            mouseX = xPercent;
            mouseY = yPercent;
            if (!mouseAnimFrame) {
                mouseAnimFrame = requestAnimationFrame(updateMouseParallax);
            }
        };

        const updateScrollParallax = () => {
            const img = getActiveImg();
            if (!img) { ticking = false; return; }
            if (currentScrollY > window.innerHeight * 0.2) {
                const translateY = currentScrollY * 0.12;
                img.style.transform = `scale(1.04) translateY(${translateY}px)`;
            } else {
                img.style.transform = `scale(1.04) translate(0px, 0px)`;
            }
            ticking = false;
        };

        const onScroll = () => {
            currentScrollY = window.scrollY;
            if (!ticking) {
                requestAnimationFrame(updateScrollParallax);
                ticking = true;
            }
        };

        window.addEventListener("mousemove", onMouseMove, { passive: true });
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("scroll", onScroll);
            if (mouseAnimFrame) cancelAnimationFrame(mouseAnimFrame);
        };
    }, []);

    // ── Scroll-triggered animations via IntersectionObserver ──────────────────
    useEffect(() => {
        // Animate elements with .reveal class when they enter viewport
        const revealEls = document.querySelectorAll('.reveal');
        if (!revealEls.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );

        revealEls.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    // ── Stat counter animation ────────────────────────────────────────────────
    useEffect(() => {
        const counters = document.querySelectorAll('.stat-number[data-target]');
        if (!counters.length) return;

        const animateCounter = (el) => {
            const target = parseInt(el.getAttribute('data-target'), 10);
            const suffix = el.getAttribute('data-suffix') || '';
            const duration = 1800;
            const start = performance.now();

            const update = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(eased * target);
                el.textContent = current + suffix;
                if (progress < 1) requestAnimationFrame(update);
            };
            requestAnimationFrame(update);
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        counters.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const [featured, setFeatured] = useState(() => portfolio || []);

    useEffect(() => {
        // Randomize on client mount to prevent server hydration mismatches
        if (portfolio && portfolio.length > 0) {
            setFeatured([...portfolio].sort(() => Math.random() - 0.5));
        }
    }, [portfolio]);

    const [heroImages, setHeroImages] = useState(() => {
        const rawImages = featured.map((item) => resolveMediaUrl(item.imageFull || item.image)).filter(src => src && src !== "/edra-logo.png");
        const uniqueImages = Array.from(new Set(rawImages));
        return uniqueImages.length > 0 ? uniqueImages : [HERO_IMG];
    });

    // Rotate hero image every 15 seconds
    useEffect(() => {
        if (heroImages.length <= 1) return;
        const timer = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % heroImages.length);
        }, HERO_INTERVAL);
        return () => clearInterval(timer);
    }, [heroImages.length]);

    const scrollToProjects = () => {
        const projectsSection = document.querySelector('.home-focus-rail-section');
        if (projectsSection) {
            projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <>
            <Header />
            {/* ── HERO ── */}
            <section className="hero" ref={heroRef}>
                {heroImages.map((src, i) => (
                    <SafeImage
                        key={src}
                        className={`hero-img ${i === (heroIndex % heroImages.length) ? ' hero-img-active' : ''}`}
                        src={resolveMediaUrlForSize(src, 'full')}
                        fallbackSrc={HERO_IMG}
                        alt={`EDRA Architect project ${i + 1}`}
                        fill
                        sizes="100vw"
                        style={{ objectFit: "cover" }}
                        priority={i === 0}
                        loading={i === 0 ? "eager" : "lazy"}
                        unoptimized={true}
                        onError={() => {
                            setHeroImages(prev => {
                                const nextImages = prev.filter(img => img !== src);
                                return nextImages.length > 0 ? nextImages : [HERO_IMG];
                            });
                        }}
                    />
                ))}
                <div className="hero-shade" />
                <div className="hero-bottom">
                    <span className="hero-meta">EDRA Arsitek— Jakarta, Indonesia</span>
                    <span className="hero-meta" style={{ opacity: 0.5 }}>Est. 1999</span>
                </div>
                <button
                    className="hero-scroll"
                    onClick={scrollToProjects}
                    aria-label="Scroll down to projects"
                >
                    <span className="hero-scroll-text">Scroll Down</span>
                    <span className="hero-scroll-arrow">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5V19M12 19L19 12M12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </button>
            </section>

            {/* ── PROJECT GALLERY STICKY SCROLL ── */}
            {featured.length > 0 && (
                <section className="home-focus-rail-section">
                    <StickyScroll projects={featured} maxItems={13} />
                </section>
            )}

            {/* ── STATEMENT SECTION ── */}
            <section className="statement-section">
                <div className="container">
                    <h2 className="statement-main reveal reveal-up">
                        Innovative &amp; Inspiring Design Solutions
                    </h2>
                    <p className="statement-sub reveal reveal-up" style={{ transitionDelay: '0.15s' }}>
                        We Plan, Design Projects and Coordinate Construction for You
                    </p>
                </div>
            </section>

            {/* ── ABOUT SECTION ── */}
            <section className="home-about-section">
                <div className="home-about-container">
                    {/* Left Side - Content */}
                    <div className="home-about-content">
                        <div className="home-about-content-inner">
                            <div className="home-about-eyebrow reveal reveal-left">About EDRA</div>

                            <h2 className="home-about-title reveal reveal-up" style={{ transitionDelay: '0.1s' }}>
                                SHAPING INDONESIA&apos;S
                                <span className="title-highlight">ARCHITECTURAL</span>
                                LANDSCAPE
                            </h2>

                            <p className="home-about-lead reveal reveal-up" style={{ transitionDelay: '0.2s' }}>
                                Since 1999, PT. EDRA Arsitek Indonesia has been at the forefront
                                of architectural innovation, delivering projects that define spaces
                                and inspire communities.
                            </p>

                            <div className="home-about-principles">
                                {[
                                    { num: "01", title: "Design Excellence", desc: "Every project reflects our commitment to exceptional design and precision" },
                                    { num: "02", title: "Sustainable Innovation", desc: "Integrating environmental consciousness with cutting-edge solutions" },
                                    { num: "03", title: "Client Partnership", desc: "Collaborative approach ensuring vision becomes reality" },
                                ].map((p, i) => (
                                    <div className="principle-item reveal reveal-up" key={p.num} style={{ transitionDelay: `${0.1 * i + 0.3}s` }}>
                                        <div className="principle-icon">{p.num}</div>
                                        <div className="principle-text">
                                            <h4>{p.title}</h4>
                                            <p>{p.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link href="/about" className="home-about-cta reveal reveal-up" style={{ transitionDelay: '0.6s' }}>
                                <span>Explore Our Story</span>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Right Side - Stats & Image */}
                    <div className="home-about-visual reveal reveal-right">
                        <div className="home-about-image-wrapper">
                            <Image
                                src="/about-teaser.jpg"
                                alt="EDRA Architecture"
                                className="home-about-image"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                style={{ objectFit: "cover" }}
                                loading="lazy"
                                quality={100}
                            />
                            <div className="home-about-overlay"></div>
                        </div>

                        <div className="home-about-stats-card">
                            <div className="stats-grid">
                                <div className="stat-box">
                                    <div className="stat-number" data-target="25" data-suffix="+">25+</div>
                                    <div className="stat-label">Years<br />Experience</div>
                                </div>
                                <div className="stat-box">
                                    <div className="stat-number" data-target="200" data-suffix="+">200+</div>
                                    <div className="stat-label">Completed<br />Projects</div>
                                </div>
                                <div className="stat-box">
                                    <div className="stat-number" data-target="50" data-suffix="+">50+</div>
                                    <div className="stat-label">Expert<br />Team Members</div>
                                </div>
                                <div className="stat-box">
                                    <div className="stat-number" data-target="15" data-suffix="+">15+</div>
                                    <div className="stat-label">Industry<br />Awards</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SERVICES TEASER ── */}
            <section className="home-services-section">
                <div className="container">
                    <h2 className="section-title reveal reveal-up">Our Services</h2>
                    <div className="home-services-grid">
                        {(services || []).slice(0, 3).map((service, i) => {
                            const fallback = getServiceFallback(service);
                            const originalSrc = resolveMediaUrl(service.image);
                            const imageSrc = resolveMediaUrlForSize(service.image, 'card');
                            const displaySrc = originalSrc === "/edra-logo.png" ? fallback : imageSrc;

                            return (
                            <div className="home-service-card modern reveal reveal-up" key={service.id} style={{ transitionDelay: `${i * 0.15}s` }}>
                                <div className="home-service-bg">
                                    <SafeImage
                                        src={displaySrc}
                                        fallbackSrc={fallback}
                                        alt={service.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        style={{ objectFit: "cover" }}
                                        loading="lazy"
                                        quality={100}
                                    />
                                </div>
                                <div className="home-service-overlay" />
                                <div className="home-service-content relative-content">
                                    <h3 className="home-service-title">{service.title}</h3>
                                    <p className="home-service-description">{service.description}</p>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                    <div className="home-services-button-wrapper reveal reveal-up" style={{ transitionDelay: '0.45s' }}>
                        <Link href="/services" className="liquid-glass-button">
                            <span>View All Services</span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 8H15M15 8L8 1M15 8L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── CLIENT LOGOS CAROUSEL ── */}
            <section className="clients-carousel-section reveal reveal-up">
                <div className="clients-carousel-wrapper">
                    <div className="clients-carousel-track">
                                        {(() => {
                            const clients = [
                                { name: "PILAR ARTHA MANDIRI", logo: "/client-4.png" },
                                { name: "BINAKARYA PROPERTINDO GROUP", logo: "/client-5.png" },
                                { name: "PT. ANUGRAH DUTA MANDIRI", logo: "/client-1.png" },
                                { name: "MEGAKARYA PROPERTI GROUP", logo: "/client-2.png" },
                                { name: "RURARAHA DEVELOPMENT", logo: "/client-3.png" },
                                { name: "NEW CLIENT", logo: "/client-6.png" },
                                { name: "NEW CLIENT", logo: "/client-7.png" },
                                { name: "NEW CLIENT", logo: "/client-8.png" },
                            ];
                            return [...clients, ...clients, ...clients, ...clients].map((client, index) => (
                                <div className="client-logo-item" key={index}>
                                    <Image src={client.logo} alt={client.name} width={150} height={100} style={{ objectFit: "contain" }} loading="lazy" quality={60} />
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            </section>

            {/* ── PROJECT CTA ── */}
            <section className="project-cta-section">
                <div className="project-cta-background">LET&apos;S TALK</div>
                <div className="project-cta-content reveal reveal-up">
                    <h2 className="project-cta-title">
                        ABOUT<br />YOUR PROJECT!
                    </h2>
                    <Link href="/contact" className="project-cta-button">
                        SEND REQUEST
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 8H15M15 8L8 1M15 8L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                </div>
            </section>
            <Footer />
        </>
    );
}
