import { useEffect } from 'react';

const siteUrl = 'https://smartqueuesys.vercel.app';
const socialImage = `${siteUrl}/og-image.svg`;

const routeMetadata = {
  '/': {
    title: 'Smart Queue Management System | Reduce Waiting Times',
    description:
      'Manage virtual queues for government offices, public service centers, hospitals, banks, and service businesses with real-time customer updates.',
    robots: 'index, follow, max-image-preview:large',
  },
  '/privacy': {
    title: 'Privacy Policy | Smart Queue Management System',
    description:
      'Read how Smart Queue Management System handles information used for queue management, authentication, and project operations.',
    robots: 'index, follow',
  },
  '/terms': {
    title: 'Terms and Conditions | Smart Queue Management System',
    description:
      'Review the terms for using Smart Queue Management System as an academic queue management and service demonstration project.',
    robots: 'index, follow',
  },
};

const noIndexMetadata = {
  title: 'Smart Queue Management System',
  description: 'Secure queue management portal.',
  robots: 'noindex, nofollow',
};

const setMeta = (attribute, key, content) => {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
};

const SeoMeta = () => {
  const pathname = window.location.pathname.replace(/\/$/, '') || '/';

  useEffect(() => {
    const metadata = routeMetadata[pathname] || noIndexMetadata;
    const canonicalUrl = `${siteUrl}${pathname === '/' ? '/' : pathname}`;

    document.title = metadata.title;
    setMeta('name', 'description', metadata.description);
    setMeta('name', 'robots', metadata.robots);
    setMeta('property', 'og:title', metadata.title);
    setMeta('property', 'og:description', metadata.description);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:image', socialImage);
    setMeta('name', 'twitter:title', metadata.title);
    setMeta('name', 'twitter:description', metadata.description);
    setMeta('name', 'twitter:image', socialImage);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);
  }, [pathname]);

  return null;
};

export default SeoMeta;
