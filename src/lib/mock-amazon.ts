const TECH_PRODUCTS = [
  {
    category: "Monitors",
    keywords: ["monitor", "display", "screen"],
    items: [
      { title: "LG 27\" 4K UHD IPS Monitor (27UP850-W)", basePrice: 399 },
      { title: "Samsung 32\" Odyssey G7 Curved Gaming Monitor", basePrice: 599 },
      { title: "Dell UltraSharp U2723QE 27\" 4K USB-C Monitor", basePrice: 549 },
      { title: "ASUS ProArt PA278QV 27\" WQHD Monitor", basePrice: 319 },
      { title: "BenQ PD2705U 27\" 4K Designer Monitor", basePrice: 479 },
    ],
  },
  {
    category: "Phones",
    keywords: ["phone", "smartphone", "iphone", "android"],
    items: [
      { title: "iPhone 15 Pro 256GB - Natural Titanium", basePrice: 999 },
      { title: "Samsung Galaxy S24 Ultra 512GB", basePrice: 1299 },
      { title: "Google Pixel 8 Pro 128GB - Obsidian", basePrice: 799 },
      { title: "OnePlus 12 256GB - Silky Black", basePrice: 699 },
      { title: "iPhone 14 128GB - Midnight", basePrice: 699 },
    ],
  },
  {
    category: "Laptops",
    keywords: ["laptop", "notebook", "macbook", "ultrabook"],
    items: [
      { title: "MacBook Air M3 13\" 256GB - Midnight", basePrice: 1099 },
      { title: "Dell XPS 15 - Intel i7, 16GB RAM, 512GB SSD", basePrice: 1299 },
      { title: "Lenovo ThinkPad X1 Carbon Gen 11", basePrice: 1499 },
      { title: "ASUS ZenBook 14 OLED - Ryzen 7", basePrice: 899 },
      { title: "HP Spectre x360 14\" 2-in-1 Convertible", basePrice: 1199 },
    ],
  },
  {
    category: "Keyboards",
    keywords: ["keyboard", "mechanical", "keycaps"],
    items: [
      { title: "Keychron K2 Wireless Mechanical Keyboard", basePrice: 79 },
      { title: "Logitech MX Keys S - Wireless Keyboard", basePrice: 99 },
      { title: "Razer BlackWidow V4 Pro Mechanical Keyboard", basePrice: 229 },
      { title: "Apple Magic Keyboard with Touch ID", basePrice: 149 },
      { title: "SteelSeries Apex Pro TKL Gaming Keyboard", basePrice: 179 },
    ],
  },
  {
    category: "Audio",
    keywords: ["headphones", "earphones", "airpods", "earbuds", "audio"],
    items: [
      { title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones", basePrice: 349 },
      { title: "Apple AirPods Pro (2nd Gen)", basePrice: 249 },
      { title: "Bose QuietComfort Ultra Wireless Headphones", basePrice: 429 },
      { title: "Sennheiser Momentum 4 Wireless", basePrice: 299 },
      { title: "Samsung Galaxy Buds2 Pro", basePrice: 229 },
    ],
  },
  {
    category: "Electronics",
    keywords: ["default"],
    items: [
      { title: "LG 27\" 4K UHD IPS Monitor (27UP850-W)", basePrice: 399 },
      { title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones", basePrice: 349 },
      { title: "Keychron K2 Wireless Mechanical Keyboard", basePrice: 79 },
      { title: "MacBook Air M3 13\" 256GB - Midnight", basePrice: 1099 },
      { title: "iPhone 15 Pro 256GB - Natural Titanium", basePrice: 999 },
    ],
  },
];

const AI_SUMMARIES = [
  "Great time to buy",
  "Price near 90-day low",
  "Fair deal - average pricing",
  "Consider waiting for a sale",
  "Strong value at current price",
  "Below typical market price",
  "Good discount available",
  "Price trending down",
];

function generateAsin(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 10 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

function generatePriceHistory(basePrice: number): { price: number; date: string }[] {
  const history = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const variance = basePrice * (0.02 * (Math.random() - 0.5));
    const trend = basePrice * 0.001 * (29 - i) * (Math.random() - 0.3);
    const price = Math.round((basePrice + variance + trend) * 100) / 100;

    history.push({
      price: Math.max(price, basePrice * 0.7),
      date: date.toISOString().split("T")[0],
    });
  }

  return history;
}

function selectProductsForQuery(query: string): {
  items: { title: string; basePrice: number }[];
  category: string;
} {
  const lowerQuery = query.toLowerCase();

  for (const category of TECH_PRODUCTS) {
    if (category.keywords.includes("default")) continue;
    if (category.keywords.some((kw) => lowerQuery.includes(kw))) {
      return {
        items: [...category.items].sort(() => Math.random() - 0.5).slice(0, 5),
        category: category.category,
      };
    }
  }

  const defaultCategory = TECH_PRODUCTS.find((c) =>
    c.keywords.includes("default")
  )!;
  return {
    items: [...defaultCategory.items].sort(() => Math.random() - 0.5).slice(0, 5),
    category: defaultCategory.category,
  };
}

export function mockSearchAmazon(query: string) {
  const { items: productItems, category } = selectProductsForQuery(query);

  return productItems.map((product) => {
    const priceHistory = generatePriceHistory(product.basePrice);
    const currentPrice =
      priceHistory[priceHistory.length - 1]?.price ?? product.basePrice;

    return {
      asin: generateAsin(),
      title: product.title,
      current_price: Math.round(currentPrice * 100) / 100,
      image_url: `https://placehold.co/400?text=${encodeURIComponent(product.title.slice(0, 20))}`,
      category,
      price_history: priceHistory,
      ai_score: Math.floor(Math.random() * 101),
      ai_summary:
        AI_SUMMARIES[Math.floor(Math.random() * AI_SUMMARIES.length)],
    };
  });
}
