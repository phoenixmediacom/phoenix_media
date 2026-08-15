import { useEffect } from "react";
import { useAsync } from "../../hooks/useAsync";
import { getSeoSettings } from "../../services/endpoints/seo";
import { getPublicSettings } from "../../services/endpoints/settings";

export function SeoHead() {
  const { data: seo, loading: seoLoading, error: seoError } = useAsync(() => getSeoSettings(), []);
  const { data: settings, loading: settingsLoading } = useAsync(() => getPublicSettings(), []);

  useEffect(() => {
    // ✅ انتظر حتى يتم تحميل البيانات
    if (seoLoading || settingsLoading) return;

    // ✅ 1. تحديث العنوان (من SEO أو Settings)
    const finalTitle = seo?.pageTitle || settings?.browserTabTitle || settings?.siteName || "Phoenix Media";
    document.title = finalTitle;

    // ✅ 2. دالة مساعدة لتحديث/إنشاء meta tags
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

    // ✅ 3. Description
    if (seo?.metaDescription) {
      updateMeta('meta[name="description"]', "name", "description", seo.metaDescription);
      updateMeta('meta[property="og:description"]', "property", "og:description", seo.metaDescription);
      updateMeta('meta[name="twitter:description"]', "name", "twitter:description", seo.metaDescription);
    }

    // ✅ 4. Keywords
    if (seo?.keywords && Array.isArray(seo.keywords) && seo.keywords.length > 0) {
      const keywordsStr = seo.keywords.join(", ");
      updateMeta('meta[name="keywords"]', "name", "keywords", keywordsStr);
    }

    // ✅ 5. OG Title
    updateMeta('meta[property="og:title"]', "property", "og:title", finalTitle);
    updateMeta('meta[name="twitter:title"]', "name", "twitter:title", finalTitle);

    // ✅ 6. OG Image (من SEO) + Favicon (من Settings)
    const ogImage = seo?.ogImageUrl;
    const faviconUrl = settings?.favicon;

    if (ogImage) {
      updateMeta('meta[property="og:image"]', "property", "og:image", ogImage);
      updateMeta('meta[name="twitter:image"]', "name", "twitter:image", ogImage);
      updateMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    }

    // ✅ 7. تحديث Favicon (من Settings - أولوية أعلى)
    if (faviconUrl) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = faviconUrl;
      } else {
        // إنشاء favicon جديد إذا لم يكن موجودًا
        const newFavicon = document.createElement("link");
        newFavicon.rel = "icon";
        newFavicon.type = "image/png";
        newFavicon.href = faviconUrl;
        document.head.appendChild(newFavicon);
      }
    }

    // ✅ 8. Console log للتأكد (فقط في Development)
    if (import.meta.env.DEV) {
      console.log('✅ SEO & Settings Updated:', {
        title: finalTitle,
        description: seo?.metaDescription,
        keywords: seo?.keywords,
        ogImage: ogImage,
        favicon: faviconUrl,
        siteName: settings?.siteName,
      });
    }
  }, [seo, seoLoading, seoError, settings, settingsLoading]);

  return null;
}