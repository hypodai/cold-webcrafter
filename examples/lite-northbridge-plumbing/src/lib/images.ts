// Maps a content name ("hero-van") to the downloaded original in src/assets/img.
const files = import.meta.glob('/src/assets/img/*.{jpg,jpeg,png,gif,webp}', { eager: true });
export function img(name?: string) {
  if (!name) return undefined;
  const key = Object.keys(files).find((k) => k.split('/').pop()!.replace(/\.[a-z]+$/, '') === name);
  if (!key) throw new Error(`image not found: ${name}`);
  return (files[key] as { default: ImageMetadata }).default;
}
