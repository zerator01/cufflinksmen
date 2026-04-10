// Cloudflare Pages Function — Stripe Checkout
// Runs as a Worker automatically when deployed to CF Pages
// Route: POST /api/checkout

import Stripe from 'stripe';
import { productCatalog } from '../_shared/productCatalog.js';

function resolveProductId(item) {
  if (item?.productId && productCatalog[item.productId]) {
    return item.productId;
  }

  if (typeof item?.id !== 'string' || item.id.length === 0) {
    return null;
  }

  if (productCatalog[item.id]) {
    return item.id;
  }

  const catalogIds = Object.keys(productCatalog).sort((a, b) => b.length - a.length);
  return catalogIds.find((catalogId) => (
    item.id === catalogId ||
    item.id.startsWith(`${catalogId}::`) ||
    item.id.startsWith(`${catalogId}-`)
  )) || null;
}

export async function onRequestPost(context) {
  const STRIPE_SECRET_KEY = context.env.STRIPE_SECRET_KEY;

  if (!STRIPE_SECRET_KEY) {
    return new Response(
      JSON.stringify({ error: 'Stripe not configured.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);

  try {
    const { items } = await context.request.json();

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Cart is empty.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const normalizedItems = items.map((item) => {
      const productId = resolveProductId(item);
      const quantity = Number.parseInt(String(item?.qty ?? ''), 10);

      if (!productId) {
        throw new Error('One or more cart items are invalid.');
      }

      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        throw new Error('One or more cart quantities are invalid.');
      }

      return {
        productId,
        quantity,
        catalogEntry: productCatalog[productId],
      };
    });

    const line_items = normalizedItems.map(({ quantity, catalogEntry }) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: catalogEntry.name,
          ...(catalogEntry.image ? { images: [catalogEntry.image] } : {}),
        },
        unit_amount: Math.round(catalogEntry.price * 100),
      },
      quantity,
    }));

    const subtotal = normalizedItems.reduce((sum, item) => (
      sum + item.catalogEntry.price * item.quantity
    ), 0);
    const FREE_SHIPPING_THRESHOLD = 50;

    const shipping_options = [];
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      shipping_options.push({
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 0, currency: 'usd' },
          display_name: 'Free Worldwide Shipping',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 7 },
            maximum: { unit: 'business_day', value: 15 },
          },
        },
      });
    } else {
      shipping_options.push(
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 599, currency: 'usd' },
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 7 },
              maximum: { unit: 'business_day', value: 15 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'usd' },
            display_name: `Free shipping on orders over $${FREE_SHIPPING_THRESHOLD}`,
          },
        }
      );
    }

    const origin = new URL(context.request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      shipping_options,
      shipping_address_collection: {
        allowed_countries: [
          'US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE',
          'AT', 'SE', 'DK', 'NO', 'FI', 'IE', 'PT', 'NZ', 'SG', 'AE',
          'SA', 'QA', 'KW', 'NG', 'ZA', 'MX', 'BR', 'JP', 'KR',
        ],
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Stripe Checkout error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to create checkout session.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
