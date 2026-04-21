"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutPage() {
    const sectionRef = useRef(null);
    const textGroupRef = useRef(null);
    const leftPersonRef = useRef(null);
    const rightPersonRef = useRef(null);
    const paragraphRef = useRef(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        
        let mm = gsap.matchMedia();

        mm.add("(min-width: 769px)", () => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "center center",
                    end: "+=150%",
                    scrub: 1,
                    pin: true,
                }
            });

            // Move entire text group (OUR + PROFESSIONAL) up together
            tl.to(textGroupRef.current, {
                yPercent: -60,
                scale: 0.5,
            }, 0);

            tl.to(leftPersonRef.current, {
                xPercent: -40,
            }, 0);

            tl.to(rightPersonRef.current, {
                xPercent: 40,
            }, 0);

            tl.to(paragraphRef.current, {
                opacity: 1,
                y: 0,
            }, 0.3);

            return () => tl.kill();
        });

        return () => mm.revert();
    }, []);

    return (
        <>
            <Header />
            <div className="about-page-redesign">

                {/* ── HERO ── */}
                <section className="about-redesign-hero">
                    <div className="about-redesign-hero-content">
                        <p className="section-label">About EDRA</p>
                        <h1 className="about-redesign-hero-title">
                            Shaping Indonesia's<br />
                            Built Environment<br />
                            <span className="highlight">for 25+ Years</span>
                        </h1>
                    </div>
                    <div className="about-redesign-hero-watermark">EDRA</div>
                </section>

                {/* ── STORY ── */}
                <section className="about-redesign-story">
                    <div className="container">
                        <div className="about-redesign-story-wrapper">
                            {/* Decorative Text */}
                            <div className="about-redesign-story-deco" aria-hidden="true">
                                STORY
                            </div>
                            
                            {/* Content Grid */}
                            <div className="about-redesign-story-content">
                                {/* Image Column */}
                                <div className="about-redesign-story-image-wrap">
                                    <div className="about-redesign-story-image-accent"></div>
                                    <div className="about-redesign-story-image-frame">
                                        <Image
                                            src="/about-teaser.jpg"
                                            alt="PT EDRA Arsitek Indonesia Story"
                                            fill
                                            style={{ objectFit: "cover" }}
                                            sizes="(max-width: 992px) 100vw, 50vw"
                                        />
                                    </div>
                                </div>
                                
                                {/* Text Column */}
                                <div className="about-redesign-story-text">
                                    <h2 className="about-redesign-story-title">
                                        Architectural Excellence<br />
                                        <span>Since 1999</span>
                                    </h2>
                                    <div className="about-redesign-story-divider"></div>
                                    <p className="lead">
                                        PT. EDRA Arsitek Indonesia has been at the forefront of architectural excellence
                                        for over 25 years, transforming ideas into iconic spaces across Indonesia.
                                    </p>
                                    <p>
                                        PT. EDRA Arsitek Indonesia was established in 1999 as an architect studio.
                                        With 25+ years of experience, we provide comprehensive services in
                                        planning, concept design, project supervision, tender, and construction across
                                        real estate, apartments, hotels, malls, office buildings, and land area utilization.
                                    </p>
                                    <p>
                                        Led by experienced professionals, our team combines technical expertise with creative
                                        vision. We are committed to delivering every creation as a masterpiece, maintaining
                                        professionalism and earning our clients' trust through exceptional work.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── STATS ── */}
                <section className="about-redesign-stats">
                    <div className="container">
                        <div className="about-redesign-stats-grid">
                            <div className="about-redesign-stat-card">
                                <div className="about-redesign-stat-number">25+</div>
                                <div className="about-redesign-stat-label">Years of Excellence</div>
                                <p>Over two decades of architectural innovation</p>
                            </div>
                            <div className="about-redesign-stat-card">
                                <div className="about-redesign-stat-number">200+</div>
                                <div className="about-redesign-stat-label">Projects Delivered</div>
                                <p>Across residential, commercial, and public sectors</p>
                            </div>
                            <div className="about-redesign-stat-card">
                                <div className="about-redesign-stat-number">50+</div>
                                <div className="about-redesign-stat-label">Expert Team</div>
                                <p>Architects, designers, and project managers</p>
                            </div>
                            <div className="about-redesign-stat-card">
                                <div className="about-redesign-stat-number">15+</div>
                                <div className="about-redesign-stat-label">Cities Served</div>
                                <p>Building communities nationwide</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── ACHIEVEMENTS ── */}
                <section className="about-redesign-services">
                    <div className="container">
                        <div className="about-redesign-services-header">
                            <h2>What We Have Done</h2>
                            <p>Delivering exceptional projects across diverse sectors throughout Indonesia</p>
                        </div>
                        <div className="about-redesign-services-grid">
                            <div className="about-redesign-service-card">
                                <div className="about-redesign-service-icon">01</div>
                                <h3>High-Rise Buildings</h3>
                                <p>
                                    Successfully completed numerous residential towers, commercial office buildings,
                                    and mixed-use developments. Our portfolio includes iconic structures that define
                                    city skylines across Indonesia.
                                </p>
                            </div>
                            <div className="about-redesign-service-card">
                                <div className="about-redesign-service-icon">02</div>
                                <h3>Luxury Residences</h3>
                                <p>
                                    Designed and built premium villas, high-end apartments, and exclusive residential
                                    estates. Each project showcases our commitment to craftsmanship and attention
                                    to detail.
                                </p>
                            </div>
                            <div className="about-redesign-service-card">
                                <div className="about-redesign-service-icon">03</div>
                                <h3>Hospitality Projects</h3>
                                <p>
                                    Delivered world-class hotels, resorts, and boutique accommodations that blend
                                    functionality with memorable guest experiences. Creating spaces that inspire
                                    and welcome.
                                </p>
                            </div>
                            <div className="about-redesign-service-card">
                                <div className="about-redesign-service-icon">04</div>
                                <h3>Public Facilities</h3>
                                <p>
                                    Developed institutional buildings, community centers, and civic spaces that serve
                                    the public good. Infrastructure that strengthens communities and enhances quality
                                    of life.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── VALUES ── */}
                <section className="about-redesign-values">
                    <div className="about-redesign-values-container">
                        <h2 className="about-redesign-values-title">Our Core Values</h2>
                        <div className="about-redesign-values-grid">
                            <div className="about-redesign-value-item">
                                <h3>Excellence</h3>
                                <p>We pursue the highest standards in every aspect of our work, never settling for mediocrity.</p>
                            </div>
                            <div className="about-redesign-value-item">
                                <h3>Innovation</h3>
                                <p>We embrace new technologies and methods while respecting timeless design principles.</p>
                            </div>
                            <div className="about-redesign-value-item">
                                <h3>Integrity</h3>
                                <p>We build lasting relationships through transparency, honesty, and ethical practices.</p>
                            </div>
                            <div className="about-redesign-value-item">
                                <h3>Sustainability</h3>
                                <p>We design for longevity and environmental responsibility in every project we undertake.</p>
                            </div>
                        </div>
                    </div>
                </section>
                {/* ── TEAM ── */}
                <section className="team-hero-section" ref={sectionRef}>
                    <div className="team-hero-images">
                        <div className="team-hero-person" ref={leftPersonRef}>
                            <Image src="/Megawati Nyonri.png" alt="Ar. Megawati Nyonri" fill sizes="(max-width: 768px) 80vw, 30vw" style={{ objectFit: "contain", objectPosition: "bottom" }} />
                            <div className="team-hero-info">
                                <h3>Ar. Megawati Nyonri</h3>
                                <p>President Director</p>
                            </div>
                        </div>
                        <div className="team-hero-person" ref={rightPersonRef}>
                            <Image src="/Ning Widyastuti.png" alt="Ning Widyastuti" fill sizes="(max-width: 768px) 80vw, 30vw" style={{ objectFit: "contain", objectPosition: "bottom" }} />
                            <div className="team-hero-info">
                                <h3>Ning Widyastuti</h3>
                                <p>Operational Director</p>
                            </div>
                        </div>
                    </div>
                    <div className="team-hero-text-group" ref={textGroupRef}>
                        <span className="team-hero-bg-text" aria-hidden="true">OUR</span>
                        <h2 className="team-hero-fg-text">PROFESSIONAL</h2>
                        <div className="team-hero-paragraph" ref={paragraphRef}>
                            <p>
                                We create spaces that enrich lives and inspire emotions, blending form, function, and storytelling
                                to craft experiences that resonate deeply with each space and its inhabitants.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── PROJECT CTA ── */}
                <section className="project-cta-section">
                    <div className="project-cta-background">LET'S TALK</div>
                    <div className="project-cta-content">
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

            </div>
            <Footer />
        </>
    );
}
