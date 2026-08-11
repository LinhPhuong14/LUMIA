-- Migration 029: cài đặt quyền riêng tư thật cho từng người dùng
--
-- Hai công tắc trong trang Cài đặt trước đây chỉ là state cục bộ trong React:
-- bật/tắt xong hiện "Đã lưu thay đổi.", tải lại trang là về mặc định cứng. Tệ
-- hơn nữa, `allow_journal_ai` mặc định TẮT trên giao diện trong khi code vẫn
-- đưa nhật ký vào ngữ cảnh AI vô điều kiện — tức là giao diện hứa một đằng, hệ
-- thống làm một nẻo.
--
-- Mặc định giữ nguyên đúng mặc định giao diện đang hiển thị bấy lâu, để không
-- ai bị đổi thiết lập sau lưng:
--   save_chats       = true   (vẫn lưu lịch sử trò chuyện như trước)
--   allow_journal_ai = false  (AI KHÔNG được đọc nhật ký — đây là thay đổi
--                              hành vi thật, xem chú thích trong PR)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS save_chats BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_journal_ai BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.save_chats IS
  'Cho phép lưu lịch sử trò chuyện với LUMIA vào chat_messages.';
COMMENT ON COLUMN public.profiles.allow_journal_ai IS
  'Cho phép đưa nội dung nhật ký vào ngữ cảnh gửi cho mô hình AI.';
