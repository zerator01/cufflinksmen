# 📈 运营与 SEO 计划 (Operations & SEO Plan)
**定位**: 追求性价比的备婚人群 ($10-50 Accessible Elegance B2C) / 海外零售商批发 (B2B 中国买手)
**核心转化链路**: 搜索流量 → 场景化分类页 → 诚实精选文案引导 → Stripe 支付 / B2B 询盘

## 1. 核心关键词矩阵 (Seed Keywords)
- **头部词 (Head Terms)**: bridal jewellery set, wedding necklace set, crystal bridal set
- **商业意图长尾词 (BoFu)**:
  - pearl bridal jewellery set
  - gold plated bridal jewellery set
  - affordable bridal jewelry set
  - jewelry set for sweetheart neckline wedding dress
- **内容引流词 (ToFu)**:
  - how to choose jewelry for wedding dress neckline
  - bridal jewelry set vs individual pieces
  - can you wear gold plated jewelry for wedding
- **放弃的词（调性不匹配）**:
  - ❌ luxury bridal jewelry（引来 $200+ 预期用户）
  - ❌ heirloom wedding jewelry（虚假承诺）
  - ❌ cheap bridal jewelry sets（自贬身价）

## 2. 内容流水线与抓取计划 (Content Pipeline)
- **初始选品池**:
  - 聚焦 Alibaba/1688 上的合金+锆石/玻璃水晶套装（$8-20 成本），以及 925 银+真珠高端线（$20-40 成本）
- **文案生成策略**:
  - 站级文案：跑 `ecommerce-site-copy-generator` 工作流 → `final_website_copy.md`
  - 产品页文案：由「电商文案之神」Agent 读取 `site_tone.md` → 输出 `product_copy.json`
  - 核心原则：诚实描述材质，按 material_tiers 分层话术，强调拍照效果而非材质价值

## 3. SEO 页面结构
- 首页：9 板块内容密集型首页（含 FAQPage Schema）
- 品类页：3 个 L2 品类（Pearl / Crystal / Gold Plated）
- 产品页：由文案之神 Agent 自动生成 600+ 词独特文案
- /wholesale：B2B 独立页面（中国买手定位 + 8 条 FAQ）
- Blog（后期）：备婚首饰指南、按领口选配教程等 ToFu 内容

## 4. 外部运营杠杆 (Traffic Levers)
- **Pinterest 自动化**: 婚嫁赛道高度依赖 Pinterest。用 `canvas-design` 生成高唯美的垂直排版图片，挂外链。
- **SEO 结构化数据**: Product Schema（价格+库存）+ FAQPage Schema + Organization Schema，争取 Google 富摘要。
- **邮件收集**: Lead Magnet 方向 —— "Free Bridal Jewellery Style Guide: Match Your Set to Your Dress Neckline"（PDF）
