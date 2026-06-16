import { llmComplete } from "@/lib/ai/llm";
import { buildReportSystem } from "@/lib/ai/prompts/report-reflect";

export async function runReport(params: {
  userName: string;
  summary: Record<string, unknown>;
  journalSnippets: string[];
}) {
  const dataText = [
    `Dữ liệu tuần: ${JSON.stringify(params.summary)}`,
    params.journalSnippets.length
      ? `Nhật ký: ${params.journalSnippets.map((s) => `"${s}"`).join(" | ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const messages = [
    { role: "system" as const, content: buildReportSystem(params.userName) },
    { role: "user" as const, content: dataText },
  ];

  const text = (await llmComplete(messages)).trim();
  return text;
}
