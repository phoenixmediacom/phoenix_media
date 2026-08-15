import type { VercelRequest, VercelResponse } from '@vercel/node';

// ✅ رابط الـ API (سيتم تعديله في Environment Variables على Vercel)
const API_URL = process.env.VITE_API_URL || 'http://localhost:8000';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 1️⃣ جلب بيانات SEO من Laravel API
    const [seoRes, settingsRes] = await Promise.all([
      fetch(`${API_URL}/api/public/seo`),
      fetch(`${API_URL}/api/public/settings`)
    ]);

    if (!seoRes.ok || !settingsRes.ok) {
      throw new Error('Failed to fetch data');
    }

    const { data: seo } = await seoRes.json();
    const { data: settings } = await settingsRes.json();

    // 2️⃣ توليد HTML مع Meta Tags ديناميكية
    const html = `
<!doctype html>
<html lang="${settings.default_language || 'ar'}" dir="rtl">
<head>
    <meta charset="UTF-8" />
    
    <!-- ✅ Favicon ديناميكي -->
    <link rel="icon" type="image/png" href="${settings.favicon || '/logo.png'}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- ✅ SEO ديناميكي -->
    <title>${seo.page_title || 'Phoenix Media'}</title>
    <meta name="description" content="${seo.meta_description || ''}" />
    <meta name="keywords" content="${Array.isArray(seo.keywords) ? seo.keywords.join(', ') : ''}" />
    
    <!-- ✅ Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${seo.page_title || 'Phoenix Media'}" />
    <meta property="og:description" content="${seo.meta_description || ''}" />
    <meta property="og:image" content="${seo.social_share_image || '/logo.png'}" />
    <meta property="og:url" content="${req.headers.host ? 'https://' + req.headers.host : ''}" />
    
    <!-- ✅ Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${seo.page_title || 'Phoenix Media'}" />
    <meta name="twitter:description" content="${seo.meta_description || ''}" />
    <meta name="twitter:image" content="${seo.social_share_image || '/logo.png'}" />
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
    
    <!-- ✅ إعادة توجيه للصفحة الرئيسية بعد قراءة Meta Tags -->
    <meta http-equiv="refresh" content="0; url=/" />
</head>
<body>
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #000; color: #fff; font-family: sans-serif;">
        <p>Loading Phoenix Media...</p>
    </div>
    
    <!-- ✅ إعادة توجيه JavaScript -->
    <script>
      // للمتصفحات التي لا تدعم meta refresh
      if (window.location.pathname === '/api/seo') {
        window.location.href = '/';
      }
    </script>
</body>
</html>
    `;

    // 3️⃣ إرجاع HTML مع Cache
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(html);

  } catch (error) {
    console.error('❌ SEO Edge Function Error:', error);
    
    // 4️⃣ Fallback في حالة الفشل
    const fallbackHtml = `
<!doctype html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8" />
    <title>Phoenix Media</title>
    <meta name="description" content="Cinematic Production House" />
    <meta http-equiv="refresh" content="0; url=/" />
</head>
<body>
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #000; color: #fff;">
        <p>Loading...</p>
    </div>
</body>
</html>
    `;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(fallbackHtml);
  }
}