import Image from "next/image";
import type { LLMModelScore } from "@/app/actions";

type LLMScoreSectionProps = {
  id?: string;
  openai: LLMModelScore;
  gemini: LLMModelScore;
  claude: LLMModelScore;
};

function ModelCard({
  name,
  logoSrc,
  score,
  text,
  error,
}: {
  name: string;
  logoSrc: string;
  score: number | null; // 1-10 scale
  text: string;
  error?: string;
}) {
  const displayScore = score != null ? score.toFixed(1) : "—";
  const scoreColor =
    score != null
      ? score >= 7
        ? "bg-emerald-100 text-emerald-700"
        : score >= 4
          ? "bg-amber-100 text-amber-700"
          : "bg-rose-100 text-rose-700"
      : "bg-zinc-100 text-zinc-500";

  return (
    <div className="flex flex-col rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-center">
        <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-zinc-50">
          <Image
            src={logoSrc}
            alt={name}
            width={56}
            height={56}
            className="object-contain p-1"
          />
        </div>
      </div>
      <h3 className="text-center text-lg font-semibold text-zinc-900">{name}</h3>
      <div className="mt-3 flex justify-center">
        <span
          className={`inline-flex min-w-[4.5rem] items-center justify-center rounded-lg px-3 py-2 text-xl font-bold ${scoreColor}`}
        >
          {displayScore}
          {score != null && <span className="text-[0.55em] font-normal opacity-90 [vertical-align:-0.4em]">/10</span>}
        </span>
      </div>
      <div className="mt-4 flex-1">
        {error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : (
          <p className="text-sm leading-relaxed text-zinc-600">{text || "No response."}</p>
        )}
      </div>
    </div>
  );
}

export function LLMScoreSection({ id, openai, gemini, claude }: LLMScoreSectionProps) {
  return (
    <section id={id} className="relative border-b border-zinc-200/80 bg-gradient-to-b from-white to-blue-50/40 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_60%_at_50%_50%,rgba(99,102,241,0.08),transparent_60%)]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            LLM Score
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-zinc-600">
            Is today a good time to buy? Each model scores from 1–10 based on price trends, seasonality, and market conditions.
            Scores feed into the OpenBy Index to guide your purchase timing.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <ModelCard
            name="OpenAI (GPT-4o)"
            logoSrc="/openai-logo.png"
            score={openai.score}
            text={openai.text}
            error={openai.error}
          />
          <ModelCard
            name="Gemini"
            logoSrc="/gemini-logo.png"
            score={gemini.score}
            text={gemini.text}
            error={gemini.error}
          />
          <ModelCard
            name="Claude"
            logoSrc="/claude-logo.png"
            score={claude.score}
            text={claude.text}
            error={claude.error}
          />
        </div>
      </div>
    </section>
  );
}
