import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const API_URL = process.env.VITE_API_URL || 'http://localhost:8000';
  
  try {
    const response = await fetch(`${API_URL}/api/public/seo`);
    const { data: seo } = await response.json();
    
    // إعادة توجيه مباشرة لصورة OG
    if (seo.social_share_image) {
      res.redirect(307, seo.social_share_image);
    } else {
      res.redirect(307, '/logo.png');
    }
    
  } catch (error) {
    res.redirect(307, '/logo.png');
  }
}