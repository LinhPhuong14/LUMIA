/** Ported from lumia_service_ai/app/guard/injection.py */
const PATTERNS = [
  "ignore previous instructions",
  "ignore all previous",
  "disregard previous",
  "system prompt",
  "you are now",
  "act as",
  "bo qua huong dan",
  "bo qua chi dan",
  "dong vai",
  "ban la mot",
  "quen het",
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function detectInjection(text: string) {
  const norm = normalize(text);
  return PATTERNS.some((p) => norm.includes(p));
}
