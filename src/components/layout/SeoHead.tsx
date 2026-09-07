import { useEffect } from "react";
import { useAsync } from "../../hooks/useAsync";
import { getSeoSettings } from "../../services/endpoints/seo";
import { getPublicSettings } from "../../services/endpoints/settings";

export function SeoHead() {
  const { data: seo, loading: seoLoading } = useAsync(() => getSeoSettings(), []);
  const { data: settings, loading: settingsLoading } = useAsync(() => getPublicSettings(), []);

  useEffect(() => {
    if (seoLoading || settingsLoading) return;

    // 1. تحديد العنوان النهائي
    const finalTitle = seo?.pageTitle || settings?.browserTabTitle || settings?.siteName || "Phoenix Media | بيت إنتاج سينمائي";
    document.title = finalTitle;

    // دالة مساعدة لتحديث أو إنشاء الـ meta tags
    const updateMeta = (selector: string, attrName: string, attrValue: string, content: string) => {
      if (!content) return;
      
      let element = document.querySelector(selector) as HTMLMetaElement;
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // 2. الوصف (Description)
    const finalDescription = seo?.metaDescription || "Phoenix Media - شركة إنتاج سينمائي وإعلامي متخصصة في صناعة المحتوى الإبداعي بأعلى معايير الجودة.";
    updateMeta('meta[name="description"]', "name", "description", finalDescription);
    updateMeta('meta[property="og:description"]', "property", "og:description", finalDescription);
    updateMeta('meta[name="twitter:description"]', "name", "twitter:description", finalDescription);

    // 3. الكلمات المفتاحية (Keywords)
    if (seo?.keywords && Array.isArray(seo.keywords) && seo.keywords.length > 0) {
      updateMeta('meta[name="keywords"]', "name", "keywords", seo.keywords.join(", "));
    }

    // 4. العنوان للمشاركات (OG Title)
    updateMeta('meta[property="og:title"]', "property", "og:title", finalTitle);
    updateMeta('meta[name="twitter:title"]', "name", "twitter:title", finalTitle);

    // 5. الشعار وصورة المشاركة (OG Image Handling)
    // الأولوية: صورة SEO -> الشعار المرفوع في Settings -> الشعار الثابت في الموقع
    const fallbackLogo = `${window.location.origin}/logo.png`;
    let rawImage = seo?.ogImageUrl || settings?.favicon || fallbackLogo;

    // تحويل الرابط إلى Absolute URL إذا كان مساراً نسبياً
    let finalOgImage = rawImage;
    if (rawImage && !rawImage.startsWith("http://") && !rawImage.startsWith("https://")) {
      const cleanPath = rawImage.startsWith("/") ? rawImage : `/${rawImage}`;
      finalOgImage = `${window.location.origin}${cleanPath}`;
    }

    updateMeta('meta[property="og:image"]', "property", "og:image", finalOgImage);
    updateMeta('meta[property="og:image:secure_url"]', "property", "og:image:secure_url", finalOgImage);
    updateMeta('meta[name="twitter:image"]', "name", "twitter:image", finalOgImage);
    updateMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");

    // 6. Favicon
    const faviconUrl = settings?.favicon || "/logo.png";
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = faviconUrl;
    } else {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      favicon.type = "image/png";
      favicon.href = faviconUrl;
      document.head.appendChild(favicon);
    }

  }, [seo, seoLoading, settings, settingsLoading]);

  return null;
}