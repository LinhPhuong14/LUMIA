import { NextResponse } from "next/server";

import { llmComplete } from "@/lib/ai/llm";
import { hasLlmConfig } from "@/lib/env";
import { localDateString } from "@/lib/local-date";
import { getSession } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Gợi ý một track audio cho hôm nay, KÈM lý do do AI viết.
 *
 * Trước đây khối "Gợi ý hôm nay" chỉ băm ngày ra số rồi lấy track theo chỉ số
 * đó — không dựa vào gì của người dùng và không giải thích được vì sao. Giờ
 * track được chọn theo mood hôm nay, còn câu giải thích do mô hình viết dựa
 * trên đúng ngữ cảnh đó.
 */

const CALMING = ["sleep_sound", "wind_down", "sleep_music", "sleep_cast"];
const UPLIFTING = ["guided_meditation", "mini_meditation", "breathing"];

const CATEGORY_LABEL: Record<string, string> = {
  sleep_sound: "Âm thanh ngủ",
  sleep_cast: "Sleep Cast",
  wind_down: "Wind Down",
  sleep_music: "Nhạc ngủ",
  guided_meditation: "Thiền có hướng dẫn",
  mini_meditation: "Thiền ngắn",
  breathing: "Hơi thở",
  timer_ambient: "Âm nền",
};

type TrackRow = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  duration_seconds: number | null;
  is_free: boolean;
  thumbnail_url: string | null;
};

/** Câu giải thích khi chưa cấu hình LLM, hoặc khi gọi mô hình hỏng. */
function fallbackReason(track: TrackRow, moodScore: number | null): string {
  if (moodScore != null && moodScore <= 2) {
    return `Hôm nay bạn ghi nhận một ngày khá nặng, nên LUMIA chọn ${track.title} — một track dịu, không đòi hỏi bạn phải tập trung nhiều.`;
  }
  if (moodScore != null && moodScore >= 4) {
    return `Bạn đang có một ngày dễ chịu. ${track.title} giúp giữ lại nhịp đó trước khi vào giấc.`;
  }
  return `${track.title} là một điểm bắt đầu nhẹ nhàng cho buổi tối của bạn.`;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Hệ thống chưa sẵn sàng." }, { status: 503 });
  }

  const today = localDateString();

  const [tracksRes, moodRes] = await Promise.all([
    supabase
      .from("audio_tracks")
      .select("id, title, description, category, duration_seconds, is_free, thumbnail_url")
      .order("sort_order", { ascending: true }),
    supabase
      .from("mood_checkins")
      .select("score, note")
      .eq("user_id", session.id)
      .eq("date", today)
      .maybeSingle(),
  ]);

  const tracks = (tracksRes.data ?? []) as TrackRow[];
  if (tracks.length === 0) {
    return NextResponse.json({ track: null, reason: null });
  }

  const moodScore = (moodRes.data?.score as number | undefined) ?? null;
  const moodNote = (moodRes.data?.note as string | undefined) ?? null;

  // Ngày nặng thì chỉ lấy trong nhóm dịu; ngày thường mới mở sang nhóm còn lại.
  const order = moodScore != null && moodScore <= 2 ? CALMING : [...CALMING, ...UPLIFTING];
  const chosen =
    order.map((category) => tracks.find((t) => t.category === category)).find(Boolean) ?? tracks[0];

  const track = {
    id: chosen.id,
    title: chosen.title,
    description: chosen.description,
    category: chosen.category,
    categoryLabel: CATEGORY_LABEL[chosen.category] ?? "Âm thanh",
    duration_seconds: chosen.duration_seconds,
    thumbnail_url: chosen.thumbnail_url,
  };

  if (!hasLlmConfig()) {
    return NextResponse.json({ track, reason: fallbackReason(chosen, moodScore), source: "rule" });
  }

  try {
    const context = [
      `Tên track: ${chosen.title}`,
      `Nhóm: ${track.categoryLabel}`,
      chosen.description ? `Mô tả: ${chosen.description}` : null,
      moodScore != null ? `Tâm trạng hôm nay của người dùng: ${moodScore}/5` : "Hôm nay người dùng chưa ghi nhận tâm trạng.",
      // Ghi chú tâm trạng là chữ người dùng tự viết — đưa vào để lời giải thích
      // bám đúng ngày hôm nay thay vì nói chung chung.
      moodNote ? `Ghi chú của họ: "${moodNote}"` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const reason = await llmComplete([
      {
        role: "system",
        content:
          "Bạn là LUMIA, một người bạn đồng hành nhẹ nhàng về giấc ngủ và sức khoẻ tinh thần. " +
          "Viết đúng MỘT đến HAI câu tiếng Việt giải thích vì sao track audio này hợp với người dùng hôm nay. " +
          "Xưng 'LUMIA', gọi người dùng là 'bạn'. Giọng ấm, không khoa trương, không hứa hẹn chữa bệnh. " +
          "Chỉ trả về câu giải thích, không thêm tiêu đề hay dấu ngoặc kép.",
      },
      { role: "user", content: context },
    ]);

    const cleaned = reason.trim().replace(/^["']|["']$/g, "");
    return NextResponse.json({
      track,
      reason: cleaned || fallbackReason(chosen, moodScore),
      source: cleaned ? "ai" : "rule",
    });
  } catch (error) {
    // Mô hình hỏng thì vẫn phải có gợi ý — chỉ mất câu giải thích do AI viết.
    console.error("[audio/recommendation] LLM failed:", error);
    return NextResponse.json({ track, reason: fallbackReason(chosen, moodScore), source: "rule" });
  }
}
