import Head from 'next/head';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  url?: string;
}

export default function SEOMetadata({ 
  title, 
  description, 
  keywords = "women health, empowerment, SakhiHub, rural development", 
  ogImage = "/og-image.png",
  url = "https://sakhihub.com"
}: SEOProps) {
  return (
    <>
      <title>{`${title} | SakhiHub`}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={`${title} | SakhiHub`} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={`${title} | SakhiHub`} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
    </>
  );
}
