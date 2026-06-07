"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", organization: "", service: "", message: "" });
    const [sent, setSent] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [focusedInput, setFocusedInput] = useState(null);

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

            <main className="contact-redesign-page">
                <div className="contact-redesign-container">
                    
                    {/* LEFT COLUMN: Info */}
                    <div className="contact-info-col">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="contact-info-sticky"
                        >
                            <div className="contact-eyebrow">Get in touch</div>
                            <h1 className="contact-main-heading">
                                LET'S START A<br />
                                <span className="text-highlight">PROJECT</span><br />
                                TOGETHER
                            </h1>

                            <div className="contact-details-grid">
                                <div className="contact-detail-item">
                                    <span className="contact-detail-label">Business Inquiries</span>
                                    <a href="mailto:admin@edraarsitek.co.id" className="contact-detail-value link-hover">
                                        admin@edraarsitek.co.id
                                    </a>
                                </div>
                                <div className="contact-detail-item">
                                    <span className="contact-detail-label">Location</span>
                                    <span className="contact-detail-value">Jakarta, Indonesia</span>
                                </div>
                            </div>

                            <div className="contact-socials">
                                <span className="contact-detail-label">Socials</span>
                                <div className="contact-social-links">
                                    <a href="https://instagram.com/edra.architect" target="_blank" rel="noopener noreferrer" className="link-hover">Instagram</a>
                                    <a href="https://linkedin.com/company/pt-edra-arsitek-indonesia" target="_blank" rel="noopener noreferrer" className="link-hover">LinkedIn</a>
                                    <a href="https://facebook.com/edra.architects" target="_blank" rel="noopener noreferrer" className="link-hover">Facebook</a>
                                    <a href="https://youtube.com/@edraarchitect" target="_blank" rel="noopener noreferrer" className="link-hover">YouTube</a>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN: Form */}
                    <div className="contact-form-col">
                        <motion.div 
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="contact-form-wrapper"
                        >
                            {sent ? (
                                <div className="contact-success-message">
                                    <div className="success-icon">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                            <path d="M20 6L9 17L4 12" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <h3>Message Received</h3>
                                    <p>Thank you for reaching out. We will get back to you within 1-2 business days.</p>
                                </div>
                            ) : (
                                <form className="contact-premium-form" onSubmit={submit}>
                                    
                                    <div className={`form-input-group ${focusedInput === 'name' || form.name ? 'has-value' : ''}`}>
                                        <span className="form-num">01</span>
                                        <div className="form-input-wrap">
                                            <label htmlFor="name">What's your name?</label>
                                            <input
                                                id="name"
                                                name="name"
                                                required
                                                placeholder="John Doe *"
                                                value={form.name}
                                                onChange={handle}
                                                onFocus={() => setFocusedInput('name')}
                                                onBlur={() => setFocusedInput(null)}
                                            />
                                        </div>
                                    </div>

                                    <div className={`form-input-group ${focusedInput === 'email' || form.email ? 'has-value' : ''}`}>
                                        <span className="form-num">02</span>
                                        <div className="form-input-wrap">
                                            <label htmlFor="email">What's your email?</label>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                required
                                                placeholder="john@example.com *"
                                                value={form.email}
                                                onChange={handle}
                                                onFocus={() => setFocusedInput('email')}
                                                onBlur={() => setFocusedInput(null)}
                                            />
                                        </div>
                                    </div>

                                    <div className={`form-input-group ${focusedInput === 'org' || form.organization ? 'has-value' : ''}`}>
                                        <span className="form-num">03</span>
                                        <div className="form-input-wrap">
                                            <label htmlFor="org">Organization name</label>
                                            <input
                                                id="org"
                                                name="organization"
                                                placeholder="Company name"
                                                value={form.organization}
                                                onChange={handle}
                                                onFocus={() => setFocusedInput('org')}
                                                onBlur={() => setFocusedInput(null)}
                                            />
                                        </div>
                                    </div>

                                    <div className={`form-input-group ${focusedInput === 'service' || form.service ? 'has-value' : ''}`}>
                                        <span className="form-num">04</span>
                                        <div className="form-input-wrap">
                                            <label htmlFor="service">Services you're looking for?</label>
                                            <select
                                                id="service"
                                                name="service"
                                                value={form.service}
                                                onChange={handle}
                                                onFocus={() => setFocusedInput('service')}
                                                onBlur={() => setFocusedInput(null)}
                                            >
                                                <option value="" disabled>Select a service…</option>
                                                <option value="Architecture Design">Architecture Design</option>
                                                <option value="Interior Design">Interior Design</option>
                                                <option value="Project Management">Project Management</option>
                                                <option value="Construction">Construction</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className={`form-input-group ${focusedInput === 'message' || form.message ? 'has-value' : ''}`}>
                                        <span className="form-num">05</span>
                                        <div className="form-input-wrap">
                                            <label htmlFor="message">Your message</label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                required
                                                placeholder="Tell us about your project... *"
                                                value={form.message}
                                                onChange={handle}
                                                onFocus={() => setFocusedInput('message')}
                                                onBlur={() => setFocusedInput(null)}
                                                rows="3"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-submit-row">
                                        <button 
                                            type="submit" 
                                            className="liquid-glass-button"
                                            disabled={submitting}
                                            style={{ minWidth: '180px', justifyContent: 'center' }}
                                        >
                                            <span>{submitting ? "SENDING..." : "SEND REQUEST"}</span>
                                            {!submitting && (
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                    <path d="M1 8H15M15 8L8 1M15 8L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </button>
                                        {error && <div className="form-error-msg">{error}</div>}
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>

                </div>
            </main>

            <Footer />
        </>
    );
}
