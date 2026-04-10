export interface ProductSignalInput {
  id: string;
  data: {
    name: string;
    description?: string;
    category?: string;
    use_case?: string;
    features?: string[];
    price: number;
    image: string;
  };
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

export function deriveProductSignals(product: ProductSignalInput) {
  const text = [
    product.data.name,
    product.data.description || '',
    product.data.category || '',
    product.data.use_case || '',
    ...(product.data.features || []),
  ].join(' ').toLowerCase();

  const occasions: string[] = [];
  const styles: string[] = [];

  if (includesAny(text, ['bridesmaid', 'gift', 'party', 'prom'])) occasions.push('bridal-party');
  if (includesAny(text, ['engagement', 'bridal shower', 'rehearsal'])) occasions.push('pre-wedding');
  if (includesAny(text, ['reception', 'gala', 'black-tie', 'formal'])) occasions.push('evening');
  if (includesAny(text, ['nigerian', 'dubai', 'arabic', 'cultural', 'festive'])) occasions.push('cultural');
  if (occasions.length === 0) occasions.push('ceremony');

  if (includesAny(text, ['pearl', 'timeless', 'classic'])) styles.push('classic');
  if (includesAny(text, ['romantic', 'soft', 'delicate', 'floral', 'butterfly'])) styles.push('romantic');
  if (includesAny(text, ['statement', 'bold', 'tassel', 'lion', 'choker', 'dramatic'])) styles.push('statement');
  if (includesAny(text, ['minimal', 'clean', 'simple', 'drop'])) styles.push('minimal');
  if (includesAny(text, ['gold', 'regal', 'dubai', 'luxury'])) styles.push('regal');
  if (styles.length === 0) styles.push('classic');

  const priceBand =
    product.data.price < 25 ? 'under-25' :
    product.data.price < 45 ? 'under-45' :
    'premium-look';

  return {
    occasions: Array.from(new Set(occasions)),
    styles: Array.from(new Set(styles)),
    priceBand,
  };
}

export function pickRelatedProducts(currentId: string, products: ProductSignalInput[], limit = 3) {
  const current = products.find((product) => product.id === currentId);
  if (!current) return [];

  const currentSignals = deriveProductSignals(current);

  return products
    .filter((product) => product.id !== currentId)
    .map((product) => {
      const signals = deriveProductSignals(product);
      let score = 0;

      if (product.data.category === current.data.category) score += 3;
      if (signals.priceBand === currentSignals.priceBand) score += 1;
      if (signals.occasions.some((occasion) => currentSignals.occasions.includes(occasion))) score += 2;
      if (signals.styles.some((style) => currentSignals.styles.includes(style))) score += 2;

      return { product, score };
    })
    .sort((a, b) => b.score - a.score || a.product.data.price - b.product.data.price)
    .slice(0, limit)
    .map(({ product }) => product);
}
