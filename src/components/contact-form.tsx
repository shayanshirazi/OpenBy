"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { submitFeedback } from "@/app/actions";
import { Loader2, CheckCircle } from "lucide-react";

const FEEDBACK_TYPES = [
  { value: "general", label: "General Inquiry" },
  { value: "feedback", label: "Product Feedback" },
  { value: "bug", label: "Report a Bug" },
  { value: "feature", label: "Feature Request" },
  { value: "partnership", label: "Partnership" },
];

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    setErrorMessage("");
    const result = await submitFeedback(formData);
    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMessage(result.error ?? "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-emerald-50/50 p-8 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-emerald-600" />
        <h3 className="mt-4 text-xl font-semibold text-zinc-900">Thank you!</h3>
        <p className="mt-2 text-zinc-600">
          Your message has been sent. We&apos;ll get back to you as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-zinc-700">
            Name *
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Your name"
            required
            disabled={status === "loading"}
            className="h-11"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-700">
            Email *
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            disabled={status === "loading"}
            className="h-11"
          />
        </div>
      </div>

      <div>
        <label htmlFor="type" className="mb-2 block text-sm font-medium text-zinc-700">
          Feedback Type
        </label>
        <select
          id="type"
          name="type"
          disabled={status === "loading"}
          className="h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {FEEDBACK_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium text-zinc-700">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          minLength={10}
          placeholder="Tell us what's on your mind..."
          disabled={status === "loading"}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-zinc-400 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
        />
      </div>

      {status === "error" && (
        <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-70 sm:w-auto"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </button>
    </form>
  );
}
