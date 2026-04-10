import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://yourdomain.com',
  integrations: [sitemap({ filter: (page) => !page.includes('/checkout/') })],
  output: 'static',
});
