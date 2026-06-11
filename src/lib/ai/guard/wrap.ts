/** Ported from lumia_service_ai/app/guard/wrap.py */
export function wrapUserInput(text: string) {
  return `<<<USER_MESSAGE\n${text}\nEND_USER_MESSAGE>>>`;
}
