"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const OVERLAY_PRESETS = {
  matcha: "rgba(240,243,236,0.45)",
  dark: "rgba(30,40,25,0.55)",
  none: "transparent",
} as const;

type AspectRatio = "16/9" | "4/3" | "1/1" | "3/4";

const aspectClasses: Record<AspectRatio, string> = {
  "16/9": "aspect-video",
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
  "3/4": "aspect-[3/4]",
};

const STOCK_PHOTOS: Record<string, string> = {
  "woman sleeping peacefully nature": "photo-1541781774459-bb2af2f05b55",
  "woman meditation morning light": "photo-1506126613408-eca07ce68773",
  "small gift box herbs tea": "photo-1513201099705-a9746e25e981",
  "green leaves morning dew season": "photo-1466781783364-bde7bc13fa33",
  "candle tea silk sleep wellness": "photo-1515377905703-c4788e51ed15",
  "luxury wellness gift set flat lay": "photo-1608571423902-eed4a5ad8108",
  "asian woman calm natural light portrait": "photo-1534528741775-53994a69daeb",
  "rain window dark night bokeh": "photo-1421940864922-4d4b88dfd447",
  "open book candle night reading": "photo-1512820790802-83ca734da794",
  "moonlight bedroom minimal": "photo-1522771739844-6a9f6d5f14af",
  "ambient music vinyl night": "photo-1470225620780-dba8ba36b745",
  "forest morning light meditation": "photo-1506905925346-21bda4d32df4",
  "ocean waves calm breathing": "photo-1505142468610-359e7d316be0",
  "green leaf dewdrop close up": "photo-1463936575859-5662b2f2e1b9",
  "calm wellness": "photo-1544367567-0f2fcb009e0b",
};

function buildStockUrl(query: string, width = 800) {
  const photoId = STOCK_PHOTOS[query] ?? STOCK_PHOTOS["calm wellness"];
  return `https://images.unsplash.com/${photoId}?w=${width}&q=80&auto=format&fit=crop`;
}

export interface PhotoImageProps {
  src?: string;
  stockQuery?: string;
  alt: string;
  overlay?: keyof typeof OVERLAY_PRESETS;
  overlayOpacity?: number;
  aspectRatio?: AspectRatio;
  botanical?: boolean;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  height?: number;
  width?: number;
}

export function PhotoImage({
  src,
  stockQuery,
  alt,
  overlay = "none",
  overlayOpacity,
  aspectRatio,
  botanical = false,
  className,
  priority = false,
  fill = false,
  height,
  width,
}: PhotoImageProps) {
  const isPlaceholder = !src;
  const imageSrc = src ?? buildStockUrl(stockQuery ?? "calm wellness");
  const overlayColor =
    overlayOpacity !== undefined && overlay !== "none"
      ? OVERLAY_PRESETS[overlay].replace(/[\d.]+\)$/, `${overlayOpacity})`)
      : OVERLAY_PRESETS[overlay];

  const useFill = fill || (!height && !aspectRatio);

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        aspectRatio ? aspectClasses[aspectRatio] : "",
        useFill ? "h-full w-full" : "",
        className,
      )}
      style={!useFill && height ? { height, width: width ?? "100%" } : undefined}
    >
      <Image
        src={imageSrc}
        alt={alt}
        fill={useFill}
        width={!useFill && width ? width : undefined}
        height={!useFill && height ? height : undefined}
        priority={priority}
        data-placeholder={isPlaceholder ? "true" : undefined}
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      {overlay !== "none" ? (
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{ background: overlayColor }}
        />
      ) : null}
      {botanical ? (
        <svg
          className="pointer-events-none absolute bottom-2 right-2 z-[2] opacity-30"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden
        >
          <path
            d="M16 4C12 10 8 14 6 20c4-2 8-2 10 0 2-6 6-10 10-16-4 4-6 8-6 12s2 8 6 12c-2-6-2-12 0-18z"
            fill="#7d8f68"
            opacity="0.5"
          />
        </svg>
      ) : null}
    </div>
  );
}

export const PRODUCT_STOCK_QUERIES: Record<string, string> = {
  first_time: "small gift box herbs tea",
  standard: "woman meditation morning light",
  plus: "green leaves morning dew season",
  pro: "data analytics wellness dashboard",
  premium: "candle tea silk sleep wellness",
  ultimate: "luxury wellness gift set flat lay",
  saver: "green leaves morning dew season",
  sleep_well: "candle tea silk sleep wellness",
  master: "luxury wellness gift set flat lay",
};

export const AUDIO_STOCK_QUERIES: Record<string, string> = {
  sleep_sound: "rain window dark night bokeh",
  sleep_cast: "open book candle night reading",
  wind_down: "moonlight bedroom minimal",
  sleep_music: "ambient music vinyl night",
  guided_meditation: "forest morning light meditation",
  breathing: "ocean waves calm breathing",
  mini_meditation: "green leaf dewdrop close up",
};
