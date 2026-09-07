export default async function handler(req, res) {
  const userAgent = req.headers['user-agent'] || '';
  const isBot = /whatsapp|facebookexternalhit|twitterbot|linkedinbot|telegrambot|googlebot/i.test(userAgent);

  // إذا لم يكن زائر المعاينة بوت، قم بتوجيهه للصفحة العادية
  if (!isBot) {
    return res.redirect(302, '/');
  }

  try {
    // جلب بيانات الـ SEO والـ Settings من سيرفر Render API
    const [seoRes, settingsRes] = await Promise.all([
      fetch('https://phoenix-media-api.onrender.com/api/seo'),
      fetch('https://phoenix-media-api.onrender.com/api/settings')
    ]);

    const seo = await seoRes.json();
    const settings = await settingsRes.json();

    const title = seo?.data?.page_title || settings?.data?.site_name || 'Phoenix Media | بيت إنتاج سينمائي';
    const description = seo?.data?.meta_description || 'Phoenix Media - شركة إنتاج سينمائي وإعلامي متخصصة في صناعة المحتوى الإبداعي.';
    const imageUrl = seo?.data?.social_share_image || 'https://www.phoenixmediacom.com/logo_2.jpg';

    const html = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <meta name="description" content="${description}">
        
        <!-- Open Graph -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="https://www.phoenixmediacom.com/">
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
        <meta property="og:image" content="${imageUrl}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        
        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${title}">
        <meta name="twitter:description" content="${description}">
        <meta name="twitter:image" content="${imageUrl}">
      </head>
      <body></body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (error) {
    return res.redirect(302, '/');
  }
}