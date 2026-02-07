"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type FAQItem = {
  question: string;
  answer: string;
};

type FAQSectionProps = {
  items: FAQItem[];
};

export function FAQSection({ items }: FAQSectionProps) {
  return (
    <Accordion type="single" collapsible className="space-y-3">
      {items.map(({ question, answer }) => (
        <AccordionItem
          key={question}
          value={question}
          className="rounded-xl border border-zinc-200/80 bg-white px-0 shadow-sm transition-all duration-300 data-[state=open]:shadow-md data-[state=open]:ring-1 data-[state=open]:ring-blue-500/10"
        >
          <AccordionTrigger className="px-6 py-5 text-left font-medium text-zinc-900 hover:no-underline hover:text-zinc-700 [&[data-state=open]>svg]:rotate-180">
            {question}
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-5 pt-0">
            <div className="border-t border-zinc-100 pt-5 text-zinc-600 leading-relaxed">
              {answer}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
