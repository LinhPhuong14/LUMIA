# PLAN — Trích MP3 + Thumbnail từ MP4 cho mục Âm thanh

**Ngày lập:** 2026-07-16
**Loại:** Feature (client-side media processing + admin + hiển thị)
**Định dạng audio đầu ra:** opus/webm (tái dùng `compressAudio()` — KHÔNG thêm dependency)
**Runtime xử lý:** Client-side (trình duyệt admin), nhất quán với pipeline hiện có

---

## 1. Mục tiêu

Khi admin upload một file **MP4** (video) làm nguồn cho một audio track:

1. **Trích audio** khỏi MP4 → chỉ giữ phần âm thanh (bỏ hình), lưu làm `file_url` — thay vì lưu nguyên video nặng.
2. **Trích thumbnail** từ MP4 → chụp 1 khung hình làm ảnh, tự động điền `thumbnail_url` — admin không phải upload ảnh riêng.
3. **Hiển thị thumbnail** đó cho các track trong mục Âm thanh (user-facing), thay vì luôn dùng ảnh stock.

Bảng `audio_tracks` **đã có sẵn** cột `thumbnail_url`, `file_url`, `duration_seconds` → **không cần migration DB**.

---

## 2. Hiện trạng (đã khảo sát code)

| Thành phần | File | Ghi chú |
|---|---|---|
| Upload media (signed URL) | `src/app/api/admin/upload-media-url/route.ts` | Đẩy lên bucket `meditation-videos` (audio/video) |
| Tạo/sửa track | `src/app/api/admin/media/route.ts` (POST) + `[id]/route.ts` (PUT/DELETE) | Nhận `file_url`, `thumbnail_url`, `duration_seconds` |
| API audio (public) | `src/app/api/audio/route.ts` | `select("*")` → **đã trả `thumbnail_url`** trong payload |
| Nén audio client | `admin-dashboard.tsx` `compressAudio()` (dòng ~123) | Decode `AudioContext` → re-encode `MediaRecorder` → **opus/webm** |
| Nén ảnh client | `admin-dashboard.tsx` `compressImage()` (dòng ~71) | Canvas resize → JPEG |
| Upload handler admin | `admin-dashboard.tsx` `handleUpload(kind)` (dòng ~2159) | `kind: "video" \| "thumb"` |
| Hiển thị (user) | `src/components/audio/audio-category-page.tsx` | Dùng `PhotoImage` (ảnh **stock**), **KHÔNG** dùng `thumbnail_url` |
| Hiển thị (user, list đơn giản) | `src/components/audio/audio-library.tsx` | Không có ảnh |

**2 gap chính cần đóng:**

- **Gap A (extract):** Với file `video/mp4`, `needsCompress = kind==="video" && isAudioFile && size>10MB` → `isAudioFile` = `false` nên **KHÔNG** trích audio; nguyên MP4 được lưu vào `file_url`. Cũng chưa có bước trích thumbnail từ MP4.
- **Gap B (display):** `AudioCategoryPage`/`AudioLibrary` không đọc `thumbnail_url` (type `Track` còn thiếu field này), luôn render ảnh stock.

---

## 3. Quyết định kiến trúc

- **D1 — Xử lý ở client, không dùng ffmpeg.** Bám theo tiền lệ `compressAudio`/`compressImage`. Tránh ffmpeg trên Vercel (không có sẵn binary, giới hạn `maxDuration`).
- **D2 — Audio output = opus/webm** qua `compressAudio()` hiện có. `decodeAudioData` giải mã được audio-track (AAC) trong container MP4 ở Chrome/Safari/Edge. → 0 dependency mới.
- **D3 — Thumbnail = 1 khung hình chụp từ `<video>` + `<canvas>`** (không đọc cover-art nhúng). Đây là cách "đọc thumbnail của mp4" thực dụng nhất, tái dùng `compressImage`.
- **D4 — Hiển thị:** ưu tiên `thumbnail_url`; nếu rỗng thì fallback về `PhotoImage` stock hiện tại (không phá vỡ track cũ chưa có thumbnail).
- **D5 — Không migration DB.** Cột đã tồn tại.

**Đã loại:** MP3 thật (lamejs) — thêm dep + encode chậm; ffmpeg server-side — phức tạp trên Vercel.

---

## 4. Task breakdown (3 slice dọc, làm tuần tự)

### Wave 1 — Slice 1: Trích thumbnail từ MP4 (client)

**T1.1 — Thêm util `extractVideoThumbnail(file): Promise<File>`** trong `admin-dashboard.tsx` (đặt cạnh `compressImage`).
- `read_first`: `src/components/admin/admin-dashboard.tsx` dòng 61–120 (`signedUpload`, `compressImage`).
- `action`: Tạo `<video muted preload="metadata" playsInline>`, `URL.createObjectURL(file)`; `onloadedmetadata` → seek tới `Math.min(1, duration*0.1)`; `onseeked` → vẽ frame vào `<canvas>` (dùng `videoWidth/videoHeight`), `canvas.toBlob(..., "image/jpeg", 0.82)`; bọc thành `File`. Timeout ~10s + fallback trả `null` nếu decode video lỗi (vd Firefox thiếu codec). Nhớ `revokeObjectURL`.
- `acceptance_criteria`: Gọi với 1 file `.mp4` trả về `File` JPEG < ~300KB; gọi với file không giải mã được → trả `null` (không throw).

**T1.2 — Tự động điền `thumbnail_url` khi upload video trong `handleUpload("video", ...)`.**
- `read_first`: `admin-dashboard.tsx` dòng 2159–2204.
- `action`: Sau khi upload file audio thành công, nếu `raw.type.startsWith("video/")` và `form.thumbnail_url` đang rỗng → chạy `extractVideoThumbnail(raw)`; nếu có kết quả → `compressImage` → upload qua `upload-media-url` → `setForm(f => ({...f, thumbnail_url: publicUrl}))`. Bọc try/catch, thất bại chỉ `showToast` cảnh báo, không chặn luồng.
- `acceptance_criteria`: Upload 1 MP4 trong form admin → ô thumbnail tự hiện preview ảnh; nếu trích lỗi, track vẫn tạo được (thumbnail rỗng).

### Wave 2 — Slice 2: Trích audio (opus/webm) từ MP4

**T2.1 — Mở rộng điều kiện nén để bao gồm video/mp4.**
- `read_first`: `admin-dashboard.tsx` dòng 2159–2205 (biến `isAudioFile`, `needsCompress`, `readAudioDuration`).
- `action`: Thêm nhánh: nếu `raw.type.startsWith("video/")` (kind === "video") → **luôn** chạy `file = await compressAudio(raw, 64_000, onProgress)` để tách audio khỏi video (kết quả `.webm/.ogg`, không còn track hình). Giữ nguyên nhánh audio hiện có. Bảo đảm `file.type`/`file.name` (đuôi) truyền vào `upload-media-url` là của **file audio đã trích**, không phải MP4 gốc.
- Cập nhật `duration` đọc từ `url` audio đã trích (giữ `readAudioDuration`).
- `acceptance_criteria`: Upload MP4 → file trong bucket `meditation-videos` là `.webm/.ogg` (audio-only), phát được bằng `<audio>`; `file_url` trỏ tới file audio này, không phải MP4.

**T2.2 — Xử lý fallback khi `compressAudio` trả về nguyên file.**
- `read_first`: `compressAudio` dòng 128, 135–138 (trả `file` gốc nếu `AudioContext`/`MediaRecorder` không hỗ trợ hoặc decode lỗi).
- `action`: Nếu output vẫn là `video/*` (không tách được) → `showToast` cảnh báo "Trình duyệt không tách được audio, đang lưu nguyên video" và vẫn cho lưu (không chặn). Ghi rõ giới hạn này.
- `acceptance_criteria`: Trên trình duyệt không hỗ trợ → không crash, có cảnh báo, track vẫn lưu.

### Wave 3 — Slice 3: Hiển thị thumbnail trong mục Âm thanh

**T3.1 — Thêm `thumbnail_url` vào type `Track` + render trong `AudioCategoryPage`.**
- `read_first`: `src/components/audio/audio-category-page.tsx` dòng 15–23 (type), 47–107 (`renderTrackCard`).
- `action`: Thêm `thumbnail_url?: string | null` vào `Track`. Trong khối ảnh (dòng 62–78): nếu `track.thumbnail_url` → render ảnh đó (`next/image` hoặc `<img className="h-full w-full object-cover">`) thay cho `PhotoImage`; nếu rỗng → giữ `PhotoImage` stock. Giữ nguyên overlay gradient, badge duration, lock, waveform.
- `acceptance_criteria`: Track có `thumbnail_url` hiển thị đúng ảnh đó; track không có → vẫn hiện ảnh stock như cũ (không regressions).

**T3.2 — (Tùy chọn) Hiển thị thumbnail trong `AudioLibrary` và `AudioPlayerOverlay`.**
- `read_first`: `src/components/audio/audio-library.tsx`; `src/components/audio/audio-player-overlay.tsx`.
- `action`: `AudioLibrary`: thêm `thumbnail_url` vào type + 1 ô ảnh nhỏ (thumbnail nếu có). `AudioPlayerOverlay`: nếu overlay có vùng artwork, ưu tiên `thumbnail_url`.
- `acceptance_criteria`: Không bắt buộc cho MVP; nếu làm thì không phá layout hiện tại.

**T3.3 — Xác nhận payload API có `thumbnail_url`.**
- `read_first`: `src/app/api/audio/route.ts` (đã `select("*")`).
- `action`: Không cần đổi backend (đã trả `thumbnail_url`). Chỉ verify field xuất hiện trong response.
- `acceptance_criteria`: `GET /api/audio` trả object có key `thumbnail_url`.

---

## 5. Verification (goal-backward)

1. **Extract audio:** Upload 1 MP4 (có tiếng) trong admin → track mới có `file_url` là file `.webm/.ogg`, kích thước << MP4 gốc, phát nghe được.
2. **Extract thumbnail:** Cùng lần upload đó → `thumbnail_url` tự điền, preview ảnh đúng là 1 khung của video.
3. **Display:** Vào trang mục Âm thanh (`/audio/...`) → thẻ track hiển thị đúng thumbnail vừa trích; các track cũ (chưa có thumbnail) vẫn hiện ảnh stock, không lỗi.
4. **Regression:** Upload file audio thuần (mp3/m4a) vẫn hoạt động như trước; bulk upload không hỏng.
5. **Build:** `npm run build` (hoặc `next build`) pass, không lỗi type ở các file đã sửa.

## 6. must_haves

- `truths`:
  - Upload MP4 tạo ra `file_url` audio-only (không phải video) ở điều kiện trình duyệt hỗ trợ.
  - Upload MP4 tự điền `thumbnail_url` từ khung hình video khi trích thành công.
  - Track có `thumbnail_url` hiển thị ảnh đó trong mục Âm thanh.
- `prohibitions`:
  - KHÔNG thêm dependency mới (giữ opus/webm).
  - KHÔNG thêm migration DB (cột đã tồn tại).
  - KHÔNG chặn việc tạo track khi trích audio/thumbnail thất bại (phải degrade gracefully).

## 7. Rủi ro & giả định

- **R1 — Codec decode:** `decodeAudioData`/`<video>` phụ thuộc codec OS (Firefox có thể thiếu AAC/H.264). → Đã có fallback (T2.2, T1.1 trả `null`). Verify trên Chrome/Edge trước.
- **R2 — File MP4 lớn:** Decode/encode client tốn RAM & thời gian. → Nên khuyến nghị admin upload video ngắn; tận dụng `compressionProgress` UI sẵn có.
- **R3 — `<audio>` phát opus/webm:** OK trên trình duyệt hiện đại; iOS Safari cũ có thể kén → chấp nhận theo D2 (đã là hành vi hiện tại của `compressAudio`).

## 8b. File mẫu thực tế (thư mục `LUMIA VIDEO/`)

7 file MP4, đo bằng metadata Windows:

| File | Thời lượng | Kích thước | Audio |
|---|---|---|---|
| TẬP 1–7.mp4 | ~12 phút/tập | ~240 MB/tập | AAC ~128 kbps |

**Hệ quả UX (quan trọng):** `compressAudio()` re-encode **theo thời gian thực** → mỗi tập ~12 phút xử lý trong trình duyệt, 7 tập ≈ **~84 phút**. KHÔNG upload 240 MB (chỉ upload audio đã tách ~5–6 MB opus). Yêu cầu: admin **giữ tab mở** khi xử lý. Thumbnail thì nhanh (chỉ seek 1 khung).

**Đường nhanh thay thế (khuyến nghị cho 7 file lớn):** cài `ffmpeg` cục bộ, batch trích `.opus/.mp3` (64k) + `.jpg` thumbnail cho cả 7 tập → upload các file nhỏ. File audio 64k/12 phút ≈ 5–6 MB (< ngưỡng 10 MB) nên KHÔNG bị nén lại real-time khi upload.

## 9. Trạng thái triển khai (2026-07-16)

- ✅ **Slice 1** — `extractVideoThumbnail()` thêm vào `admin-dashboard.tsx`.
- ✅ **Slice 2** — `uploadFile()`: video → tách audio-only (opus/webm) + tự trích thumbnail (best-effort, non-blocking).
- ✅ **Slice 3** — `AudioCategoryPage`: render `thumbnail_url`, fallback ảnh stock.
- ✅ `tsc --noEmit` sạch; ESLint sạch trên 2 file đã sửa (6 lỗi `no-unescaped-entities` còn lại là **pre-existing**, không thuộc phạm vi feature).
- ⏳ **Chưa test runtime** — cần upload thật 1 MP4 trong admin để xác nhận (đăng nhập admin + chờ ~encode).

## 8. Artifacts phase này tạo ra

- Hàm mới: `extractVideoThumbnail(file)` trong `admin-dashboard.tsx`.
- Sửa: `handleUpload` (nhánh video → trích audio + thumbnail) trong `admin-dashboard.tsx`.
- Sửa: type `Track` + render ảnh trong `audio-category-page.tsx` (và tùy chọn `audio-library.tsx`, `audio-player-overlay.tsx`).
- Không có file backend/migration mới.
