import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import content from './content/site.json' with { type: 'json' };

export default defineConfig({
  site: content.url,
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'directory' },
  vite: { plugins: [tailwindcss()] },
});
