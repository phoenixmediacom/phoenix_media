import api from '../apiClient';
import type { HeroContent, VideoSourceType } from '../types';

export async function getHero(): Promise<HeroContent> {
  try {
    const response = await api.get<{ data: any }>('/public/settings');
    const settings = response.data?.data || response.data;

    if (!settings) {
      throw new Error('No settings data received from API');
    }

    return {
      companyName: settings.company_name || 'Phoenix Media',
      tagline: settings.tagline || { ar: '', en: 'Cinematic Production House' },
      logoUrl: settings.logo || '/logo.png',
      video: {
        type: (settings.background_video_type as VideoSourceType) || 'youtube',
        url: settings.background_video_source || '',
      },
    };
  } catch (error: any) {
    // ✅ فقط في Development
    if (import.meta.env.DEV) {
      console.error('Failed to fetch hero settings:', error);
    }
    
    return {
      companyName: 'Phoenix Media',
      tagline: { ar: 'بيت إنتاج سينمائي', en: 'Cinematic Production House' },
      logoUrl: '/logo.png',
      video: {
        type: 'youtube',
        url: '',
      },
    };
  }
}

export async function updateHero(
  content: HeroContent,
  filePayloads?: { logoFile?: File | null; videoFile?: File | null }
): Promise<HeroContent> {
  try {
    const formData = new FormData();

    formData.append('company_name', content.companyName);
    formData.append('tagline[ar]', content.tagline.ar || '');
    formData.append('tagline[en]', content.tagline.en || '');
    formData.append('background_video_type', content.video.type);

    // معالجة ملف الفيديو المرفوع أو الرابط
    if (filePayloads?.videoFile) {
      formData.append('background_video_file', filePayloads.videoFile);
    } else if (content.video.url) {
      formData.append('background_video_source', content.video.url);
    }

    // معالجة ملف اللوجو أو الرابط
    if (filePayloads?.logoFile) {
      formData.append('logo', filePayloads.logoFile);
    } else if (content.logoUrl && !content.logoUrl.startsWith('blob:')) {
      formData.append('logo_url', content.logoUrl);
    }

    const response = await api.post('/admin/settings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = response.data?.data || response.data;

    return {
      companyName: data.company_name || content.companyName,
      tagline: data.tagline || content.tagline,
      logoUrl: data.logo || content.logoUrl,
      video: {
        type: data.background_video_type || content.video.type,
        url: data.background_video_source || content.video.url,
      },
    };
  } catch (error: any) {
    // ✅ فقط في Development
    if (import.meta.env.DEV) {
      console.error('Failed to update hero settings:', error);
    }
    throw new Error(error.response?.data?.message || 'فشل تحديث إعدادات الصفحة الرئيسية');
  }
}