import Link from "next/link";
import { Mail, MessageSquare, Clock, ArrowRight } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export const metadata = {
  title: "Contact Us | OpenBy",
  description: "Get in touch with OpenBy. Share feedback, report issues, or learn more about our AI-powered price tracking mission.",
};

export default function ContactPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative border-b border-zinc-200/80 bg-gradient-to-b from-blue-50/60 via-indigo-50/30 to-white py-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(59,130,246,0.2),rgba(99,102,241,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h1 className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 text-lg text-zinc-600">
            We&apos;d love to hear from you. Whether you have feedback, questions, or
            ideas, our team is here to help.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="relative border-b border-zinc-200/80 bg-gradient-to-b from-white to-blue-50/30 py-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_20%_50%,rgba(99,102,241,0.12),rgba(59,130,246,0.06),transparent_65%)]" />
        <div className="relative mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Our Mission
          </h2>
          <div className="mt-6 space-y-4 text-zinc-700 leading-relaxed">
            <p>
              OpenBy was built with a simple belief: everyone deserves to buy tech
              at the right price. We&apos;re tired of overpaying for laptops, monitors,
              phones, and gadgets because we didn&apos;t know when to pull the trigger.
            </p>
            <p>
              Our mission is to put AI-powered price intelligence in your hands.
              We analyze historical trends, seasonal patterns, and market data to
              tell you when it&apos;s actually a good time to buy—and when you should
              hold off. No more guessing, no more buyer&apos;s remorse.
            </p>
            <p>
              We&apos;re building a fairer shopping experience. By tracking prices
              across categories and surfacing the best deals with clear AI scores,
              we help you make informed decisions. Your feedback drives what we
              build next, so please reach out. We read every message.
            </p>
          </div>
        </div>
      </section>

      {/* Feedback Form */}
      <section className="relative border-b border-zinc-200/80 bg-gradient-to-b from-indigo-50/30 via-white to-blue-50/40 py-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_60%_at_50%_50%,rgba(59,130,246,0.16),rgba(99,102,241,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-2xl px-6">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Send Us Feedback
          </h2>
          <p className="mt-2 text-zinc-600">
            Have a suggestion, spotted a bug, or want to request a feature? Fill out
            the form below and we&apos;ll get back to you.
          </p>
          <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="relative border-b border-zinc-200/80 bg-gradient-to-b from-purple-50/30 via-white to-indigo-50/20 py-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_80%_30%,rgba(168,85,247,0.14),rgba(99,102,241,0.06),transparent_65%)]" />
        <div className="relative mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            What to Expect
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900">Response Time</h3>
                <p className="mt-1 text-sm text-zinc-600">
                  We aim to respond within 2–3 business days. Peak times may be longer.
                </p>
              </div>
            </div>
            <div className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                <MessageSquare className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900">Direct Replies</h3>
                <p className="mt-1 text-sm text-zinc-600">
                  We reply from a real inbox. No bots, no canned responses—just real people.
                </p>
              </div>
            </div>
            <div className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <Mail className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900">Your Impact</h3>
                <p className="mt-1 text-sm text-zinc-600">
                  Feedback shapes our roadmap. Feature requests and bug reports are taken seriously.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Ways to Reach Us */}
      <section className="relative border-b border-zinc-100 py-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_80%_at_80%_70%,rgba(99,102,241,0.03),transparent)]" />
        <div className="relative mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Other Ways to Reach Us
          </h2>
          <div className="mt-8 space-y-4">
            <p className="text-zinc-600">
              For press inquiries, partnership opportunities, or legal matters, please
              email us at:
            </p>
            <ul className="space-y-2 text-zinc-700">
              <li>
                <strong>General:</strong>{" "}
                <a
                  href="mailto:hello@openby.com"
                  className="text-blue-600 hover:underline"
                >
                  hello@openby.com
                </a>
              </li>
              <li>
                <strong>Support:</strong>{" "}
                <a
                  href="mailto:support@openby.com"
                  className="text-blue-600 hover:underline"
                >
                  support@openby.com
                </a>
              </li>
              <li>
                <strong>Privacy & Legal:</strong>{" "}
                <a
                  href="mailto:privacy@openby.com"
                  className="text-blue-600 hover:underline"
                >
                  privacy@openby.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-gradient-to-b from-blue-50/40 via-indigo-50/30 to-white py-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_50%_at_50%_50%,rgba(59,130,246,0.18),rgba(168,85,247,0.08),transparent_55%)]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-xl font-bold text-zinc-900">
            Ready to find the best deals?
          </h2>
          <p className="mt-2 text-zinc-600">
            Start searching for products and let our AI help you decide when to buy.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            Start Searching
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
