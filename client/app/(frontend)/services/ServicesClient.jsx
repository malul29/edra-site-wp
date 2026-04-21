"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SafeImage from "@/components/SafeImage";
import { resolveMediaUrl } from "@/lib/mediaUrl";

// Reliable local fallback images committed to git
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

export default function ServicesClient({ services }) {
    return (
        <>
            <Header />
            {/* Hero Section */}
            <section className="services-hero">
                <div className="services-hero-content">
                    <p className="services-hero-label">WHAT WE DO</p>
                    <h1 className="services-hero-title">OUR SERVICE</h1>
                </div>
            </section>

            {/* Services Grid */}
            <section className="services-main-section">
                <div className="services-main-intro">
                    <div className="services-intro-content">
                        <h2 className="services-intro-title">COMPREHENSIVE EXPERTISE</h2>
                        <p className="services-intro-text">
                            A curated set of architecture and project services designed to move from bold ideas
                            into buildable, high-performing spaces.
                        </p>
                    </div>
                </div>

                <div className="services-container">
                    <div className="services-stack">
                        {services.map((service, index) => {
                            const features = (service.features || [])
                                .map((feat) => (typeof feat === "object" ? feat.feature : feat))
                                .filter(Boolean)
                                .slice(0, 4);

                            const fallback = getServiceFallback(service);
                            const imageSrc = resolveMediaUrl(service.image);
                            const displaySrc = imageSrc === "/edra-logo.png" ? fallback : imageSrc;

                            return (
                                <article key={service.id} className="service-panel">
                                    <div className="service-panel-media">
                                        <SafeImage
                                            src={displaySrc}
                                            fallbackSrc={fallback}
                                            alt={service.title}
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 48vw"
                                            style={{ objectFit: "cover" }}
                                            loading="lazy"
                                            quality={75}
                                        />
                                        <div className="service-panel-media-overlay"></div>
                                        <div className="service-panel-index">{String(index + 1).padStart(2, "0")}</div>
                                    </div>

                                    <div className="service-panel-body">
                                        <p className="service-panel-kicker">Service {String(index + 1).padStart(2, "0")}</p>
                                        <h3 className="service-panel-title">{service.title}</h3>
                                        <p className="service-panel-description">{service.description}</p>

                                        {features.length > 0 && (
                                            <ul className="service-panel-tags">
                                                {features.map((feature, idx) => (
                                                    <li key={idx} className="service-panel-tag">{feature}</li>
                                                ))}
                                            </ul>
                                        )}

                                        <Link href="/contact" className="service-panel-cta">
                                            Start a Project
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 8H15M15 8L8 1M15 8L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="services-process-section">
                <div className="services-container">
                    <h2 className="services-process-title">HOW WE WORK</h2>
                    <div className="services-process-grid">
                        {["Brief & Research", "Concept", "Design Development", "Documentation", "Construction"].map((step, i) => (
                            <div key={step} className="process-step">
                                <div className="process-step-number">{String(i + 1).padStart(2, "0")}</div>
                                <h3 className="process-step-title">{step}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Project CTA */}
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
            <Footer />
        </>
    );
}
