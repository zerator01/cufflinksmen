import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
    site: 'https://cufflinksmen.com',
    output: 'static',
    integrations: [sitemap()],
    adapter: cloudflare({ imageService: 'cloudflare' })
});
