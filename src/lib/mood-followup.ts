import type { MoodScore } from "@/lib/mood-constants";

export type FollowUp = {
  message: string;
  cta: { label: string; href: string };
};

function excerpt(note: string | undefined): string {
  if (!note) return "";
  const clean = note.trim();
  if (clean.length <= 32) return `"${clean}"`;
  return `"${clean.slice(0, 30).trimEnd()}…"`;
}

// Mood-change aware followup (when user updates mood after a previous check-in)
function buildChangeFollowUp(prev: MoodScore, next: MoodScore, note?: string): FollowUp | null {
  const delta = next - prev;
  if (delta >= 2) {
    return {
      message: note
        ? `Thật vui khi nghe bạn cảm thấy tốt hơn! ${excerpt(note)} - hãy tiếp tục giữ năng lượng đó bằng một bản thiền dịu nhẹ.`
        : `Bạn đã cảm thấy tốt hơn rồi - từ ${prev}/5 lên ${next}/5. Thật tốt! Kết thúc ngày bằng một buổi thiền để giữ mãi cảm giác này.`,
      cta: { label: "Nghe thiền", href: "/audio/meditation" },
    };
  }
  if (delta === 1) {
    return {
      message: note
        ? `Đã nhỉnh hơn một chút rồi - ${excerpt(note)}. Tiếp tục với một âm thanh nhẹ nhàng nhé.`
        : `Cảm xúc đang nhích lên - từ ${prev}/5 lên ${next}/5. Một âm thanh dịu sẽ giúp bạn duy trì đà này.`,
      cta: { label: "Nghe soundscape", href: "/audio/sleep" },
    };
  }
  if (delta <= -2) {
    return {
      message: note
        ? `Mình nhận ra bạn đang cảm thấy khó hơn so với lúc trước. ${excerpt(note)} - không sao cả, LUMIA ở đây với bạn.`
        : `Có vẻ tâm trạng đã nặng hơn - từ ${prev}/5 xuống ${next}/5. Đôi khi cảm xúc lên xuống là điều bình thường. Hãy để LUMIA lắng nghe.`,
      cta: { label: "Tâm sự với LUMIA", href: "/ai" },
    };
  }
  return null; // small change - use standard followup
}

const POOLS: Record<MoodScore, ((note?: string) => FollowUp)[]> = {
  1: [
    (note) => ({
      message: note
        ? `Cảm ơn bạn đã kể về ${excerpt(note)}. Những lúc nặng như vậy, đôi khi chỉ cần được nói ra là đã nhẹ hơn một chút rồi.`
        : "Ngày hôm nay có vẻ thật nặng. Không cần phải ổn ngay - cứ cho phép mình cảm thấy thế này đã.",
      cta: { label: "Nói chuyện với LUMIA", href: "/ai" },
    }),
    (note) => ({
      message: note
        ? `Mình nghe thấy bạn rồi. ${excerpt(note)} - điều đó không hề nhỏ. Hãy để tối nay là thời gian dành riêng cho bạn.`
        : "Một ngày khó là ngày bạn cần được chăm sóc nhất. Hãy để LUMIA ở cạnh bạn tối nay.",
      cta: { label: "Tâm sự với LUMIA", href: "/ai" },
    }),
  ],
  2: [
    (note) => ({
      message: note
        ? `Hơi buồn sau ${excerpt(note)} là điều rất bình thường. Âm thanh nhẹ nhàng đôi khi giúp tâm trí lắng xuống hơn bất kỳ lời nào.`
        : "Khi lòng hơi nặng, đôi khi chỉ cần một giai điệu dịu là đủ để thở thong thả hơn.",
      cta: { label: "Nghe âm thanh thư giãn", href: "/audio" },
    }),
    (note) => ({
      message: note
        ? `Bạn đã chia sẻ ${excerpt(note)} - cảm ơn vì sự trung thực đó. Viết thêm vài dòng vào nhật ký hôm nay nhé?`
        : "Hôm nay hơi buồn - không sao cả. Viết ra đôi ba dòng đôi khi giúp cảm xúc tìm được chỗ để đặt xuống.",
      cta: { label: "Mở nhật ký", href: "/journal" },
    }),
  ],
  3: [
    (note) => ({
      message: note
        ? `${excerpt(note)} - một ngày ổn có giá trị không kém ngày tuyệt vời. Hãy ghi lại để nhìn lại sau này.`
        : "Một ngày ổn là nền móng tốt để xây thêm. Có muốn ghi chú lại điều gì đó cho hôm nay không?",
      cta: { label: "Viết nhật ký", href: "/journal" },
    }),
    () => ({
      message:
        "Ổn là một điểm khởi đầu tốt. Thêm một nghi thức nhỏ tối nay - âm thanh, hơi thở - và ngày mai sẽ được bắt đầu khác đi.",
      cta: { label: "Bắt đầu nghi thức tối", href: "/audio/sleep" },
    }),
  ],
  4: [
    (note) => ({
      message: note
        ? `Thật vui khi nghe về ${excerpt(note)}! Hãy cùng giữ năng lượng đó bằng một buổi thiền ngắn tối nay nhé.`
        : "Một ngày khá tốt - đáng được ghi lại để những ngày khó hơn bạn có thể nhìn lại và nhớ ra cảm giác này.",
      cta: { label: "Ghi lại vào nhật ký", href: "/journal" },
    }),
    (note) => ({
      message: note
        ? `${excerpt(note)} - nghe có vẻ một ngày có ý nghĩa! Tiếp tục với một buổi âm thanh dịu dàng để kết thúc tốt hơn nữa nhé.`
        : "Khá tốt rồi! Hãy để tối nay trọn vẹn hơn với một chút soundscape trước khi ngủ.",
      cta: { label: "Nghe âm thanh ngủ ngon", href: "/audio/sleep" },
    }),
  ],
  5: [
    (note) => ({
      message: note
        ? `Thật tuyệt khi biết về ${excerpt(note)}! Hãy cùng giữ mãi cảm giác này - viết xuống để không quên nhé.`
        : "Rất vui! Những ngày như hôm nay xứng đáng được lưu lại. Hãy ghi vào nhật ký để nhìn lại khi cần.",
      cta: { label: "Lưu vào nhật ký", href: "/journal" },
    }),
    (note) => ({
      message: note
        ? `${excerpt(note)} - nghe thật ấm lòng! Kết thúc ngày bằng một buổi nghe thiền nhẹ để giữ năng lượng này sang ngày mai nhé.`
        : "Hôm nay rất tốt! Để kết thúc hoàn hảo hơn, hãy cùng thư giãn với một bản thiền ngắn tối nay.",
      cta: { label: "Thiền kết thúc ngày", href: "/audio/meditation" },
    }),
  ],
};

export function buildFollowUp(score: MoodScore, note?: string, prevScore?: MoodScore | null): FollowUp {
  // If there was a previous score this session and it changed, use the change-aware message
  if (prevScore != null && prevScore !== score) {
    const changeFollowUp = buildChangeFollowUp(prevScore, score, note);
    if (changeFollowUp) return changeFollowUp;
  }
  const pool = POOLS[score];
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx]!(note);
}
