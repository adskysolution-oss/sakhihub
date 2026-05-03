import React from 'react';
import styles from './PageBanner.module.css';

interface PageBannerProps {
  title: string;
  subtitle?: string;
  image?: string;
}

const PageBanner = ({ title, subtitle, image }: PageBannerProps) => {
  return (
    <section className={styles.banner} style={{ backgroundImage: `linear-gradient(rgba(46, 2, 73, 0.7), rgba(108, 74, 182, 0.7)), url(${image || 'https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=1500'})` }}>
      <div className="container">
        <div className={styles.content}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          <div className={styles.breadcrumb}>
            <span>Home</span> / <span>{title}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageBanner;
