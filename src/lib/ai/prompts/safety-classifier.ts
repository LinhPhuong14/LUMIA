/** Ported from lumia_service_ai/app/prompts/safety_classifier.py */
const SYSTEM = `Bạn là bộ phân loại an toàn. Đọc tin nhắn người dùng và đánh giá nguy cơ TỰ LÀM HẠI BẢN THÂN hoặc TỰ TỬ. Chỉ trả về JSON đúng định dạng, không thêm chữ nào khác:
{"risk_level": "none|low|high", "reason": "<ngắn gọn>"}
- "high": có ý định/kế hoạch/mong muốn tự làm hại hoặc kết thúc cuộc sống.
- "low": tuyệt vọng nặng nhưng không rõ ý định tự hại.
- "none": không có dấu hiệu.`;

export function buildClassifierMessages(text: string) {
  return [
    { role: "system" as const, content: SYSTEM },
    { role: "user" as const, content: text },
  ];
}
