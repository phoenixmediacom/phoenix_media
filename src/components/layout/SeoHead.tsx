// D:\Project\phoenix_media\src\components\layout\SeoHead.tsx
import { Helmet } from 'react-helmet-async';

interface SeoHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  jsonLd?: Record<string, any>;
}

export function SeoHead({
  title = "Phoenix Media | بيت إنتاج سينمائي وإعلامي",
  description = "شركة إنتاج سينمائي وإعلامي متخصصة في صناعة المحتوى الإبداعي، التغطيات الميدانية، والأفلام التوثيقية بأعلى معايير الجودة.",
  image = "https://www.phoenixmediacom.com/og-image.jpg",
  url = "https://www.phoenixmediacom.com",
  type = "website",
  jsonLd,
}: SeoHeadProps) {
  return (
    <Helmet>
      {/* Dynamic Title */}
      <title>{title}</title>

      {/* Meta Directives */}
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data (JSON-LD) */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}