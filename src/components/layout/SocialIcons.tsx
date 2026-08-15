import { motion } from "framer-motion";
import { useAsync } from "../../hooks/useAsync";
import { getPublicSocialLinks } from "../../services/endpoints/social"; // ✅ تغيير الاستيراد
import { SocialIcon } from "./SocialIcon";

export function SocialIcons({ className = "" }: { className?: string }) {
  const { data } = useAsync(() => getPublicSocialLinks(), []); // ✅ استخدام Public API

  if (!data || data.length === 0) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {data.map((link) => (
        <motion.a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          aria-label={link.platform}
          whileHover={{ y: -3, boxShadow: "0 0 20px 3px rgba(255,87,26,0.35)" }}
          className="h-9 w-9 rounded-full glass flex items-center justify-center text-on-surface hover:text-primary transition-colors"
        >
          <SocialIcon platform={link.platform} />
        </motion.a>
      ))}
    </div>
  );
}