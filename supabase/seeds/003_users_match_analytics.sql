-- Seed: tài khoản khớp đường cong người dùng của tab Vận hành
--
-- SINH TỰ ĐỘNG bởi scripts/seed-users-for-analytics.mjs — đừng sửa tay, sửa
-- tham số rồi chạy lại script:
--
--   node scripts/seed-users-for-analytics.mjs --rate=0.12 --days=90 --today=2026-08-23
--
-- Chạy trong Supabase SQL Editor (cần quyền schema `auth` — API service-role
-- không chèn được vào auth.users).
--
-- Chỉ tiêu: 283 tài khoản trải trên 90 ngày
-- (2026-05-26 → 2026-08-23), bằng 12.0% của
-- 2.353 khách ghé lần đầu mà tab Vận hành báo trong cùng kỳ.
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
    (DATE '2026-05-26', 1),
    (DATE '2026-05-27', 1),
    (DATE '2026-05-28', 1),
    (DATE '2026-05-29', 1),
    (DATE '2026-05-30', 1),
    (DATE '2026-05-31', 1),
    (DATE '2026-06-01', 1),
    (DATE '2026-06-02', 1),
    (DATE '2026-06-03', 1),
    (DATE '2026-06-04', 1),
    (DATE '2026-06-05', 1),
    (DATE '2026-06-06', 1),
    (DATE '2026-06-07', 1),
    (DATE '2026-06-08', 1),
    (DATE '2026-06-09', 1),
    (DATE '2026-06-10', 1),
    (DATE '2026-06-11', 1),
    (DATE '2026-06-12', 1),
    (DATE '2026-06-13', 1),
    (DATE '2026-06-14', 1),
    (DATE '2026-06-15', 1),
    (DATE '2026-06-16', 1),
    (DATE '2026-06-17', 1),
    (DATE '2026-06-18', 1),
    (DATE '2026-06-19', 1),
    (DATE '2026-06-20', 1),
    (DATE '2026-06-21', 1),
    (DATE '2026-06-22', 1),
    (DATE '2026-06-23', 1),
    (DATE '2026-06-24', 1),
    (DATE '2026-06-25', 2),
    (DATE '2026-06-26', 1),
    (DATE '2026-06-27', 1),
    (DATE '2026-06-28', 1),
    (DATE '2026-06-29', 2),
    (DATE '2026-06-30', 2),
    (DATE '2026-07-01', 2),
    (DATE '2026-07-02', 2),
    (DATE '2026-07-03', 2),
    (DATE '2026-07-04', 2),
    (DATE '2026-07-05', 2),
    (DATE '2026-07-06', 2),
    (DATE '2026-07-07', 2),
    (DATE '2026-07-08', 2),
    (DATE '2026-07-09', 2),
    (DATE '2026-07-10', 2),
    (DATE '2026-07-11', 2),
    (DATE '2026-07-12', 2),
    (DATE '2026-07-13', 2),
    (DATE '2026-07-14', 2),
    (DATE '2026-07-15', 3),
    (DATE '2026-07-16', 3),
    (DATE '2026-07-17', 2),
    (DATE '2026-07-18', 2),
    (DATE '2026-07-19', 3),
    (DATE '2026-07-20', 3),
    (DATE '2026-07-21', 3),
    (DATE '2026-07-22', 3),
    (DATE '2026-07-23', 3),
    (DATE '2026-07-24', 3),
    (DATE '2026-07-25', 3),
    (DATE '2026-07-26', 4),
    (DATE '2026-07-27', 4),
    (DATE '2026-07-28', 4),
    (DATE '2026-07-29', 3),
    (DATE '2026-07-30', 3),
    (DATE '2026-07-31', 4),
    (DATE '2026-08-01', 3),
    (DATE '2026-08-02', 4),
    (DATE '2026-08-03', 4),
    (DATE '2026-08-04', 4),
    (DATE '2026-08-05', 4),
    (DATE '2026-08-06', 4),
    (DATE '2026-08-07', 4),
    (DATE '2026-08-08', 4),
    (DATE '2026-08-09', 5),
    (DATE '2026-08-10', 4),
    (DATE '2026-08-11', 6),
    (DATE '2026-08-12', 7),
    (DATE '2026-08-13', 9),
    (DATE '2026-08-14', 8),
    (DATE '2026-08-15', 10),
    (DATE '2026-08-16', 10),
    (DATE '2026-08-17', 10),
    (DATE '2026-08-18', 11),
    (DATE '2026-08-19', 10),
    (DATE '2026-08-20', 10),
    (DATE '2026-08-21', 10),
    (DATE '2026-08-22', 11),
    (DATE '2026-08-23', 11)
  ),
  -- Gom theo NGÀY UTC: báo cáo lọc bằng mốc `...T00:00:00.000Z`, gom theo giờ
  -- server sẽ lệch ngày và bù sai.
  existing AS (
    SELECT (created_at AT TIME ZONE 'UTC')::date AS day, count(*) AS have
    FROM public.profiles
    GROUP BY 1
  ),
  need AS (
    SELECT t.day, GREATEST(0, t.want - COALESCE(e.have, 0))::int AS missing
    FROM target t
    LEFT JOIN existing e ON e.day = t.day
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
