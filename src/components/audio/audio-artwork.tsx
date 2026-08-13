"use client";

import { useState } from "react";

import { BotanicalArtwork } from "@/components/audio/botanical-artwork";
import { AUDIO_STOCK_QUERIES, PhotoImage } from "@/components/ui/photo-image";
import { cn } from "@/lib/utils";

/**
 * Ảnh bìa cho một track audio, với chuỗi dự phòng đầy đủ.
 *
 *   thumbnail_url (DB)  →  ảnh Unsplash theo thể loại  →  BotanicalArtwork
 *
 * Vì sao cần cả ba: hai nguồn đầu đều nằm ngoài tầm kiểm soát. `thumbnail_url`
 * do admin dán vào và có thể trỏ tới ảnh đã bị xoá; ảnh Unsplash gắn cứng theo
 * ID, mà tác giả gỡ ảnh lúc nào là URL chết lúc đó. Trước đây cả hai đường đều
 * không bắt lỗi, nên một ảnh hỏng hiện thành **tên bài hát dạng chữ trần** nằm
 * giữa lưới — đúng cái đang thấy trong trang Âm thanh.
 *
 * `BotanicalArtwork` là đáy an toàn: SVG vẽ tại chỗ, không gọi mạng, tô theo
 * đúng màu thể loại nên nhìn như một lựa chọn thiết kế chứ không như lỗi.
 */
export function AudioArtwork({
  thumbnailUrl,
  category,
  title,
  className,
  overlay,
  priority,
}: {
  thumbnailUrl?: string | null;
  category: string;
  title: string;
  className?: string;
  overlay?: "dark" | "matcha" | "none";
  priority?: boolean;
}) {
  // Nhớ ĐƯỜNG DẪN đã hỏng thay vì một cờ đúng/sai: đổi track là ảnh mới tự được
  // thử lại, không cần effect đặt lại cờ, và một track hỏng không kéo theo mọi
  // track sau đó dùng chung ô này.
  const [failedThumb, setFailedThumb] = useState<string | null>(null);

  const botanical = <BotanicalArtwork category={category} />;

  if (thumbnailUrl && failedThumb !== thumbnailUrl) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt={title}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailedThumb(thumbnailUrl)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <PhotoImage
      stockQuery={AUDIO_STOCK_QUERIES[category] ?? "calm wellness"}
      alt={title}
      overlay={overlay}
      priority={priority}
      fill
      className={className}
      fallback={botanical}
    />
  );
}
