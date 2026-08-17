// phoenix_media/api/seo-meta.js

export default async function handler(req, res) {
  const API_URL = process.env.VITE_API_BASE_URL || 'https://your-laravel-api.com';
  
  try {
    // جلب SEO من Laravel API
    const response = await fetch(`${API_URL}/api/public/seo`);
    const data = await response.json();
    const seo = data.data || {};

    const ogImage = seo.social_share_image || '';
    const pageTitle = seo.page_title || 'Phoenix Media';
    const metaDescription = seo.meta_description || 'Phoenix Media - Cinematic Production House';

    // إرجاع HTML مع Meta Tags
    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <title>${pageTitle}</title>
  <meta name="description" content="${metaDescription}">
  
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://phoenixmedia.vercel.app">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${metaDescription}">
  ${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}
  ${ogImage ? `<meta property="og:image:secure_url" content="${ogImage}">` : ''}
  ${ogImage ? `<meta property="og:image:width" content="1200">` : ''}
  ${ogImage ? `<meta property="og:image:height" content="630">` : ''}
  ${ogImage ? `<meta property="og:image:type" content="image/jpeg">` : ''}
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${metaDescription}">
  ${ogImage ? `<meta name="twitter:image" content="${ogImage}">` : ''}
  
  <meta http-equiv="refresh" content="0;url=/">
</head>
<body>
  <p>Loading Phoenix Media...</p>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=3600');
    res.status(200).send(html);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load SEO data' });
  }
}