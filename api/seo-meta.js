export default async function handler(req, res) {
  const userAgent = req.headers['user-agent'] || '';
  const isBot = /whatsapp|facebookexternalhit|twitterbot|linkedinbot|telegrambot|googlebot/i.test(userAgent);

  // إذا كان زائر عادي وليس بوت معاينة، يتم توجيهه للـ App
  if (!isBot) {
    return res.redirect(302, '/');
  }

  let title = "Phoenix Media | بيت إنتاج سينمائي";
  let description = "Phoenix Media - شركة إنتاج سينمائي وإعلامي متخصصة في صناعة المحتوى الإبداعي بأعلى معايير الجودة.";
  let imageUrl = "https://www.phoenixmediacom.com/og-cover.jpg";

  try {
    // جلب البيانات الديناميكية من سيرفر Render API
    const apiRes = await fetch('https://phoenix-media-api.onrender.com/api/public/seo-settings', {
      headers: { 'Accept': 'application/json' }
    });
    
    if (apiRes.ok) {
      const result = await apiRes.json();
      if (result?.data) {
        title = result.data.title || title;
        description = result.data.description || description;
        if (result.data.image && result.data.image.startsWith('http')) {
          imageUrl = result.data.image;
        }
      }
    }
  } catch (err) {
    console.error("SEO Fetch Error:", err);
  }

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  
  <!-- Open Graph / WhatsApp / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Phoenix Media">
  <meta property="og:url" content="https://www.phoenixmediacom.com/">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
</head>
<body></body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  return res.status(200).send(html);
}