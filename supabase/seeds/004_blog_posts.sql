-- Seed: nạp 6 bài blog khởi điểm vào bảng blog_posts.
--
-- Sinh tự động từ src/data/blog-posts.ts — đừng sửa tay file này, sửa file
-- nguồn rồi chạy lại script sinh.
--
-- Vì sao cần nạp: cho tới khi bảng có bài publish, mọi chỗ đọc blog (trang
-- danh sách, khối trang chủ, widget dashboard, sitemap) đều rơi về 6 bài tĩnh
-- trong code. Sitemap vì thế công bố 6 URL đó cho Google. Đến lúc admin đăng
-- bài thật đầu tiên, DB thành nguồn sự thật duy nhất và 6 URL kia lập tức 404
-- — tức là Google đang giữ 6 đường dẫn hỏng. Nạp chúng vào DB ngay từ đầu thì
-- không bao giờ có bước hẫng đó, và admin sửa hay xoá được chúng như bài thường.
--
-- Chạy trong Supabase SQL Editor, SAU migration 033_blog_schema.sql.
-- An toàn khi chạy lại: ON CONFLICT DO NOTHING nên không ghi đè bài admin đã sửa.

INSERT INTO public.blog_posts
  (slug, title, excerpt, content, category, emoji, cover_color, read_time, published, published_at)
VALUES
  (
    $lumia_seed$giac-ngu-va-cam-xuc$lumia_seed$,
    $lumia_seed$Giấc ngủ và cảm xúc: Tại sao ngủ đủ giấc thay đổi tâm trạng của bạn$lumia_seed$,
    $lumia_seed$Khoa học đã chứng minh rằng chỉ một đêm ngủ kém chất lượng có thể khiến phản ứng cảm xúc tăng lên đến 60%.$lumia_seed$,
    $lumia_seed$Giấc ngủ không chỉ là thời gian nghỉ ngơi — đó là quá trình cơ thể tự phục hồi và não bộ xử lý cảm xúc từ ngày hôm đó.

**Liên hệ giữa giấc ngủ và cảm xúc**

Trong giai đoạn ngủ REM (Rapid Eye Movement), não bộ xử lý ký ức cảm xúc và "detox" các hormone căng thẳng như cortisol. Khi thiếu ngủ, amygdala — vùng não phụ trách phản ứng cảm xúc — trở nên kém kiểm soát hơn.

**Dấu hiệu giấc ngủ ảnh hưởng đến cảm xúc của bạn**

- Dễ cáu gắt hơn bình thường
- Khó tập trung vào công việc
- Cảm thấy lo lắng mà không rõ lý do
- Quyết định kém hiệu quả

**Cách cải thiện**

1. Đặt giờ ngủ cố định mỗi ngày
2. Tránh màn hình 1 giờ trước khi ngủ
3. Tạo nghi thức thư giãn trước khi ngủ
4. Theo dõi cảm xúc hàng ngày với LUMIA$lumia_seed$,
    $lumia_seed$Khoa học giấc ngủ$lumia_seed$,
    $lumia_seed$🌙$lumia_seed$,
    $lumia_seed$linear-gradient(135deg, #e8f4e8 0%, #c8e6c9 100%)$lumia_seed$,
    5,
    true,
    $lumia_seed$2025-06-01$lumia_seed$::timestamptz
  ),
  (
    $lumia_seed$nghi-thuc-ngu-cho-nguoi-ban-ron$lumia_seed$,
    $lumia_seed$5 nghi thức ngủ đơn giản cho người bận rộn$lumia_seed$,
    $lumia_seed$Không cần thiền 1 tiếng hay spa tốn kém. Chỉ 15 phút chuẩn bị đúng cách giúp bạn ngủ sâu hơn.$lumia_seed$,
    $lumia_seed$Với lịch trình bận rộn, nhiều người bỏ qua các nghi thức trước khi ngủ. Nhưng chỉ cần 15 phút đúng cách có thể thay đổi hoàn toàn chất lượng giấc ngủ.

**1. Đặt điện thoại xa tầm tay**

Ánh sáng xanh từ màn hình ức chế melatonin — hormone giấc ngủ. Hãy để điện thoại ở đầu giường hoặc phòng khác.

**2. Uống trà thảo mộc ấm**

Trà hoa cúc, lavender hoặc trà thảo mộc Lumia giúp thư giãn hệ thần kinh và chuẩn bị cơ thể cho giấc ngủ.

**3. Viết 3 điều biết ơn**

Nghiên cứu tâm lý học cho thấy viết nhật ký biết ơn trước khi ngủ giảm lo lắng và cải thiện cảm giác hạnh phúc.

**4. Thở theo kỹ thuật 4-7-8**

Hít vào 4 giây, giữ 7 giây, thở ra 8 giây. Lặp 3-4 lần để kích hoạt hệ thần kinh phó giao cảm.

**5. Tạo nhiệt độ phòng lý tưởng**

Nhiệt độ phòng từ 18-22°C là lý tưởng cho giấc ngủ sâu. Mở cửa sổ hoặc dùng quạt nếu cần.$lumia_seed$,
    $lumia_seed$Nghi thức & Thói quen$lumia_seed$,
    $lumia_seed$✨$lumia_seed$,
    $lumia_seed$linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)$lumia_seed$,
    4,
    true,
    $lumia_seed$2025-06-05$lumia_seed$::timestamptz
  ),
  (
    $lumia_seed$thien-dinh-va-giac-ngu$lumia_seed$,
    $lumia_seed$Thiền định và giấc ngủ: Bằng chứng khoa học từ 10.000 người dùng$lumia_seed$,
    $lumia_seed$Dữ liệu từ người dùng LUMIA cho thấy 15 phút thiền định mỗi tối giúp rút ngắn thời gian vào giấc ngủ tới 40%.$lumia_seed$,
    $lumia_seed$Thiền định không chỉ là xu hướng — đây là phương pháp có nền tảng khoa học vững chắc trong cải thiện giấc ngủ.

**Những gì khoa học nói**

Nghiên cứu đăng trên JAMA Internal Medicine (2015) với 49 người trung niên cho thấy thiền chánh niệm cải thiện đáng kể chứng mất ngủ, mệt mỏi và trầm cảm so với nhóm kiểm soát.

**Dữ liệu từ người dùng LUMIA**

Phân tích ẩn danh từ cộng đồng người dùng LUMIA (2024-2025):
- 78% người dùng thiền đều đặn báo cáo ngủ dễ hơn
- Thời gian vào giấc trung bình giảm từ 32 phút xuống 19 phút
- Điểm chất lượng giấc ngủ tự báo cáo tăng 35%

**Cách bắt đầu thiền cho giấc ngủ**

Bắt đầu với chỉ 5 phút mỗi tối. Dùng tính năng thiền có hướng dẫn trong LUMIA hoặc đơn giản là tập trung vào hơi thở.$lumia_seed$,
    $lumia_seed$Thiền & Mindfulness$lumia_seed$,
    $lumia_seed$🧘$lumia_seed$,
    $lumia_seed$linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)$lumia_seed$,
    6,
    true,
    $lumia_seed$2025-06-10$lumia_seed$::timestamptz
  ),
  (
    $lumia_seed$am-nhac-cho-giac-ngu$lumia_seed$,
    $lumia_seed$Âm nhạc cho giấc ngủ: Loại nào thực sự hiệu quả?$lumia_seed$,
    $lumia_seed$Từ tiếng mưa đến white noise, từ nhạc cổ điển đến ASMR — phân tích khoa học về âm thanh và giấc ngủ.$lumia_seed$,
    $lumia_seed$Não người phản ứng với âm thanh ngay cả khi đang ngủ. Lựa chọn đúng loại âm nhạc có thể là chìa khóa cho giấc ngủ sâu.

**Khoa học đằng sau âm thanh và giấc ngủ**

Nhịp sóng não khi ngủ (delta waves: 0.5-4 Hz) có thể được đồng bộ hóa với âm thanh bên ngoài — hiệu ứng được gọi là brainwave entrainment.

**Loại âm thanh hiệu quả nhất**

1. **Pink noise** (tiếng mưa, thác nước): Giảm hoạt động não và tăng giấc ngủ sóng chậm
2. **White noise**: Che khuất âm thanh môi trường, giúp ngủ sâu hơn
3. **Nhạc 60 BPM**: Đồng bộ nhịp tim với nhịp nghỉ ngơi
4. **ASMR**: Kích hoạt cảm giác thư giãn qua âm thanh nhỏ

**Những gì KHÔNG nên nghe**

- Nhạc có lời (kích hoạt vùng ngôn ngữ của não)
- Nhạc với nhịp > 120 BPM
- Podcast hoặc audiobook (não tiếp tục xử lý thông tin)

Khám phá bộ sưu tập âm thanh thiền định của LUMIA để tìm loại phù hợp với bạn.$lumia_seed$,
    $lumia_seed$Khoa học giấc ngủ$lumia_seed$,
    $lumia_seed$🎵$lumia_seed$,
    $lumia_seed$linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)$lumia_seed$,
    5,
    true,
    $lumia_seed$2025-06-15$lumia_seed$::timestamptz
  ),
  (
    $lumia_seed$stress-va-giac-ngu$lumia_seed$,
    $lumia_seed$Vòng luẩn quẩn stress-mất ngủ và cách thoát khỏi$lumia_seed$,
    $lumia_seed$Stress khiến khó ngủ, mất ngủ làm tăng stress. Nhưng có những chiến lược khoa học để phá vỡ vòng tròn này.$lumia_seed$,
    $lumia_seed$Stress và giấc ngủ có mối quan hệ hai chiều: căng thẳng gây mất ngủ, và mất ngủ làm tình trạng căng thẳng trầm trọng hơn.

**Cơ chế sinh học**

Khi stress, tuyến thượng thận tiết cortisol và adrenaline — hai hormone "chiến đấu hoặc bỏ chạy". Trong trạng thái này, cơ thể không thể chuyển sang chế độ nghỉ ngơi.

**Nhận biết bạn đang trong vòng luẩn quẩn**

- Nằm xuống nhưng tâm trí không dừng lại
- Thức dậy lúc 2-4 giờ sáng với suy nghĩ lo lắng  
- Cảm thấy mệt nhưng không thể ngủ
- Hiệu suất công việc giảm → thêm áp lực → càng khó ngủ

**5 chiến lược phá vỡ vòng luẩn quẩn**

1. Kỹ thuật "worry time": Đặt 20 phút cố định trong ngày để lo lắng, không phải trước khi ngủ
2. Progressive Muscle Relaxation (PMR): Căng và thả từng nhóm cơ
3. Viết nhật ký lo lắng: Đổ lo lắng ra giấy để "đặt nó xuống"
4. Hạn chế xem tin tức sau 8 giờ tối
5. Tập thể dục đều đặn (nhưng không sau 9 giờ tối)

LUMIA cung cấp các bài thiền và công cụ theo dõi cảm xúc giúp bạn nhận biết và quản lý stress tốt hơn.$lumia_seed$,
    $lumia_seed$Sức khỏe tinh thần$lumia_seed$,
    $lumia_seed$🌿$lumia_seed$,
    $lumia_seed$linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)$lumia_seed$,
    7,
    true,
    $lumia_seed$2025-06-20$lumia_seed$::timestamptz
  ),
  (
    $lumia_seed$san-pham-huong-thom-cho-giac-ngu$lumia_seed$,
    $lumia_seed$Hương thơm và giấc ngủ: Aromatherapy có thực sự hiệu quả?$lumia_seed$,
    $lumia_seed$Khoa học về liệu pháp hương thơm và những sản phẩm LUMIA giúp tạo không gian ngủ lý tưởng.$lumia_seed$,
    $lumia_seed$Liệu pháp hương thơm (aromatherapy) có lịch sử hàng nghìn năm, nhưng khoa học hiện đại đang dần xác nhận hiệu quả của nó với giấc ngủ.

**Bằng chứng khoa học**

Nghiên cứu trên tạp chí Journal of Alternative and Complementary Medicine cho thấy hương lavender giảm nhịp tim, huyết áp và nhiệt độ da — tất cả đều là dấu hiệu cơ thể đang thư giãn.

**Các mùi hương tốt nhất cho giấc ngủ**

1. **Lavender (Oải Hương)**: Hiệu quả nhất, được nghiên cứu nhiều nhất
2. **Chamomile (Hoa Cúc)**: Giảm lo lắng và căng thẳng
3. **Sandalwood (Gỗ Đàn Hương)**: Tạo cảm giác bình an sâu
4. **Bergamot (Cam Bergamot)**: Giảm cortisol, cải thiện tâm trạng
5. **Jasmine (Hoa Nhài)**: Giảm hoạt động não khi ngủ

**Sản phẩm LUMIA cho hương thơm**

Bộ sưu tập tinh dầu xịt LUMIA (Oải Hương, Trà Trắng, Bạch Đàn Chanh, Hoa Lài) được chiết xuất 100% từ thiên nhiên. Xịt nhẹ lên gối và không gian ngủ 15-20 phút trước khi ngủ để đạt hiệu quả tốt nhất.$lumia_seed$,
    $lumia_seed$Sản phẩm & Wellbeing$lumia_seed$,
    $lumia_seed$🕯️$lumia_seed$,
    $lumia_seed$linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)$lumia_seed$,
    4,
    true,
    $lumia_seed$2025-06-25$lumia_seed$::timestamptz
  )
ON CONFLICT (slug) DO NOTHING;

-- Kiểm tra nhanh sau khi chạy.
SELECT count(*) AS so_bai_da_dang FROM public.blog_posts WHERE published = true;
