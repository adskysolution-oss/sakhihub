import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, MessageCircle, Globe, Camera, Play, Send, Heart } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* Newsletter Section */}
      <div className={styles.newsletterSection}>
        <div className="container">
          <div className={styles.newsletterBox}>
            <div className={styles.newsletterContent}>
              <h3>Stay Connected with SakhiHub</h3>
              <p>Receive updates about our ground-level awareness drives and empowerment programs.</p>
            </div>
            <div className={styles.newsletterForm}>
              <input type="text" placeholder="Enter your mobile/email" />
              <button className="btn-primary">
                <span>Subscribe</span>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.grid}>
          {/* Column 1: Brand */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logo}>
               <div style={{ background: 'white', padding: '10px', borderRadius: '12px', display: 'inline-block', marginBottom: '20px' }}>
                 <img src="/logo.png" alt="SakhiHub Logo" style={{ height: '50px', width: 'auto' }} />
               </div>
            </Link>
            <h4 className={styles.footerTagline}>Empowering Women, Building Futures</h4>
            <p className={styles.description}>
              SakhiHub is a women empowerment platform working for health awareness, education, community building and self-reliance across India.
            </p>
            <div className={styles.socials}>
              <a href="#" className={styles.socialLink}><Globe size={18} /></a>
              <a href="#" className={styles.socialLink}><Camera size={18} /></a>
              <a href="#" className={styles.socialLink}><Play size={18} /></a>
              <a href="https://wa.me/918076611842" className={styles.socialLink}><MessageCircle size={18} /></a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className={styles.linksCol}>
            <h3 className={styles.colTitle}>Quick Links</h3>
            <ul className={styles.linkList}>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/mission">Our Mission</Link></li>
              <li><Link href="/programs">Programs</Link></li>
              <li><Link href="/gallery">Gallery</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Opportunities */}
          <div className={styles.linksCol}>
            <h3 className={styles.colTitle}>Opportunities</h3>
            <ul className={styles.linkList}>
              <li><Link href="/hiring">Join as Block Employee</Link></li>
              <li><Link href="/delivery-partner">Become Delivery Partner</Link></li>
              <li><Link href="/partner">NGO Partnership</Link></li>
              <li><Link href="/register">Volunteer Registration</Link></li>
              <li><Link href="/campaign">Start Awareness Campaign</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className={styles.contactCol}>
            <h3 className={styles.colTitle}>Contact Us</h3>
            <div className={styles.contactInfo}>
              <div className={styles.infoItem}>
                <div className={styles.iconBox}><Phone size={16} /></div>
                <a href="tel:8076611842">8076611842</a>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.iconBox}><MessageCircle size={16} /></div>
                <a href="https://wa.me/918076611842">WhatsApp Support</a>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.iconBox}><Mail size={16} /></div>
                <a href="mailto:info@sakhihub.com">info@sakhihub.com</a>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.iconBox}><MapPin size={16} /></div>
                <span>India – Village Outreach Network</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.divider}></div>

        <div className={styles.bottomBar}>
          <div className={styles.bottomLeft}>
            <p>© {new Date().getFullYear()} SakhiHub. All rights reserved.</p>
            <p className={styles.missionText}>Designed for Women Empowerment & Community Development</p>
          </div>
          <div className={styles.bottomRight}>
            <Link href="/privacy">Privacy Policy</Link>
            <span className={styles.bar}>|</span>
            <Link href="/terms">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
