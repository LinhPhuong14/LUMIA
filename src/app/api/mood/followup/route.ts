import { NextResponse } from "next/server";
import { z } from "zod";

import { llmComplete } from "@/lib/ai/llm";
import { hasLlmConfig } from "@/lib/env";
import { buildFollowUp } from "@/lib/mood-followup";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";

const schema = z.object({
  score: z.number().int().min(1).max(5),
  note: z.string().max(500).optional(),
  prevScore: z.number().int().min(1).max(5).nullable().optional(),
});

const SYSTEM = `Bạn là LUMIA — ứng dụng chăm sóc sức khỏe tinh thần. Sau khi người dùng check-in tâm trạng, hãy tạo một gợi ý ngắn gọn, đồng cảm bằng tiếng Việt.

Quy tắc quan trọng:
- Nếu ghi chú (note) mâu thuẫn với điểm số (ví dụ điểm cao nhưng nội dung buồn), hãy ưu tiên phản hồi theo CẢM XÚC THỰC trong ghi chú — đừng chúc mừng người buồn.
- Phản hồi 1-2 câu, ấm áp, không phán xét, không lâm sàng.
- Kết thúc bằng một gợi ý hành động phù hợp: thiền, âm thanh thư giãn, nhật ký, hơi thở, hoặc nói chuyện với LUMIA.
- Trả về JSON hợp lệ theo định dạng:
{"message":"...","cta_label":"...","cta_href":"..."}
- cta_href chỉ được là một trong: /audio/meditation, /audio/sleep, /audio, /journal, /audio/breathing, /ai
- Không thêm bất kỳ nội dung nào ngoài JSON.`;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { score, note, prevScore } = parsed.data;

  // If LLM not configured, fall back to static
  if (!hasLlmConfig()) {
    const fu = buildFollowUp(score as 1 | 2 | 3 | 4 | 5, note, prevScore ?? null);
    return NextResponse.json(fu);
  }

  const scoreLabels: Record<number, string> = {
    1: "rất tệ",
    2: "hơi buồn",
    3: "bình thường",
    4: "khá tốt",
    5: "rất tốt",
  };

  const userContent = [
    `Điểm tâm trạng: ${score}/5 (${scoreLabels[score]})`,
    note ? `Ghi chú của người dùng: "${note}"` : "Không có ghi chú.",
    prevScore != null && prevScore !== score
      ? `Trước đó điểm là ${prevScore}/5, vừa thay đổi sang ${score}/5.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const raw = await llmComplete([
      { role: "system", content: SYSTEM },
      { role: "user", content: userContent },
    ]);

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const parsed2 = JSON.parse(jsonMatch[0]) as {
      message: string;
      cta_label: string;
      cta_href: string;
    };

    const VALID_HREFS = new Set([
      "/audio/meditation",
      "/audio/sleep",
      "/audio",
      "/journal",
      "/audio/breathing",
      "/ai",
    ]);

    return NextResponse.json({
      message: String(parsed2.message ?? ""),
      cta: {
        label: String(parsed2.cta_label ?? "Khám phá"),
        href: VALID_HREFS.has(parsed2.cta_href) ? parsed2.cta_href : "/audio",
      },
    });
  } catch {
    // Fall back to static on any LLM error
    const fu = buildFollowUp(score as 1 | 2 | 3 | 4 | 5, note, prevScore ?? null);
    return NextResponse.json(fu);
  }
}
