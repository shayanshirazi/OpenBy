"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Send, ChevronDown } from "lucide-react";
import { askProductQuestion } from "@/app/actions";
import {
  type ProductQAModelKey,
  PRODUCT_QA_MODEL_LABELS,
  PRODUCT_QA_MODEL_LOGOS,
} from "@/lib/product-qa";

type Message = { role: "user" | "assistant"; content: string };

type ProductQASectionProps = {
  productTitle: string;
  productDescription: string;
};

const MODEL_KEYS: ProductQAModelKey[] = ["openai", "gemini", "claude"];

function TypingMessage({ content }: { content: string }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (content.length === 0) {
      setDone(true);
      return;
    }
    setDisplayed("");
    setDone(false);
    let i = 0;
    const step = Math.max(1, Math.ceil(content.length / 40));
    const id = setInterval(() => {
      i = Math.min(i + step, content.length);
      setDisplayed(content.slice(0, i));
      if (i >= content.length) {
        setDone(true);
        clearInterval(id);
      }
    }, 20);
    return () => clearInterval(id);
  }, [content]);

  return (
    <p className="text-sm leading-relaxed">
      {displayed}
      {!done && <span className="inline-block w-2 h-4 ml-0.5 animate-pulse bg-zinc-600 align-middle" />}
    </p>
  );
}

export function ProductQASection({ productTitle, productDescription }: ProductQASectionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState<ProductQAModelKey>("gemini");
  const [loading, setLoading] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [lastAssistantIndex, setLastAssistantIndex] = useState(-1);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setModelDropdownOpen(false);

    const result = await askProductQuestion(
      productTitle,
      productDescription,
      trimmed,
      model
    );

    setLoading(false);

    if ("content" in result) {
      setMessages((prev) => {
        const next = [...prev, { role: "assistant", content: result.content }];
        setLastAssistantIndex(next.length - 1);
        return next;
      });
    } else {
      setMessages((prev) => {
        const next = [...prev, { role: "assistant", content: `Error: ${result.error}` }];
        setLastAssistantIndex(next.length - 1);
        return next;
      });
    }
  };

  return (
    <section className="relative z-20 overflow-visible border-b border-zinc-200/80 py-16">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/60 via-blue-50/40 to-violet-50/50" />
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99,102,241,0.15) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_20%,rgba(99,102,241,0.12),transparent_60%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/80 to-transparent" />

      <div className="relative mx-auto w-full max-w-2xl px-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Ask About This Product
          </h2>
          <p className="mt-2 text-zinc-600">
            Get specific answers from the same AI models used above
          </p>
        </div>

        <div className="overflow-visible rounded-2xl border border-zinc-200/80 bg-white/95 shadow-xl shadow-indigo-500/5 backdrop-blur-sm">
          {messages.length > 0 && (
            <div className="flex max-h-72 flex-col gap-4 overflow-y-auto border-b border-zinc-200/80 bg-gradient-to-b from-zinc-50/50 to-white p-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white"
                        : "bg-white border border-zinc-200/80 text-zinc-800"
                    }`}
                  >
                    {msg.role === "assistant" && i === lastAssistantIndex ? (
                      <TypingMessage content={msg.content} />
                    ) : (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-zinc-200/80 bg-white px-4 py-2.5 shadow-sm">
                    <span className="inline-flex gap-1 text-sm text-zinc-500">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" />
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2 rounded-2xl p-4 bg-white/80">
            {/* Custom model dropdown with logos */}
            <div className="relative z-[9999]">
              <button
                type="button"
                onClick={() => setModelDropdownOpen((o) => !o)}
                onBlur={() => setTimeout(() => setModelDropdownOpen(false), 150)}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                <Image
                  src={PRODUCT_QA_MODEL_LOGOS[model]}
                  alt=""
                  width={20}
                  height={20}
                  className="rounded object-contain"
                />
                <span>{PRODUCT_QA_MODEL_LABELS[model]}</span>
                <ChevronDown
                  className={`h-4 w-4 text-zinc-500 transition-transform ${modelDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {modelDropdownOpen && (
                <div className="absolute left-0 top-full z-[9999] mt-1 w-48 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
                  {MODEL_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setModel(key);
                        setModelDropdownOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-zinc-50 ${
                        model === key ? "bg-indigo-50 text-indigo-700" : "text-zinc-700"
                      }`}
                    >
                      <Image
                        src={PRODUCT_QA_MODEL_LOGOS[key]}
                        alt=""
                        width={24}
                        height={24}
                        className="rounded object-contain"
                      />
                      <span className="font-medium">{PRODUCT_QA_MODEL_LABELS[key]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a specific question"
              disabled={loading}
              className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:bg-zinc-50 disabled:text-zinc-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-md shadow-blue-500/30 transition-all hover:enabled:bg-blue-600 hover:enabled:shadow-lg hover:enabled:shadow-blue-500/40 active:enabled:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
              aria-label="Send"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>

        {messages.length === 0 && (
          <p className="mt-3 text-center text-sm text-zinc-500">
            Example: &quot;Is this a good value for the specs?&quot; or &quot;When might the price drop?&quot;
          </p>
        )}
      </div>
    </section>
  );
}
