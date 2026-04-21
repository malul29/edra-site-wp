"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", service: "", message: "" });
    const [sent, setSent] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to submit");
            }
            setSent(true);
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Scroll to main section if hash is present
    useEffect(() => {
        if (window.location.hash === '#main') {
            setTimeout(() => {
                const contactMain = document.querySelector('.contact-main');
                if (contactMain) {
                    contactMain.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }, []);

    return (
        <>
            <Header />
            {/* Hero Section */}
            <section className="contact-hero">
                <div className="container">
                    <h1 className="contact-hero-title">
                        LET'S CREATE<br />
                        SOMETHING GREAT<br />
                        TOGETHER
                    </h1>
                </div>
            </section>

            {/* Main Contact Section */}
            <section className="contact-main">
                <div className="contact-grid">
                    {/* Left: Contact Information — Dark Premium Panel */}
                    <div className="contact-info-wrapper">

                        {/* Top eyebrow */}
                        <p className="git-eyebrow">Get in touch</p>

                        {/* Bold headline */}
                        <h2 className="git-title">
                            Let's build<br />something<br />remarkable.
                        </h2>

                        {/* Sub-copy */}
                        <p className="git-sub">
                            We respond to all enquiries within 1–2 business days. Reach out — we'd love to hear about your project.
                        </p>

                        {/* Info rows */}
                        <div className="git-rows">

                            {/* Address */}
                            <div className="git-row">
                                <span className="git-row-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                                        <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                                    </svg>
                                </span>
                                <div className="git-row-content">
                                    <span className="git-row-label">Head Office</span>
                                    <span className="git-row-value">Jakarta, Indonesia</span>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="git-row">
                                <span className="git-row-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                <div className="git-row-content">
                                    <span className="git-row-label">Email</span>
                                    <a href="mailto:admin@edraarsitek.co.id" className="git-row-value git-link">admin@edraarsitek.co.id</a>
                                </div>
                            </div>

                        </div>

                        {/* Social icons */}
                        <div className="git-social">
                            <span className="git-social-label">Follow us</span>
                            <div className="git-social-icons">
                                <a href="https://instagram.com/edra.architect" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="git-social-btn">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
                                        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                                        <circle cx="18" cy="6" r="1" fill="currentColor" />
                                    </svg>
                                </a>
                                <a href="https://linkedin.com/company/pt-edra-arsitek-indonesia" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="git-social-btn">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </a>
                                <a href="https://facebook.com/edra.architects" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="git-social-btn">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </a>
                                <a href="https://youtube.com/@edraarchitect" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="git-social-btn">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M9.75 15.02l5.75-3.27-5.75-3.27v6.54z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                    </div>


                    {/* Right: Contact Form */}
                    <div className="contact-form-wrapper">
                        {sent ? (
                            <div className="contact-success">
                                <h3>Thank You!</h3>
                                <p>We've received your message and will get back to you within 1–2 business days.</p>
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={submit}>
                                <div className="form-field">
                                    <label>Full Name *</label>
                                    <input
                                        name="name"
                                        required
                                        placeholder="John Doe"
                                        value={form.name}
                                        onChange={handle}
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Email Address *</label>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="john@example.com"
                                        value={form.email}
                                        onChange={handle}
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Service Interest</label>
                                    <select name="service" value={form.service} onChange={handle}>
                                        <option value="">Select a service…</option>
                                        <option>Architecture Design</option>
                                        <option>Interior Design</option>
                                        <option>Project Management</option>
                                        <option>Construction</option>
                                        <option>Consultation</option>
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label>Project Details *</label>
                                    <textarea
                                        name="message"
                                        required
                                        placeholder="Tell us about your project, timeline, and budget expectations…"
                                        value={form.message}
                                        onChange={handle}
                                        rows="6"
                                    />
                                </div>

                                <button type="submit" className="btn-submit-contact" disabled={submitting}>
                                    {submitting ? "Submitting…" : "Submit Inquiry"}
                                </button>
                                {error && <p style={{ color: "#e74c3c", marginTop: "1rem", fontSize: "0.9rem" }}>{error}</p>}
                            </form>
                        )}
                    </div>
                </div>
            </section>

            {/* Location Section — Creative Typographic */}
            <section className="contact-location-section">
                <div className="contact-location-inner">

                    {/* Top rule + label */}
                    <div className="cloc-top">
                        <span className="cloc-rule" />
                        <span className="cloc-label">Our Location</span>
                        <span className="cloc-rule" />
                    </div>

                    {/* Big city name */}
                    <div className="cloc-city-wrap">
                        <span className="cloc-city">Jakarta</span>
                        <span className="cloc-dot-marker">
                            <span className="cloc-dot-core" />
                            <span className="cloc-dot-ring" />
                        </span>
                    </div>

                    {/* Country + coordinates */}
                    <div className="cloc-meta">
                        <span className="cloc-country">Indonesia</span>
                        <span className="cloc-sep" />
                        <span className="cloc-coords">6°12′S &nbsp; 106°50′E</span>
                    </div>

                    {/* Address line */}
                    <p className="cloc-address">
                        Jakarta, Indonesia
                    </p>

                    {/* Decorative large coordinates watermark */}
                    <div className="cloc-watermark" aria-hidden="true">
                        −6.2088° / 106.8456°
                    </div>

                </div>
            </section>
            <Footer />
        </>
    );
}
