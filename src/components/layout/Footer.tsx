import React from 'react';
import Link from 'next/link';
import { Heart, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logo}>
              <Heart fill="var(--primary)" color="var(--primary)" size={24} />
              <span className={styles.logoText}>SakhiHub</span>
            </Link>
            <p className={styles.tagline}>Empowering Women Across India</p>
            <p className={styles.description}>
              SakhiHub is a dedicated platform for women's health, awareness, education, and self-reliance.
            </p>
            <div className={styles.socials}>
              <a href="#" className={styles.socialLink}><MessageCircle size={20} /></a>
              {/* Add more social links as needed */}
            </div>
          </div>

          <div className={styles.linksCol}>
            <h3>Quick Links</h3>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/mission">Our Mission</Link></li>
              <li><Link href="/vision">Our Vision</Link></li>
              <li><Link href="/programs">Programs</Link></li>
              <li><Link href="/gallery">Gallery</Link></li>
            </ul>
          </div>

          <div className={styles.linksCol}>
            <h3>Opportunities</h3>
            <ul>
              <li><Link href="/hiring">Join as Block Employee</Link></li>
              <li><Link href="/delivery-partner">Become Delivery Partner</Link></li>
              <li><Link href="/partner">NGO Partnership</Link></li>
              <li><Link href="/register">Volunteer Registration</Link></li>
            </ul>
          </div>

          <div className={styles.contactCol}>
            <h3>Contact Us</h3>
            <div className={styles.contactInfo}>
              <div className={styles.infoItem}>
                <Phone size={18} />
                <a href="tel:8076611842">8076611842</a>
              </div>
              <div className={styles.infoItem}>
                <MessageCircle size={18} />
                <a href="https://wa.me/918076611842">WhatsApp Support</a>
              </div>
              <div className={styles.infoItem}>
                <Mail size={18} />
                <a href="mailto:info@sakhihub.com">info@sakhihub.com</a>
              </div>
              <div className={styles.infoItem}>
                <MapPin size={18} />
                <span>India - Village Outreach Network</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.bottomBar}>
          <p>© {new Date().getFullYear()} SakhiHub. All rights reserved.</p>
          <div className={styles.bottomLinks}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
