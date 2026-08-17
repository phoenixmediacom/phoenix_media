// phoenix_media/api/seo-meta.js

export default async function handler(req, res) {
  // 🔧 ضع رابط الـ API الخاص بك هنا
  const API_URL = process.env.VITE_API_BASE_URL || 'https://your-laravel-api-url.com';
  
  try {
    // جلب SEO من Laravel API
    const response = await fetch(`${API_URL}/api/public/seo`, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch SEO data');
    }

    const data = await response.json();
    const seo = data.data || {};

    const ogImage = seo.social_share_image || 'https://phoenixmedia.vercel.app/logo.png';
    const pageTitle = seo.page_title || 'Phoenix Media';
    const metaDescription = seo.meta_description || 'Phoenix Media - Cinematic Production House';

    // إنشاء HTML مع Meta Tags
    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(metaDescription)}">
  
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://phoenixmedia.vercel.app">
  <meta property="og:title" content="${escapeHtml(pageTitle)}">
  <meta property="og:description" content="${escapeHtml(metaDescription)}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:secure_url" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/jpeg">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(pageTitle)}">
  <meta name="twitter:description" content="${escapeHtml(metaDescription)}">
  <meta name="twitter:image" content="${ogImage}">
  
  <!-- Auto redirect to main app -->
  <meta http-equiv="refresh" content="0;url=/">
  
  <style>
    body {
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: white;
    }
    .loader {
      text-align: center;
    }
    .spinner {
      border: 4px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top: 4px solid white;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <p>Loading Phoenix Media...</p>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(html);
    
  } catch (error) {
    console.error('SEO Meta Error:', error);
    
    // Fallback HTML في حالة الخطأ
    const fallbackHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>Phoenix Media</title>
  <meta property="og:image" content="https://phoenixmedia.vercel.app/logo.png">
  <meta http-equiv="refresh" content="0;url=/">
</head>
<body>
  <p>Loading...</p>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(fallbackHtml);
  }
}

// دالة مساعدة لـ escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}