import { getBestDealsFiltered } from "@/app/actions";
import { CategorySlideshow } from "@/components/category-slideshow";
import { HeroSearch } from "@/components/hero-search";
import { FAQSection } from "@/components/faq-section";
import { BestDealsSection } from "@/components/best-deals-section";
import { CATEGORIES } from "@/lib/categories";

const FAQ_ITEMS = [
  {
    question: "How accurate is the price prediction?",
    answer:
      "Our AI analyzes historical price trends and market data to provide accurate buy recommendations. We track price fluctuations over 30+ days to identify the best time to purchase.",
  },
  {
    question: "Do you track all Amazon products?",
    answer:
      "We currently track a curated selection of tech products including laptops, monitors, phones, and components. New products are added as you search—try searching for any tech product to get started.",
  },
  {
    question: "Is this free to use?",
    answer:
      "Yes! OpenBy is completely free to use. Search for products, view price history, and get AI-powered buy recommendations at no cost.",
  },
  {
    question: "How often is the price data updated?",
    answer:
      "We collect and update price data daily. Our 30-day price history charts reflect the most recent trends, so you can make informed decisions based on up-to-date information.",
  },
  {
    question: "Can I set up price alerts?",
    answer:
      "Price alerts are on our roadmap! For now, bookmark products you're interested in and check back regularly. Our OpenBy Index helps you know when it's a good time to buy at a glance.",
  },
  {
    question: "Where does the data come from?",
    answer:
      "We aggregate price data from trusted sources and apply our AI models to analyze trends. Our algorithms factor in seasonal patterns, historical lows, and market conditions to generate buy recommendations.",
  },
];

export default async function Home() {
  const { products: topProducts } = await getBestDealsFiltered({
    sort: "score",
    limit: 5,
    page: 1,
  });

  return (
    <div className="min-h-screen">
      <HeroSearch />

      {/* Section 2: Trending Categories */}
      <section id="categories" className="relative overflow-visible bg-white py-24">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(239,246,255,0.5)_0%,transparent_60px)]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 -z-[5] bg-[linear-gradient(to_top,rgba(250,250,250,0.9)_0%,transparent_100%)]" />
        <div className="relative mx-auto max-w-6xl px-12 sm:px-16">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Browse by Category
            </h2>
            <p className="mt-3 text-zinc-600">
              Find the best deals across tech categories
            </p>
          </div>
          <CategorySlideshow categories={CATEGORIES} />
        </div>
      </section>

      {/* Section 3: Best AI Picks */}
      <BestDealsSection products={topProducts} emptyLinkHref="/" />

      {/* Section 4: FAQ */}
      <section className="relative bg-gradient-to-b from-indigo-50/40 via-blue-50/30 to-white py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_110%,rgba(59,130,246,0.16),rgba(168,85,247,0.06),transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              How it Works
            </h2>
            <p className="mt-3 text-zinc-600">
              Everything you need to know about OpenBy
            </p>
          </div>
          <FAQSection items={FAQ_ITEMS} />
        </div>
      </section>
    </div>
  );
}
