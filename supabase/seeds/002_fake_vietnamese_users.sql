-- Seed: 3000 fake Vietnamese users with realistic names
-- Run in Supabase SQL Editor (needs access to the auth schema — use the SQL Editor, not the app).
--
-- How it works:
--   Inserting into auth.users fires the existing triggers:
--     auth.users  -> handle_new_user            -> profiles + subscriptions(free) + streaks
--     profiles    -> handle_new_user_notifications -> notification_settings
--   So we only insert into auth.users; everything else cascades automatically.
--
--   Every seeded user is tagged with raw_app_meta_data->>'seed' = 'fake_vi' so they are
--   easy to find and remove later (see the rollback at the bottom of this file).
--
--   All accounts share the password  Lumia@123  (they are for demo/populate only).

DO $$
DECLARE
  v_pw text;
  v_existing int;

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
  SELECT count(*) INTO v_existing FROM auth.users WHERE raw_app_meta_data->>'seed' = 'fake_vi';
  IF v_existing > 0 THEN
    RAISE NOTICE 'Already seeded % fake users (seed=fake_vi). Skipping to avoid duplicates.', v_existing;
    RETURN;
  END IF;

  -- Hash the shared demo password once, then reuse it for all rows (fast).
  v_pw := extensions.crypt('Lumia@123', extensions.gen_salt('bf'));

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  )
  WITH pick AS (
    SELECT
      g AS n,
      (random() < 0.52)                                                  AS fem,
      (random() < 0.72)                                                  AS has_dem,
      ho[1 + floor(random() * array_length(ho, 1))::int]                 AS s_ho,
      dem_nu[1 + floor(random() * array_length(dem_nu, 1))::int]         AS d_nu,
      ten_nu[1 + floor(random() * array_length(ten_nu, 1))::int]         AS t_nu,
      dem_nam[1 + floor(random() * array_length(dem_nam, 1))::int]       AS d_nam,
      ten_nam[1 + floor(random() * array_length(ten_nam, 1))::int]       AS t_nam,
      dom[1 + floor(random() * array_length(dom, 1))::int]               AS domain,
      -- Spread signups across the last ~18 months for a natural-looking list
      (now()
        - (random() * 540 || ' days')::interval
        - (random() * 86400 || ' seconds')::interval)                    AS ts
    FROM generate_series(1, 3000) g
  ),
  built AS (
    SELECT
      n, ts, domain,
      s_ho
        || CASE WHEN has_dem THEN ' ' || CASE WHEN fem THEN d_nu ELSE d_nam END ELSE '' END
        || ' ' || CASE WHEN fem THEN t_nu ELSE t_nam END                 AS full_name,
      CASE WHEN fem THEN t_nu ELSE t_nam END                             AS given
    FROM pick
  )
  SELECT
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    -- ASCII email derived from the given name (diacritics stripped) + row number for uniqueness
    lower(translate(
      given,
      'áàảãạâấầẩẫậăắằẳẵặéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ',
      'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd'
    )) || n::text || '@' || domain,
    v_pw,
    ts,
    jsonb_build_object(
      'provider', 'email',
      'providers', jsonb_build_array('email'),
      'seed', 'fake_vi'
    ),
    jsonb_build_object('full_name', full_name),
    ts,
    ts,
    '', '', '', ''
  FROM built;

  RAISE NOTICE 'Seeded 3000 fake Vietnamese users (seed=fake_vi, password=Lumia@123).';
END $$;

-- ── Rollback ──────────────────────────────────────────────────────────────────
-- Removing the auth.users rows cascades to profiles / subscriptions / streaks /
-- notification_settings (all FKs are ON DELETE CASCADE):
--
--   DELETE FROM auth.users WHERE raw_app_meta_data->>'seed' = 'fake_vi';
