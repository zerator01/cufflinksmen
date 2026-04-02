#!/bin/bash
set -e
RENDERER="/Users/zerator/.gemini/antigravity/skills/canvas-design/scripts/external_renderer.py"
OUT_DIR="/Users/zerator/Desktop/antigravity-work/2C电商项目/bridaljewelleryset/public/images"

mkdir -p "$OUT_DIR"

echo "Starting 16 image generations..."

# 1. Hero
python3 "$RENDERER" --prompt "Ultra-wide panoramic landscape, aesthetic bridal jewellery scattered elegantly on flowing ivory silk, soft morning light, champagne gold rim lighting, minimalist composition, large negative space in the center, 85mm macro lens, museum-quality visual." --width 2560 --height 1200 --output "$OUT_DIR/hero-bg"

# 2-4. Categories
python3 "$RENDERER" --prompt "Elegant product photography of delicate simulated pearl bridal necklace, draped on warm neutral background, shallow depth of field, subtle gold accents, sophisticated curator vibe." --width 800 --height 460 --output "$OUT_DIR/category-pearl"
python3 "$RENDERER" --prompt "Elegant product photography of sparkling crystal bridal earrings catching soft diffused light, pristine ivory linen background, high-end finishing, minimalist." --width 800 --height 460 --output "$OUT_DIR/category-crystal"
python3 "$RENDERER" --prompt "Elegant product photography of a gold-plated bridal bracelet, warm sunset glow, soft shadows, resting on luxurious fabric, sophisticated aesthetic." --width 800 --height 460 --output "$OUT_DIR/category-gold"

# 5-7. Features
python3 "$RENDERER" --prompt "Lifestyle detail shot of a bride's neck and collarbone wearing a perfectly matched necklace and earring set, soft focus, natural warm lighting, elegant and effortless." --width 800 --height 500 --output "$OUT_DIR/feature-matching"
python3 "$RENDERER" --prompt "Extreme macro shot of the smooth backing of a crystal earring, showing high-quality comfortable finish, soft lighting, skin-safe hypoallergenic aesthetic." --width 800 --height 500 --output "$OUT_DIR/feature-comfort"
python3 "$RENDERER" --prompt "Curated flat lay of a complete bridal jewellery set inside an elegant minimalist eco-friendly box, soft light, premium unboxing experience without luxury pretension." --width 800 --height 500 --output "$OUT_DIR/feature-value"

# 8-9. About
python3 "$RENDERER" --prompt "Behind the scenes of a clean, bright jewelry curation studio, out of focus designer arranging pieces, warm sunlight, professional and honest atmosphere." --width 800 --height 500 --output "$OUT_DIR/about-hero"
python3 "$RENDERER" --prompt "Close up of hands inspecting a sparkling necklace under a magnifying loupe, quality control process, warm gallery lighting, pristine and trustworthy." --width 800 --height 500 --output "$OUT_DIR/about-why"

# 10. OG Image
python3 "$RENDERER" --prompt "Cinematic composition of stunning bridal jewellery sets, balanced split of pearls and crystals, warm champagne background, perfect for social media preview, striking and elegant." --width 1200 --height 630 --output "$OUT_DIR/og-default"

# 11-16. Avatars
python3 "$RENDERER" --prompt "Elegant portrait of a smiling Black bride with tasteful makeup, wearing subtle crystal earrings, soft natural lighting, blurred champagne background." --width 640 --height 640 --output "$OUT_DIR/avatar-amara"
python3 "$RENDERER" --prompt "Elegant portrait of a happy bridesmaid in a soft pastel dress, wearing a delicate necklace, candid and natural, warm soft focus." --width 640 --height 640 --output "$OUT_DIR/avatar-sophie"
python3 "$RENDERER" --prompt "Beautiful Latina bride looking down with a gentle smile, pearl earrings visible, soft natural window light, elegant and genuine." --width 640 --height 640 --output "$OUT_DIR/avatar-maria"
python3 "$RENDERER" --prompt "Professional lifestyle portrait of a confident Middle Eastern female boutique owner inside a bright modern studio, smart casual, warm and trustworthy." --width 640 --height 640 --output "$OUT_DIR/avatar-fatima"
python3 "$RENDERER" --prompt "Professional portrait of an Australian female online retailer, warm smile, soft natural lighting, modern office background nicely blurred." --width 640 --height 640 --output "$OUT_DIR/avatar-rachel"
python3 "$RENDERER" --prompt "Candid portrait of a male wedding planner holding a clipboard, standing in a bright sunlit venue, warm and reliable professional aesthetic." --width 640 --height 640 --output "$OUT_DIR/avatar-david"

echo "ALL 16 IMAGES GENERATED SUCCESSFULLY!"
