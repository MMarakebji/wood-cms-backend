export const FIXED_HOMEPAGE_SECTION_KEYS = [
  'hero',
  'wood-types',
  'our-work',
  'advantages',
  'about',
  'contact',
] as const;

export type HomepageSectionKey = (typeof FIXED_HOMEPAGE_SECTION_KEYS)[number];

export function isHomepageSectionKey(
  value: string,
): value is HomepageSectionKey {
  return (FIXED_HOMEPAGE_SECTION_KEYS as readonly string[]).includes(value);
}
