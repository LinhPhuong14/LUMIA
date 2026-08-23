-- Seed: tài khoản khớp đường cong người dùng của tab Vận hành
--
-- SINH TỰ ĐỘNG bởi scripts/seed-users-for-analytics.mjs — đừng sửa tay, sửa
-- tham số rồi chạy lại script:
--
--   node scripts/seed-users-for-analytics.mjs --rate=1 --days=90 --today=2026-08-23
--
-- Chạy trong Supabase SQL Editor (cần quyền schema `auth` — API service-role
-- không chèn được vào auth.users).
--
-- Chỉ tiêu: 1.494 tài khoản trải trên 90 ngày
-- (2026-05-26 → 2026-08-23), bằng 100.0% của
-- 926 khách ghé lần đầu mà tab Vận hành báo trong cùng kỳ.
--
-- BÙ CHO ĐỦ, không chèn mù: mỗi ngày đếm profile đã có (user thật + seed cũ)
-- rồi chỉ chèn phần còn thiếu, nên chạy lại nhiều lần không nhân đôi dữ liệu.
--
-- Cách hoạt động (giống 002_fake_vietnamese_users.sql):
--   auth.users -> handle_new_user            -> profiles + subscriptions(free) + streaks
--   profiles   -> handle_new_user_notifications -> notification_settings
-- nên chỉ cần chèn auth.users, phần còn lại tự cascade.
--
-- LƯU Ý về created_at: handle_new_user KHÔNG chép created_at từ auth.users sang
-- profiles (cột đó mặc định now()), mà báo cáo lại đếm theo profiles.created_at.
-- Vì vậy sau khi chèn phải UPDATE lại profiles.created_at — nếu bỏ bước này thì
-- toàn bộ tài khoản dồn vào hôm nay và biểu đồ vẫn sai.
--
-- Mật khẩu dùng chung: Lumia@123 (tài khoản chỉ để demo/làm đầy số liệu).

DO $$
DECLARE
  v_pw text;
  v_base int;
  v_inserted int;
  v_touched int;

  ho text[] := ARRAY[
    'Nguyễn','Nguyễn','Nguyễn','Trần','Trần','Lê','Lê','Phạm','Hoàng','Huỳnh',
    'Phan','Vũ','Võ','Đặng','Bùi','Đỗ','Hồ','Ngô','Dương','Lý',
    'Đào','Đoàn','Vương','Trịnh','Đinh','Lâm','Mai','Trương','Cao','Tô'
  ];
  dem_nu text[] := ARRAY[
    'Thị','Thị','Thị','Ngọc','Thu','Thanh','Phương','Hồng','Kim','Minh',
    'Diệu','Thúy','Bích','Ánh','Quỳnh','Khánh','Bảo','Hà','Gia','Yến'
  ];
  ten_nu text[] := ARRAY[
    'Anh','Linh','Hương','Lan','Hà','Trang','Ngọc','Mai','Thảo','Trâm',
    'Nhung','Yến','Vân','Hằng','Quyên','Ly','Uyên','Dung','Loan','Nga',
    'Hạnh','Phượng','Chi','Như','Thư','Huyền','Diệp','Tú','Vy','Oanh'
  ];
  dem_nam text[] := ARRAY[
    'Văn','Văn','Văn','Hữu','Đức','Minh','Quang','Công','Thành','Xuân',
    'Bá','Đình','Ngọc','Tuấn','Gia','Anh','Duy','Hoàng','Trọng','Nhật'
  ];
  ten_nam text[] := ARRAY[
    'Anh','Hùng','Dũng','Nam','Tuấn','Minh','Khánh','Hải','Sơn','Long',
    'Phong','Đạt','Bình','Kiên','Hoàng','Thắng','Trung','Vinh','Quân','Huy',
    'Bảo','Khoa','Phúc','Tài','Duy','Thành','Lâm','Nghĩa','Cường','Toàn'
  ];
  dom text[] := ARRAY['gmail.com','gmail.com','gmail.com','gmail.com','yahoo.com','outlook.com','icloud.com','hotmail.com'];
BEGIN
  -- Hash mật khẩu MỘT lần rồi dùng lại cho mọi dòng. bcrypt tốn ~100ms/lần nên
  -- gọi trong SELECT theo từng dòng sẽ biến vài trăm dòng thành hàng phút.
  v_pw := extensions.crypt('Lumia@123', extensions.gen_salt('bf'));

  -- Đánh số email tiếp nối lần chạy trước để chạy lại với --rate cao hơn không
  -- đụng email đã tạo.
  SELECT 100000 + count(*) INTO v_base
  FROM auth.users WHERE raw_app_meta_data->>'seed' = 'analytics_match';

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  )
  WITH target(day, want) AS (
    VALUES
    (DATE '2026-05-26', 4),
    (DATE '2026-05-27', 3),
    (DATE '2026-05-28', 4),
    (DATE '2026-05-29', 4),
    (DATE '2026-05-30', 4),
    (DATE '2026-05-31', 4),
    (DATE '2026-06-01', 4),
    (DATE '2026-06-02', 4),
    (DATE '2026-06-03', 4),
    (DATE '2026-06-04', 5),
    (DATE '2026-06-05', 4),
    (DATE '2026-06-06', 4),
    (DATE '2026-06-07', 6),
    (DATE '2026-06-08', 5),
    (DATE '2026-06-09', 5),
    (DATE '2026-06-10', 6),
    (DATE '2026-06-11', 6),
    (DATE '2026-06-12', 6),
    (DATE '2026-06-13', 6),
    (DATE '2026-06-14', 6),
    (DATE '2026-06-15', 6),
    (DATE '2026-06-16', 6),
    (DATE '2026-06-17', 7),
    (DATE '2026-06-18', 6),
    (DATE '2026-06-19', 8),
    (DATE '2026-06-20', 6),
    (DATE '2026-06-21', 7),
    (DATE '2026-06-22', 7),
    (DATE '2026-06-23', 8),
    (DATE '2026-06-24', 7),
    (DATE '2026-06-25', 8),
    (DATE '2026-06-26', 8),
    (DATE '2026-06-27', 8),
    (DATE '2026-06-28', 8),
    (DATE '2026-06-29', 8),
    (DATE '2026-06-30', 8),
    (DATE '2026-07-01', 8),
    (DATE '2026-07-02', 9),
    (DATE '2026-07-03', 9),
    (DATE '2026-07-04', 10),
    (DATE '2026-07-05', 9),
    (DATE '2026-07-06', 11),
    (DATE '2026-07-07', 11),
    (DATE '2026-07-08', 11),
    (DATE '2026-07-09', 11),
    (DATE '2026-07-10', 10),
    (DATE '2026-07-11', 12),
    (DATE '2026-07-12', 11),
    (DATE '2026-07-13', 11),
    (DATE '2026-07-14', 12),
    (DATE '2026-07-15', 14),
    (DATE '2026-07-16', 14),
    (DATE '2026-07-17', 13),
    (DATE '2026-07-18', 13),
    (DATE '2026-07-19', 14),
    (DATE '2026-07-20', 15),
    (DATE '2026-07-21', 16),
    (DATE '2026-07-22', 15),
    (DATE '2026-07-23', 15),
    (DATE '2026-07-24', 17),
    (DATE '2026-07-25', 17),
    (DATE '2026-07-26', 19),
    (DATE '2026-07-27', 19),
    (DATE '2026-07-28', 19),
    (DATE '2026-07-29', 18),
    (DATE '2026-07-30', 18),
    (DATE '2026-07-31', 19),
    (DATE '2026-08-01', 18),
    (DATE '2026-08-02', 19),
    (DATE '2026-08-03', 19),
    (DATE '2026-08-04', 20),
    (DATE '2026-08-05', 21),
    (DATE '2026-08-06', 22),
    (DATE '2026-08-07', 22),
    (DATE '2026-08-08', 23),
    (DATE '2026-08-09', 27),
    (DATE '2026-08-10', 23),
    (DATE '2026-08-11', 34),
    (DATE '2026-08-12', 39),
    (DATE '2026-08-13', 45),
    (DATE '2026-08-14', 42),
    (DATE '2026-08-15', 52),
    (DATE '2026-08-16', 51),
    (DATE '2026-08-17', 52),
    (DATE '2026-08-18', 58),
    (DATE '2026-08-19', 55),
    (DATE '2026-08-20', 51),
    (DATE '2026-08-21', 52),
    (DATE '2026-08-22', 59),
    (DATE '2026-08-23', 60)
  ),
  -- Gom theo NGÀY UTC: báo cáo lọc bằng mốc `...T00:00:00.000Z`, gom theo giờ
  -- server sẽ lệch ngày và bù sai.
  existing AS (
    SELECT (created_at AT TIME ZONE 'UTC')::date AS day, count(*) AS have
    FROM public.profiles
    WHERE created_at >= '2026-05-26T00:00:00Z'
      AND created_at <= '2026-08-23T23:59:59.999Z'
    GROUP BY 1
  ),
  -- Thiếu bao nhiêu so với chỉ tiêu NGÀY — dùng làm trọng số rải, không dùng
  -- trực tiếp làm số chèn.
  deficit AS (
    SELECT t.day, GREATEST(0, t.want - COALESCE(e.have, 0))::numeric AS gap
    FROM target t
    LEFT JOIN existing e ON e.day = t.day
  ),
  -- Bù theo TỔNG chứ không theo từng ngày. Chèn đủ mỗi ngày nghe thì hợp lý,
  -- nhưng nếu profile sẵn có dồn cục vào một ngày (seed 002 dồn hết vào ngày
  -- chạy nó, vì trigger không lùi created_at) thì ngày đó đã thừa mà các ngày
  -- khác vẫn chèn đủ — tổng vọt qua chỉ tiêu. Lấy tổng thiếu rồi rải theo trọng
  -- số `gap` thì tổng cuối luôn bám đúng 1494.
  totals AS (
    SELECT
      (SELECT COALESCE(sum(gap), 0) FROM deficit) AS sum_gap,
      GREATEST(0, 1494 - (
        SELECT count(*) FROM public.profiles
        WHERE created_at >= '2026-05-26T00:00:00Z'
          AND created_at <= '2026-08-23T23:59:59.999Z'
      ))::numeric AS shortfall
  ),
  share AS (
    SELECT d.day,
           CASE WHEN t.sum_gap > 0 THEN d.gap * t.shortfall / t.sum_gap ELSE 0 END AS exact
    FROM deficit d CROSS JOIN totals t
  ),
  -- Chia phần dư lớn nhất: làm tròn xuống rồi phát nốt phần lẻ cho những ngày
  -- hụt nhiều nhất, để tổng khớp đúng chứ không hụt vài đơn vị vì làm tròn.
  ranked AS (
    SELECT day, floor(exact)::int AS base,
           row_number() OVER (ORDER BY exact - floor(exact) DESC, day) AS rk
    FROM share
  ),
  need AS (
    SELECT r.day,
           (r.base + CASE
              WHEN r.rk <= (SELECT shortfall FROM totals)::int
                          - (SELECT COALESCE(sum(base), 0) FROM ranked)
              THEN 1 ELSE 0 END)::int AS missing
    FROM ranked r
  ),
  slot AS (
    SELECT n.day, row_number() OVER (ORDER BY n.day, g) AS seq
    FROM need n, generate_series(1, n.missing) g
    WHERE n.missing > 0
  ),
  pick AS (
    SELECT
      seq,
      (random() < 0.52)                                            AS fem,
      (random() < 0.72)                                            AS has_dem,
      ho[1 + floor(random() * array_length(ho, 1))::int]           AS s_ho,
      dem_nu[1 + floor(random() * array_length(dem_nu, 1))::int]   AS d_nu,
      ten_nu[1 + floor(random() * array_length(ten_nu, 1))::int]   AS t_nu,
      dem_nam[1 + floor(random() * array_length(dem_nam, 1))::int] AS d_nam,
      ten_nam[1 + floor(random() * array_length(ten_nam, 1))::int] AS t_nam,
      dom[1 + floor(random() * array_length(dom, 1))::int]         AS domain,
      -- Rải trong ngày cho tự nhiên, nhưng không vượt quá thời điểm hiện tại:
      -- ngày cuối là hôm nay và chưa trọn.
      LEAST(
        (day::text || ' 00:00:00+00')::timestamptz + (random() * interval '86399 seconds'),
        now()
      )                                                            AS ts
    FROM slot
  ),
  built AS (
    SELECT
      seq, ts, domain,
      s_ho
        || CASE WHEN has_dem THEN ' ' || CASE WHEN fem THEN d_nu ELSE d_nam END ELSE '' END
        || ' ' || CASE WHEN fem THEN t_nu ELSE t_nam END           AS full_name,
      CASE WHEN fem THEN t_nu ELSE t_nam END                       AS given
    FROM pick
  )
  SELECT
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    lower(translate(
      given,
      'áàảãạâấầẩẫậăắằẳẵặéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ',
      'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd'
    )) || (v_base + seq)::text || '@' || domain,
    v_pw,
    ts,
    jsonb_build_object(
      'provider', 'email',
      'providers', jsonb_build_array('email'),
      'seed', 'analytics_match'
    ),
    jsonb_build_object('full_name', full_name),
    ts,
    ts,
    '', '', '', ''
  FROM built
  ON CONFLICT DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  -- Bắt buộc: kéo created_at của profiles về đúng ngày của auth.users. Trigger
  -- handle_new_user không làm việc này nên thiếu bước đây là seed vô nghĩa.
  UPDATE public.profiles p
  SET created_at = u.created_at
  FROM auth.users u
  WHERE u.id = p.id
    AND u.raw_app_meta_data->>'seed' = 'analytics_match'
    AND p.created_at IS DISTINCT FROM u.created_at;

  GET DIAGNOSTICS v_touched = ROW_COUNT;

  RAISE NOTICE 'Đã chèn % tài khoản mới, chỉnh created_at cho % profile (seed=analytics_match, mật khẩu=Lumia@123).',
    v_inserted, v_touched;
  IF v_inserted = 0 THEN
    RAISE NOTICE 'Không chèn gì: số profile mỗi ngày đã đạt chỉ tiêu. Muốn nhiều hơn thì chạy lại script với --rate cao hơn.';
  END IF;
END $$;

-- ── Đối chiếu ────────────────────────────────────────────────────────────────
-- So số tài khoản/ngày với chỉ tiêu (cột thiếu = chưa đủ, âm = đã dư sẵn):
--
--   SELECT (created_at AT TIME ZONE 'UTC')::date AS ngay, count(*) AS so_tai_khoan
--   FROM public.profiles
--   WHERE created_at >= '2026-05-26T00:00:00Z'
--   GROUP BY 1 ORDER BY 1;

-- ── Gỡ bỏ ────────────────────────────────────────────────────────────────────
-- Xoá auth.users sẽ cascade sang profiles / subscriptions / streaks /
-- notification_settings (mọi FK đều ON DELETE CASCADE):
--
--   DELETE FROM auth.users WHERE raw_app_meta_data->>'seed' = 'analytics_match';
