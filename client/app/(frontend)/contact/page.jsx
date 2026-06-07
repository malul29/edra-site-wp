"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", organization: "", service: "", message: "" });
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

    return (
        <>
            <Header />

            <div className="ds-contact">

                {/* ── HERO: Big headline + sidebar ── */}
                <section className="ds-contact-hero">
                    <div className="ds-contact-hero-inner">
                        {/* Left: Big heading */}
                        <div className="ds-contact-hero-left">
                            <h1 className="ds-contact-heading">
                                Let's start a<br />
                                project together
                            </h1>
                        </div>

                        {/* Right: Contact details */}
                        <div className="ds-contact-hero-right">
                            <div className="ds-contact-photo-wrap">
                                <Image
                                    src="/edra-logo.png"
                                    alt="EDRA Arsitek"
                                    width={80}
                                    height={80}
                                    style={{
                                        objectFit: "contain",
                                        filter: "brightness(0) invert(1)",
                                    }}
                                />
                            </div>
                            <div className="ds-contact-details">
                                <div className="ds-contact-detail-row">
                                    <span className="ds-contact-detail-label">Business inquiries</span>
                                    <a href="mailto:admin@edraarsitek.co.id" className="ds-contact-detail-value ds-link">
                                        admin@edraarsitek.co.id
                                    </a>
                                </div>
                                <div className="ds-contact-detail-row">
                                    <span className="ds-contact-detail-label">Location</span>
                                    <span className="ds-contact-detail-value">Jakarta, Indonesia</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── FORM SECTION ── */}
                <section className="ds-contact-form-section">
                    <div className="ds-contact-form-inner">
                        {sent ? (
                            <div className="ds-contact-success">
                                <h3>Thank you!</h3>
                                <p>We've received your message and will get back to you within 1–2 business days.</p>
                            </div>
                        ) : (
                            <form className="ds-contact-form" onSubmit={submit}>

                                {/* 01 — Name */}
                                <div className="ds-form-group">
                                    <span className="ds-form-index">01</span>
                                    <div className="ds-form-field">
                                        <label htmlFor="ds-name">What's your name?</label>
                                        <input
                                            id="ds-name"
                                            name="name"
                                            required
                                            placeholder="John Doe *"
                                            value={form.name}
                                            onChange={handle}
                                            autoComplete="name"
                                        />
                                    </div>
                                </div>

                                {/* 02 — Email */}
                                <div className="ds-form-group">
                                    <span className="ds-form-index">02</span>
                                    <div className="ds-form-field">
                                        <label htmlFor="ds-email">What's your email?</label>
                                        <input
                                            id="ds-email"
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="john@example.com *"
                                            value={form.email}
                                            onChange={handle}
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                {/* 03 — Organization */}
                                <div className="ds-form-group">
                                    <span className="ds-form-index">03</span>
                                    <div className="ds-form-field">
                                        <label htmlFor="ds-org">What's the name of your organization?</label>
                                        <input
                                            id="ds-org"
                                            name="organization"
                                            placeholder="Company name"
                                            value={form.organization}
                                            onChange={handle}
                                            autoComplete="organization"
                                        />
                                    </div>
                                </div>

                                {/* 04 — Service */}
                                <div className="ds-form-group">
                                    <span className="ds-form-index">04</span>
                                    <div className="ds-form-field">
                                        <label htmlFor="ds-service">What services are you looking for?</label>
                                        <select
                                            id="ds-service"
                                            name="service"
                                            value={form.service}
                                            onChange={handle}
                                        >
                                            <option value="">Select a service…</option>
                                            <option>Architecture Design</option>
                                            <option>Interior Design</option>
                                            <option>Project Management</option>
                                            <option>Construction</option>
                                        </select>
                                    </div>
                                </div>

                                {/* 05 — Message */}
                                <div className="ds-form-group">
                                    <span className="ds-form-index">05</span>
                                    <div className="ds-form-field">
                                        <label htmlFor="ds-message">Your message</label>
                                        <textarea
                                            id="ds-message"
                                            name="message"
                                            required
                                            placeholder="Hello EDRA, can you help me with ... *"
                                            value={form.message}
                                            onChange={handle}
                                            rows="4"
                                        />
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="ds-form-submit-row">
                                    <button
                                        type="submit"
                                        className="ds-send-btn"
                                        disabled={submitting}
                                    >
                                        <span className="ds-send-btn-text">
                                            {submitting ? "Sending…" : "Send it!"}
                                        </span>
                                    </button>
                                </div>
                                {error && (
                                    <p style={{ color: "#e74c3c", marginTop: "1rem", fontSize: "0.9rem" }}>
                                        {error}
                                    </p>
                                )}
                            </form>
                        )}
                    </div>
                </section>

                {/* ── BOTTOM: Socials ── */}
                <section className="ds-contact-bottom">
                    <div className="ds-contact-bottom-inner">
                        <div className="ds-contact-bottom-left">
                            <span className="ds-contact-bottom-label">Socials</span>
                            <div className="ds-contact-socials">
                                <a href="https://instagram.com/edra.architect" target="_blank" rel="noopener noreferrer">Instagram</a>
                                <a href="https://linkedin.com/company/pt-edra-arsitek-indonesia" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                                <a href="https://facebook.com/edra.architects" target="_blank" rel="noopener noreferrer">Facebook</a>
                                <a href="https://youtube.com/@edraarchitect" target="_blank" rel="noopener noreferrer">YouTube</a>
                            </div>
                        </div>
                    </div>
                </section>

            </div>

            <Footer />
        </>
    );
}
