import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="main-footer">
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-brand">
              <Link href="/" className="footer-logo-link">
                <Image src="/edra-logo.png" alt="EDRA Arsitek Indonesia" className="footer-logo" width={120} height={40} loading="lazy" />
              </Link>
              <p className="footer-tagline">
                SHAPING INDONESIA'S ARCHITECTURAL LANDSCAPE FOR OVER 25 YEARS
              </p>
              <div className="footer-social">
                <a href="https://instagram.com/edra.architect" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                    <circle cx="18" cy="6" r="1" fill="currentColor" />
                  </svg>
                </a>
                <a href="https://linkedin.com/company/pt-edra-arsitek-indonesia" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </a>
                <a href="https://facebook.com/edra.architects" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a href="https://youtube.com/@edraarchitect" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="YouTube">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.75 15.02l5.75-3.27-5.75-3.27v6.54z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a href="mailto:admin@edraarsitek.co.id" className="social-link" aria-label="Email">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-column">
              <h4 className="footer-column-title">EXPLORE</h4>
              <nav className="footer-nav">
                <Link href="/about">About Us</Link>
                <Link href="/services">Services</Link>
                <Link href="/portfolio">Portfolio</Link>
                <Link href="/projects">Projects</Link>
                <Link href="/blogs">Insights</Link>
                <Link href="/contact">Contact</Link>
              </nav>
            </div>

            {/* Services */}
            <div className="footer-column">
              <h4 className="footer-column-title">SERVICES</h4>
              <nav className="footer-nav">
                <span>Architecture Design</span>
                <span>Project Management</span>
                <span>Construction Services</span>
                <span>Interior Design</span>
                <span>Consultation</span>
              </nav>
            </div>

            {/* Contact */}
            <div className="footer-column">
              <h4 className="footer-column-title">CONTACT</h4>
              <div className="footer-contact">
                <div className="contact-item">
                  <span className="contact-label">Office</span>
                  <p>Jakarta, Indonesia</p>
                </div>
                <div className="contact-item">
                  <span className="contact-label">Email</span>
                  <a href="mailto:admin@edraarsitek.co.id">admin@edraarsitek.co.id</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {new Date().getFullYear()} PT. EDRA Arsitek Indonesia. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
