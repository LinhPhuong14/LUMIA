-- Seed: hồ sơ streak 14 ngày cho hello@lumia.com
--
-- Cửa sổ dữ liệu: 2026-08-21 → 2026-09-03 (14 ngày liên tiếp, tính từ 3/9 đổ lại).
-- Đổi mốc kết thúc ở biến v_end_date bên dưới thì cả cửa sổ trượt theo.
--
-- Chạy trong Supabase SQL Editor (cần đọc schema `auth` để tra user id).
-- Chạy SAU 001_test_account.sql — file đó mới là chỗ bật admin + subscription
-- active cho hello@lumia.com, mà tab Hành trình chỉ mở khi subscription active.
--
-- Nạp gì:
--   streaks         current_streak = 14, last_active_date = ngày cuối cửa sổ
--   mood_checkins   1 lượt check-in / ngày, điểm 2→5 theo nhịp tăng dần
--   activity_logs   2-4 hoạt động / ngày (mood, journal, audio, chat, breathing, timer)
--   journal_entries 6 bài nhật ký rải trong cửa sổ
--
-- An toàn khi chạy lại: xoá sạch dữ liệu cũ trong đúng cửa sổ rồi chèn lại, nên
-- activity_logs (bảng không có unique key) cũng không bị nhân đôi.
--
-- LƯU Ý 1 — v_trim_before: mặc định TRUE, xoá dữ liệu của đúng MỘT ngày liền
-- trước cửa sổ (2026-08-20). Không có bước này, nếu tài khoản đã có check-in
-- ngày 20/8 thì heatmap sẽ vẽ một mạch dài hơn 14 ngày, trái với con số streak.
-- Đặt FALSE nếu muốn giữ nguyên mọi dữ liệu cũ.
--
-- LƯU Ý 2 — longest_streak lấy GREATEST(kỷ lục cũ, 14) để không xoá mất kỷ lục
-- thật. Muốn ép đúng 14 thì đổi GREATEST(...) thành v_days ở cuối file.

DO $seed$
DECLARE
  v_email        text    := 'hello@lumia.com';
  v_end_date     date    := DATE '2026-09-03';  -- ngày cuối của streak
  v_trim_before  boolean := true;               -- xem LƯU Ý 1
  v_tz           text    := 'Asia/Ho_Chi_Minh'; -- khớp DEFAULT_TZ trong src/lib/local-date.ts

  v_user_id      uuid;
  v_days         int;
  v_start_date   date;
  v_span         int;
  v_longest      int;
  v_moods        int;
  v_acts         int;
  v_journals     int;
  v_trimmed      int := 0;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Không tìm thấy user % — tạo tài khoản trước rồi chạy lại.', v_email;
    RETURN;
  END IF;

  -- Bình thường trigger handle_new_user đã tạo sẵn dòng streaks; thêm cho chắc.
  INSERT INTO public.streaks (user_id) VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- ── Kịch bản từng ngày ──────────────────────────────────────────────────────
  -- day_offset: 0 = v_end_date, 13 = ngày đầu cửa sổ.
  DROP TABLE IF EXISTS _lumia_streak_days;
  CREATE TEMP TABLE _lumia_streak_days (
    day_offset int PRIMARY KEY,
    mood_score int  NOT NULL,
    mood_note  text NOT NULL,
    activities public.activity_type[] NOT NULL,
    journal    text
  ) ON COMMIT DROP;

  INSERT INTO _lumia_streak_days (day_offset, mood_score, mood_note, activities, journal) VALUES
    (13, 2, 'Đêm qua trằn trọc tới gần 2h. Cài LUMIA, nghe thử soundscape trước khi ngủ.',
        ARRAY['mood','audio','journal']::public.activity_type[],
        $j$Tuần thứ ba liên tiếp mình ngủ chập chờn. Không hẳn vì lo chuyện gì cụ thể, chỉ là nằm xuống rồi đầu vẫn chạy. Thử app này xem sao, đặt mục tiêu nhỏ thôi: mỗi tối ghi lại một dòng.$j$),
    (12, 3, 'Ngủ được hơn đêm qua một chút. Nghe mưa 10 phút rồi ngủ.',
        ARRAY['mood','audio']::public.activity_type[], NULL),
    (11, 4, 'Ngủ dậy nhẹ người hơn hôm qua. Tập thở trước khi đi bộ buổi sáng.',
        ARRAY['mood','breathing','audio']::public.activity_type[], NULL),
    (10, 2, 'Đầu tuần dồn việc, đầu óc căng. Viết ra được vài dòng thì đỡ hơn.',
        ARRAY['mood','journal','chat']::public.activity_type[],
        $j$Deadline dồn hết vào sáng nay nên mình phản ứng hơi gắt với đồng nghiệp. Ngồi lại mới thấy không phải do việc, mà do đêm qua ngủ chưa đủ. Ghi ra đây để mai nhớ: ngủ trước 23h.$j$),
    (9,  3, 'Bình thường. Tối nghe soundscape lúc dọn nhà.',
        ARRAY['mood','audio']::public.activity_type[], NULL),
    (8,  3, 'Ổn định. Thở 4-7-8 trước khi ngủ, vào giấc nhanh hơn.',
        ARRAY['mood','breathing']::public.activity_type[], NULL),
    (7,  4, 'Ngày dễ chịu. Ngủ đủ giấc thật sự có khác.',
        ARRAY['mood','journal','audio']::public.activity_type[],
        $j$Tuần này mình giữ được nhịp đi ngủ đều 6 đêm liền. Điều thay đổi rõ nhất không phải là ngủ nhiều hơn, mà là buổi sáng không còn cảm giác phải kéo lê bản thân dậy.$j$),
    (6,  4, 'Cuối tuần tới rồi. Ngồi thiền 15 phút với timer.',
        ARRAY['mood','timer']::public.activity_type[], NULL),
    (5,  5, 'Ngày tốt nhất từ đầu tháng. Cà phê sáng với bạn cũ.',
        ARRAY['mood','journal','audio','breathing']::public.activity_type[],
        $j$Gặp lại Hà sau gần một năm. Nhận ra mình đã bỏ lỡ khá nhiều thứ vì cứ nghĩ bận. Từ giờ mỗi tháng hẹn một người, không cần dịp gì đặc biệt.$j$),
    (4,  4, 'Chủ nhật chậm rãi. Nghe nhạc ngủ từ sớm.',
        ARRAY['mood','audio']::public.activity_type[], NULL),
    (3,  3, 'Thứ hai nhưng không tệ như tuần trước. Có tiến bộ.',
        ARRAY['mood','chat','breathing']::public.activity_type[], NULL),
    (2,  4, 'Tập trung tốt cả ngày. Ghi lại vài điều biết ơn buổi tối.',
        ARRAY['mood','journal','audio']::public.activity_type[],
        $j$Ba điều của hôm nay: cà phê pha vừa tay, họp xong sớm 20 phút, và mẹ gọi điện chỉ để hỏi thăm chứ không có việc gì.$j$),
    (1,  4, 'Đều đặn. Thiền 10 phút rồi đi ngủ đúng giờ.',
        ARRAY['mood','timer','audio']::public.activity_type[], NULL),
    (0,  5, 'Tròn 14 ngày liên tục. Nhịp sinh hoạt đã thành thói quen.',
        ARRAY['mood','journal','breathing','audio']::public.activity_type[],
        $j$Mười bốn ngày liền không bỏ buổi nào. Ban đầu mình mở app vì thấy phải mở, giờ thì tối đến tự động với tay lấy điện thoại bật soundscape. Mục tiêu tiếp theo: 21 ngày.$j$);

  SELECT count(*), max(day_offset) - min(day_offset) + 1
    INTO v_days, v_span
  FROM _lumia_streak_days;

  IF v_days <> v_span THEN
    RAISE EXCEPTION 'Kịch bản có % dòng nhưng trải trên % ngày — day_offset bị trùng hoặc hụt.', v_days, v_span;
  END IF;

  v_start_date := v_end_date - (v_days - 1);

  -- ── Dọn cửa sổ trước khi chèn (chạy lại không nhân đôi) ─────────────────────
  DELETE FROM public.activity_logs
   WHERE user_id = v_user_id AND date BETWEEN v_start_date AND v_end_date;
  DELETE FROM public.mood_checkins
   WHERE user_id = v_user_id AND date BETWEEN v_start_date AND v_end_date;
  DELETE FROM public.journal_entries
   WHERE user_id = v_user_id AND date BETWEEN v_start_date AND v_end_date;

  -- Cắt đúng 1 ngày liền trước để mạch streak bắt đầu chính xác ở v_start_date.
  IF v_trim_before THEN
    DELETE FROM public.activity_logs
     WHERE user_id = v_user_id AND date = v_start_date - 1;
    GET DIAGNOSTICS v_trimmed = ROW_COUNT;

    DELETE FROM public.mood_checkins
     WHERE user_id = v_user_id AND date = v_start_date - 1;
    DELETE FROM public.journal_entries
     WHERE user_id = v_user_id AND date = v_start_date - 1;
  END IF;

  -- ── Check-in cảm xúc: 1 dòng / ngày ─────────────────────────────────────────
  INSERT INTO public.mood_checkins (user_id, score, note, date, created_at)
  SELECT
    v_user_id,
    d.mood_score,
    d.mood_note,
    v_end_date - d.day_offset,
    ((v_end_date - d.day_offset) + TIME '21:15') AT TIME ZONE v_tz
  FROM _lumia_streak_days d;
  GET DIAGNOSTICS v_moods = ROW_COUNT;

  -- ── Nhật ký hoạt động: chính là thứ giữ mạch streak ─────────────────────────
  INSERT INTO public.activity_logs (user_id, activity_type, date, created_at)
  SELECT
    v_user_id,
    a.activity_type,
    v_end_date - d.day_offset,
    ((v_end_date - d.day_offset) + TIME '20:00' + (a.ord::int * INTERVAL '25 minutes')) AT TIME ZONE v_tz
  FROM _lumia_streak_days d
  CROSS JOIN LATERAL unnest(d.activities) WITH ORDINALITY AS a(activity_type, ord);
  GET DIAGNOSTICS v_acts = ROW_COUNT;

  -- ── Bài nhật ký ─────────────────────────────────────────────────────────────
  INSERT INTO public.journal_entries (user_id, content, prompt_used, date, created_at)
  SELECT
    v_user_id,
    d.journal,
    'Hôm nay điều gì đáng ghi lại nhất?',
    v_end_date - d.day_offset,
    ((v_end_date - d.day_offset) + TIME '21:40') AT TIME ZONE v_tz
  FROM _lumia_streak_days d
  WHERE d.journal IS NOT NULL;
  GET DIAGNOSTICS v_journals = ROW_COUNT;

  -- ── Chốt streak ─────────────────────────────────────────────────────────────
  SELECT COALESCE(longest_streak, 0) INTO v_longest
  FROM public.streaks WHERE user_id = v_user_id;

  UPDATE public.streaks
     SET current_streak   = v_days,
         longest_streak   = GREATEST(v_longest, v_days),  -- xem LƯU Ý 2
         last_active_date = v_end_date
   WHERE user_id = v_user_id;

  RAISE NOTICE 'Xong — % : streak % ngày (% → %), % check-in, % hoạt động, % bài nhật ký. Đã cắt % dòng activity ngày %. user_id = %',
    v_email, v_days, v_start_date, v_end_date, v_moods, v_acts, v_journals, v_trimmed, v_start_date - 1, v_user_id;
END $seed$;

-- ── Kiểm tra nhanh sau khi chạy ───────────────────────────────────────────────
--
--   SELECT s.current_streak, s.longest_streak, s.last_active_date
--   FROM public.streaks s
--   JOIN public.profiles p ON p.id = s.user_id
--   WHERE p.email = 'hello@lumia.com';
--
--   SELECT date, count(*) AS activities
--   FROM public.activity_logs
--   WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'hello@lumia.com')
--   GROUP BY date ORDER BY date;   -- phải ra đúng 14 ngày liên tiếp
--
-- ── Rollback ──────────────────────────────────────────────────────────────────
--
--   DO $rb$
--   DECLARE v_id uuid;
--   BEGIN
--     SELECT id INTO v_id FROM auth.users WHERE email = 'hello@lumia.com';
--     DELETE FROM public.activity_logs   WHERE user_id = v_id AND date BETWEEN '2026-08-21' AND '2026-09-03';
--     DELETE FROM public.mood_checkins   WHERE user_id = v_id AND date BETWEEN '2026-08-21' AND '2026-09-03';
--     DELETE FROM public.journal_entries WHERE user_id = v_id AND date BETWEEN '2026-08-21' AND '2026-09-03';
--     UPDATE public.streaks SET current_streak = 0, last_active_date = NULL WHERE user_id = v_id;
--   END $rb$;
