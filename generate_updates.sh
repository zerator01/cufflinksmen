#!/bin/bash
RENDERER="/Users/zerator/.gemini/antigravity/skills/canvas-design/scripts/external_renderer.py"
OUT_DIR="/Users/zerator/Desktop/antigravity-work/2C电商项目/bridaljewelleryset/public/images"

python3 "$RENDERER" --prompt "Inside a bright jewelry curation studio, a professional Chinese/Asian female designer reviewing a beautiful necklace. Warm, honest, trustworthy atmosphere. Asian/Chinese facial features are clearly visible and authentic." --width 800 --height 500 --output "$OUT_DIR/about-hero"

python3 "$RENDERER" --prompt "Close up portrait of a Chinese/Asian female quality inspector carefully inspecting a sparkling necklace with a magnifying loupe. Professional, authentic Chinese manufacturing team." --width 800 --height 500 --output "$OUT_DIR/about-why"

wrangler r2 object put bridaljewelleryset-assets/images/about-hero.png --file "$OUT_DIR/about-hero.png"
wrangler r2 object put bridaljewelleryset-assets/images/about-why.png --file "$OUT_DIR/about-why.png"
