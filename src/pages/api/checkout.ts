// Stripe Checkout Session API
// POST /api/checkout
// 接收购物车 items，创建 Stripe Checkout Session，返回 checkout URL

export const prerender = false; // 必须是 SSR，不能预渲染

import type { APIRoute } from 'astro';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = import.meta.env.STRIPE_SECRET_KEY;

export const POST: APIRoute = async ({ request }) => {
  // 1. 验证 Stripe Key
  if (!STRIPE_SECRET_KEY) {
    return new Response(
      JSON.stringify({ error: 'Stripe not configured. Please set STRIPE_SECRET_KEY.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);

  try {
    // 2. 解析购物车
    const { items } = await request.json();

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Cart is empty.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. 构建 Stripe line_items
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item: { name: string; price: number; qty: number; image?: string }) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            ...(item.image ? { images: [item.image] } : {}),
          },
          unit_amount: Math.round(item.price * 100), // Stripe 用分为单位
        },
        quantity: item.qty,
      })
    );

    // 4. 计算是否达到免运费门槛
    const subtotal = items.reduce(
      (sum: number, item: { price: number; qty: number }) => sum + item.price * item.qty,
      0
    );
    const FREE_SHIPPING_THRESHOLD = 50;

    // 5. 如果没达到免运费门槛，加运费（可选）
    const shipping_options: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [];
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

    // 6. 创建 Checkout Session
    const origin = new URL(request.url).origin;

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
  } catch (err: any) {
    console.error('Stripe Checkout error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to create checkout session.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
