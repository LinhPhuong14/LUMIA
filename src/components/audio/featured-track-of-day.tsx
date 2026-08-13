"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { AudioArtwork } from "@/components/audio/audio-artwork";
import { useAudioPlayer } from "@/components/audio/audio-player-provider";

type Track = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  categoryLabel: string;
  duration_seconds: number | null;
  thumbnail_url: string | null;
};

type Recommendation = { track: Track | null; reason: string | null };

/**
 * Chiều cao cố định cho cả khối.
 *
 * Trước đây khối này cao bao nhiêu là tuỳ độ dài chữ AI trả về, mà chữ chỉ có
 * sau khi gọi xong mô hình — nên vào trang là thấy nó bung ra và đẩy toàn bộ
 * lưới danh mục bên dưới tụt xuống. Khoá chiều cao từ đầu thì lúc dữ liệu về
 * không có gì xê dịch; lời giải thích dài hơn chỗ chứa thì tự cuộn trong khối.
 */
const PANEL_HEIGHT = "min-h-[188px] sm:min-h-[172px]";

function formatMeta(track: Track): string {
  const minutes = track.duration_seconds ? Math.round(track.duration_seconds / 60) : null;
  return minutes ? `${track.categoryLabel} · ${minutes} phút` : track.categoryLabel;
}

export function FeaturedTrackOfDay() {
  const [data, setData] = useState<Recommendation | null>(null);
  const [failed, setFailed] = useState(false);
  const { play } = useAudioPlayer();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/audio/recommendation")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("failed"))))
      .then((json: Recommendation) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Đang chờ mô hình chọn — nói rõ đang chờ CÁI GÌ, vì lần gọi này lâu hơn hẳn
  // một truy vấn thường và một dòng "Đang tải..." trống trơn sẽ khiến người
  // dùng tưởng trang bị treo.
  if (!data && !failed) {
    return (
      <section className={`dash-panel flex flex-col justify-center p-5 sm:p-6 ${PANEL_HEIGHT}`}>
        <span className="eyebrow">Gợi ý hôm nay</span>
        <div className="mt-4 flex items-center gap-3">
          <span
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[var(--green)] border-t-transparent"
            aria-hidden
          />
          <p className="text-sm text-[var(--muted)]">LUMIA AI đang chọn audio cho bạn…</p>
        </div>
        <div className="mt-4 space-y-2" aria-hidden>
          <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--surface-warm)]" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-[var(--surface-warm)]" />
        </div>
      </section>
    );
  }

  const track = data?.track ?? null;

  if (failed || !track) {
    return (
      <section className={`dash-panel flex flex-col justify-center p-5 sm:p-6 ${PANEL_HEIGHT}`}>
        <span className="eyebrow">Gợi ý hôm nay</span>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {failed
            ? "Chưa lấy được gợi ý lúc này. Bạn có thể chọn trực tiếp trong thư viện bên dưới."
            : "Thư viện đang được chuẩn bị. Hãy quay lại sau nhé."}
        </p>
      </section>
    );
  }

  return (
    <section className={`dash-panel flex flex-col p-5 sm:p-6 ${PANEL_HEIGHT}`}>
      <div className="flex items-center gap-2">
        <span className="eyebrow">Gợi ý hôm nay</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--green-wash)] px-2 py-0.5 text-[10px] font-semibold text-[var(--green-deep)]">
          <Sparkles className="h-3 w-3" />
          LUMIA AI
        </span>
      </div>

      <div className="mt-3 flex min-h-0 flex-1 gap-4">
        <div className="hidden h-[84px] w-[84px] shrink-0 overflow-hidden rounded-[16px] sm:block">
          <AudioArtwork
            thumbnailUrl={track.thumbnail_url}
            category={track.category}
            title={track.title}
          />
        </div>

        {/* Vùng cuộn: lời giải thích của AI dài ngắn không đoán trước được, nên
            cho nó cuộn trong khối thay vì kéo dãn cả khối. */}
        <div className="lumia-scroll min-h-0 flex-1 overflow-y-auto pr-1">
          <h2 className="font-sans text-lg font-medium text-matcha-text">{track.title}</h2>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">{formatMeta(track)}</p>
          {data?.reason ? (
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{data.reason}</p>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={() => play(track)}
        className="button-primary mt-4 shrink-0 self-start text-[13px]"
      >
        Nghe ngay
      </button>
    </section>
  );
}
