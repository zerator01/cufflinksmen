import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const productsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/products" }),
  schema: z.object({
    name: z.string(),
    seo_title: z.string().optional(),
    price: z.number(),
    description: z.string(),
    image: z.string(),
    gallery: z.array(z.string()).optional(),
    category: z.string(),
    features: z.array(z.string()).optional(),
    specs: z.record(z.string(), z.string()).optional(),
    faq: z.array(z.object({
      q: z.string(),
      a: z.string(),
    })).optional(),
    use_case: z.string().optional(),
    stripe_link: z.string().url().optional(),
    amazon_link: z.string().url().optional(),
    variants: z.array(z.object({
      label: z.string(),
      value: z.string(),
      price: z.number(),
      image: z.string(),
    })).optional(),
  }),
});

export const collections = {
  'products': productsCollection,
};
