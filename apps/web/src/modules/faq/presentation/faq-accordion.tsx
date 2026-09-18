"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { FaqItem } from "../domain/faq.entity";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [abiertaId, setAbiertaId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const abierta = abiertaId === item.id;
        return (
          <div key={item.id} className="rounded-xl border border-border bg-surface overflow-hidden">
            <button
              onClick={() => setAbiertaId(abierta ? null : item.id)}
              className="w-full flex items-center justify-between gap-3 p-4 text-left"
              aria-expanded={abierta}
            >
              <span className="font-medium text-foreground text-sm">{item.pregunta}</span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${
                  abierta ? "rotate-180" : ""
                }`}
              />
            </button>
            {abierta && (
              <p className="px-4 pb-4 text-sm text-muted-foreground whitespace-pre-line">
                {item.respuesta}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
