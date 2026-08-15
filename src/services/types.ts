export type VideoSourceType = "upload" | "youtube" | "vimeo";

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

export type Language = 'ar' | 'en';

export interface LocalizedText {
  en: string;
  ar: string;
}

export interface AboutContent {
  title: LocalizedText;
  description: LocalizedText;
  imageUrl?: string;
  backgroundVariant: "lightfall" | "prism" | "none";
}

export interface LogoItem {
  id: string;
  name: string;
  logoUrl: string;
  order: number;
}

export type ServiceIcon =
  | { type: "emoji"; value: string }
  | { type: "image"; value: string }
  | { type: "fontawesome"; value: string };

export interface ServiceItem {
  id: string;
  icon: ServiceIcon;
  title: LocalizedText;
  description: LocalizedText;
  order: number;
}

export type GalleryItemType = "image" | "video";

export interface GalleryItem {
  id: string;
  type: GalleryItemType;
  url: string;
  caption?: string;
}

export interface FeaturedPerson {
  id: string;
  name: string;
  photoUrl: string;
  order: number;
  gallery: GalleryItem[];
}

export type PortfolioSection =
  | {
      id: string;
      type: "hero-video";
      order: number;
      videoUrl: string;
      posterUrl: string;
      showPlayButton: boolean;
    }
  | {
      id: string;
      type: "gallery";
      order: number;
      layout: "grid" | "masonry";
      items: GalleryItem[];
    }
  | {
      id: string;
      type: "people";
      order: number;
      heroImageUrl: string;
      people: FeaturedPerson[];
    }
  | {
      id: string;
      type: "text";
      order: number;
      heading: LocalizedText;
      body: LocalizedText;
    };

export interface PortfolioEvent {
  id: string;
  title: LocalizedText;
  slug: string;
  cover_image_url: string;
  company_logo_url?: string;
  client_logo_url?: string;
  behind_the_scenes: boolean;
  published: boolean;
  order: number;
  sections: PortfolioSection[];
}

export interface ContactInfo {
  email: string;
  phone: string;
  address?: string;
  whatsapp: string;
  mapEmbedUrl?: string;
}

// ✅ Contact Submission Types
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  ipAddress?: string;
  createdAt: string;
  readAt?: string | null;
}

export interface SubmissionsStats {
  total: number;
  new: number;
  read: number;
  replied: number;
  archived: number;
  today?: number;
  this_week?: number;
  this_month?: number;
}

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "x"
  | "vimeo"
  | "behance"
  | "snapchat"
  | "youtube"
  | "tiktok"
  | "linkedin"
  | "whatsapp";

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  url: string;
  order: number;
}

export interface NavItem {
  id: string;
  labelKey: string;
  targetId: string;
  order: number;
  visible: boolean;
}

export interface SeoSettings {
  pageTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImageUrl: string;
  ogImageType?: "upload" | "url";
}

export interface GeneralSettings {
  siteName: string;
  defaultLocale: 'en' | 'ar';
  browserTabTitle: string;
  favicon: string;
  maintenanceMode: boolean;
}

export interface LanguageOverrides {
  en: Record<string, string>;
  ar: Record<string, string>;
}
