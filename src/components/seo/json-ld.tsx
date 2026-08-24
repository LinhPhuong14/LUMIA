/**
 * Nhúng một khối JSON-LD vào trang.
 *
 * Dùng `<script type="application/ld+json">` chứ không phải thẻ meta: đây là
 * định dạng Google khuyến nghị và là dạng duy nhất diễn tả được quan hệ lồng
 * nhau (bài viết → tác giả → tổ chức → logo).
 *
 * `dangerouslySetInnerHTML` là bắt buộc — React escape nội dung text node, mà
 * JSON đã escape rồi sẽ thành JSON hỏng. Dữ liệu vào đây do chính server dựng
 * từ `JSON.stringify`, nên không có HTML thô nào lọt qua; riêng `<` được đổi
 * thành `<` để một tiêu đề bài viết chứa `</script>` không thể đóng sớm
 * thẻ script và chèn markup vào trang.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
