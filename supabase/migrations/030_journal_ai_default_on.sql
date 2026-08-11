-- Migration 030: bật mặc định "cho phép LUMIA đọc nhật ký"
--
-- 029 đặt mặc định TẮT vì giao diện cũ vẫn hiển thị công tắc này ở trạng thái
-- tắt. Chủ sản phẩm quyết định để BẬT mặc định — nhật ký là ngữ cảnh chính giúp
-- AI trả lời sát với người dùng, tắt sẵn thì gần như không ai đi bật.
--
-- Cập nhật cả những dòng đang `false`: 029 vừa chạy nên mọi giá trị `false`
-- hiện tại là do mặc định của migration đặt vào, KHÔNG phải do người dùng tự
-- tắt. Chạy lại file này lần nữa sau khi đã có người tự tắt sẽ ghi đè lựa chọn
-- của họ — nên nó chỉ đúng đúng một lần, ngay sau 029.

ALTER TABLE public.profiles
  ALTER COLUMN allow_journal_ai SET DEFAULT true;

UPDATE public.profiles
   SET allow_journal_ai = true
 WHERE allow_journal_ai IS DISTINCT FROM true;

COMMENT ON COLUMN public.profiles.allow_journal_ai IS
  'Cho phép đưa nội dung nhật ký vào ngữ cảnh gửi cho mô hình AI. Mặc định bật.';
