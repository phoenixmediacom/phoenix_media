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
      heading: string;
      body: string;
    };

export interface PortfolioEvent {
  id: string;
  title: string;
  slug: string;
  coverImageUrl: string;
  companyLogoUrl?: string;
  clientLogoUrl?: string;
  behindTheScenes: boolean;
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

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
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
  ogImageUrl?: string;
}

export interface GeneralSettings {
  siteName: string;
  defaultLocale: "en" | "ar";
  maintenanceMode: boolean;
}

export interface LanguageOverrides {
  en: Record<string, string>;
  ar: Record<string, string>;
}
