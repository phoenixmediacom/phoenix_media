import api from '../apiClient';

// Types
export type VideoSourceType = 'upload' | 'youtube' | 'vimeo';

export interface VideoSource {
  type: VideoSourceType;
  url: string;
}

export interface HeroContent {
  companyName: string;
  tagline: {
    ar: string;
    en: string;
  };
  logoUrl: string;
  video: VideoSource;
}

/**
 * Get Hero/Homepage settings
 */
export async function getHero(): Promise<HeroContent> {
  try {
    const response = await api.get<{ data: any }>('/admin/settings');
    const settings = response.data.data;

    return {
      companyName: settings.company_name || 'Phoenix Media',
      tagline: settings.tagline || { ar: '', en: 'Cinematic Production House' },
      logoUrl: settings.logo || '/logo.png',
      video: {
        type: settings.background_video_type || 'youtube',
        url: settings.background_video_source || '',
      },
    };
  } catch (error: any) {
    console.error('Failed to fetch hero settings:', error);
    throw new Error(error.response?.data?.message || 'فشل جلب إعدادات الصفحة الرئيسية');
  }
}

/**
 * Update Hero/Homepage settings
 */
export async function updateHero(content: HeroContent): Promise<HeroContent> {
  try {
    // إرسال البيانات كـ JSON (بدون FormData لأن الرفع يتم عبر MediaUploader)
    const payload: any = {
      company_name: content.companyName,
      'tagline[ar]': content.tagline.ar,
      'tagline[en]': content.tagline.en,
      background_video_type: content.video.type,
      background_video_source: content.video.url,
    };

    // إضافة Logo فقط إذا كان URL حقيقي (وليس blob)
    if (content.logoUrl && !content.logoUrl.startsWith('blob:')) {
      payload.logo_url = content.logoUrl;
    }

    const response = await api.post('/admin/settings', payload);

    return {
      companyName: response.data.data.company_name,
      tagline: response.data.data.tagline,
      logoUrl: response.data.data.logo,
      video: {
        type: response.data.data.background_video_type,
        url: response.data.data.background_video_source,
      },
    };
  } catch (error: any) {
    console.error('Failed to update hero settings:', error);
    throw new Error(error.response?.data?.message || 'فشل تحديث إعدادات الصفحة الرئيسية');
  }
}