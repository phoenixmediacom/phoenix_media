export function generateUniqueSlug(title: string): string {
  if (!title.trim()) return "";

  // استخراج أول كلمة وتنظيفها (تدعم الحروف العربية والإنجليزية والأرقام)
  const firstWord = title
    .trim()
    .split(/\s+/)[0]
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF-]/g, "");

  // إضافة معرّف فريد لا يتكرر (الوقت الحالي بالـ Base36 + رموز عشوائية)
  const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

  return `${firstWord || "event"}-${uniqueSuffix}`;
}