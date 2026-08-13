/**
 * Dò xem ID ảnh Unsplash nào trong `src/components/ui/photo-image.tsx` đã chết.
 *
 * Ảnh nền của app trỏ tới Unsplash bằng ID gắn cứng. Tác giả gỡ ảnh lúc nào là
 * URL chết lúc đó, không có cảnh báo. Script này gọi thẳng từng ID và in ra mã
 * HTTP, để biết cái nào cần thay.
 *
 * Chạy:  node scripts/check-stock-photos.mjs
 */

import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/components/ui/photo-image.tsx", import.meta.url), "utf8");

// Bắt các cặp "mô tả": "photo-..." trong bảng STOCK_PHOTOS.
const entries = [...source.matchAll(/"([^"]+)":\s*"(photo-[^"]+)"/g)].map(([, query, id]) => ({ query, id }));

if (entries.length === 0) {
  console.error("Không đọc được bảng STOCK_PHOTOS — cấu trúc file có thể đã đổi.");
  process.exit(1);
}

console.log(`Đang kiểm ${entries.length} ảnh…\n`);

let dead = 0;

for (const { query, id } of entries) {
  const url = `https://images.unsplash.com/${id}?w=80&q=60&auto=format&fit=crop`;
  let status;
  try {
    // HEAD đủ để biết ảnh còn hay không mà không tải cả tấm ảnh về.
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    status = res.status;
  } catch (error) {
    status = `LỖI MẠNG (${error instanceof Error ? error.message : error})`;
  }

  const ok = status === 200;
  if (!ok) dead += 1;
  console.log(`${ok ? "✅" : "❌"} ${String(status).padEnd(16)} ${query}\n   ${id}`);
}

if (dead === 0) {
  console.log("\nTất cả ảnh còn sống.");
} else if (dead === entries.length) {
  // Ảnh chết lẻ tẻ là chuyện bình thường; chết SẠCH thì gần như chắc chắn là
  // mạng bị chặn (proxy công ty, tường lửa) chứ không phải Unsplash xoá hết.
  console.log(
    `\nCẢ ${dead} ảnh đều hỏng — nhiều khả năng máy này không ra được images.unsplash.com` +
      "\nchứ không phải ảnh chết. Thử lại trên mạng khác trước khi đi thay ID.",
  );
} else {
  console.log(`\n${dead} ảnh đã chết — thay ID trong STOCK_PHOTOS bằng ảnh khác trên unsplash.com.`);
}
process.exit(dead === 0 ? 0 : 1);
