import { SAFETY_PHRASES } from "@/lib/ai/safety/keywords";

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function tripwireHit(text: string) {
  const norm = normalize(text);
  return SAFETY_PHRASES.some((phrase) => norm.includes(normalize(phrase)));
}
