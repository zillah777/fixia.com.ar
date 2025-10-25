import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHelmetProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
}

const DEFAULT_SEO = {
  siteName: 'Fixia',
  defaultTitle: 'Fixia - Marketplace de Servicios Profesionales',
  defaultDescription: 'Conecta con profesionales verificados en Argentina. Encuentra servicios de calidad en diseño, desarrollo, marketing, consultoría y más. Pago seguro y garantía de satisfacción.',
  defaultImage: 'https://fixia.app/og-image.jpg',
  twitterHandle: '@FixiaApp',
  fbAppId: '',
  themeColor: '#10b981',
  locale: 'es_AR',
  baseUrl: 'https://fixia.app',
};

export function SEOHelmet({
  title,
  description,
  keywords,
  image,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  noindex = false,
}: SEOHelmetProps) {
  const location = useLocation();

  const fullTitle = title
    ? `${title} | ${DEFAULT_SEO.siteName}`
    : DEFAULT_SEO.defaultTitle;

  const finalDescription = description || DEFAULT_SEO.defaultDescription;
  const finalImage = image || DEFAULT_SEO.defaultImage;
  const canonicalUrl = `${DEFAULT_SEO.baseUrl}${location.pathname}`;

  useEffect(() => {
    // Set document title
    document.title = fullTitle;

    // Helper function to set or update meta tags
    const setMetaTag = (property: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${property}"]`);

      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, property);
        document.head.appendChild(meta);
      }

      meta.setAttribute('content', content);
    };

    // Basic meta tags
    setMetaTag('description', finalDescription);
    if (keywords) {
      setMetaTag('keywords', keywords);
    }
    if (author) {
      setMetaTag('author', author);
    }

    // Robots
    if (noindex) {
      setMetaTag('robots', 'noindex,nofollow');
    } else {
      setMetaTag('robots', 'index,follow');
    }

    // Open Graph tags
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', finalDescription, true);
    setMetaTag('og:image', finalImage, true);
    setMetaTag('og:url', canonicalUrl, true);
    setMetaTag('og:type', type, true);
    setMetaTag('og:site_name', DEFAULT_SEO.siteName, true);
    setMetaTag('og:locale', DEFAULT_SEO.locale, true);

    if (publishedTime) {
      setMetaTag('article:published_time', publishedTime, true);
    }
    if (modifiedTime) {
      setMetaTag('article:modified_time', modifiedTime, true);
    }

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', finalDescription);
    setMetaTag('twitter:image', finalImage);
    if (DEFAULT_SEO.twitterHandle) {
      setMetaTag('twitter:site', DEFAULT_SEO.twitterHandle);
      setMetaTag('twitter:creator', DEFAULT_SEO.twitterHandle);
    }

    // Additional meta tags
    setMetaTag('theme-color', DEFAULT_SEO.themeColor);
    setMetaTag('apple-mobile-web-app-capable', 'yes');
    setMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');
    setMetaTag('format-detection', 'telephone=no');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    // JSON-LD Structured Data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': type === 'article' ? 'Article' : 'WebPage',
      '@id': canonicalUrl,
      url: canonicalUrl,
      name: fullTitle,
      description: finalDescription,
      image: finalImage,
      publisher: {
        '@type': 'Organization',
        name: DEFAULT_SEO.siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${DEFAULT_SEO.baseUrl}/logo.png`,
        },
      },
      ...(author && {
        author: {
          '@type': 'Person',
          name: author,
        },
      }),
      ...(publishedTime && {
        datePublished: publishedTime,
      }),
      ...(modifiedTime && {
        dateModified: modifiedTime,
      }),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Optionally remove meta tags on unmount if needed
      // For SPA, we keep them and update on route change
    };
  }, [fullTitle, finalDescription, finalImage, canonicalUrl, type, author, publishedTime, modifiedTime, noindex, keywords]);

  // This component doesn't render anything
  return null;
}
