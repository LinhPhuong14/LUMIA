import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingColumnError } from "@/lib/supabase/errors";

/**
 * Cài đặt quyền riêng tư của một người dùng.
 *
 * Hai công tắc này là lời hứa với người dùng, nên chỗ nào ghi dữ liệu nhạy cảm
 * đều phải hỏi qua đây — lưu cờ mà không ai đọc thì vẫn là công tắc giả, chỉ là
 * giả một cách tốn công hơn.
 */
export type PrivacySettings = {
  /** Lưu lịch sử trò chuyện với LUMIA vào `chat_messages`. */
  saveChats: boolean;
  /** Cho phép đưa nội dung nhật ký vào ngữ cảnh gửi cho mô hình AI. */
  allowJournalAi: boolean;
};

/**
 * Mặc định cho NGƯỜI DÙNG MỚI — khớp với DEFAULT của cột trong migration 030.
 * Cả hai công tắc đều bật: đây là mặc định của sản phẩm, người dùng tự tắt.
 */
export const PRIVACY_DEFAULTS: PrivacySettings = {
  saveChats: true,
  allowJournalAi: true,
};

/**
 * Mặc định khi KHÔNG ĐỌC ĐƯỢC hồ sơ. Khác với mặc định người dùng mới ở trên,
 * và khác có chủ đích.
 *
 * Ở đây ta không biết người dùng đã chọn gì, nên hai cờ nghiêng về hai phía
 * theo cùng một nguyên tắc: chọn phía mà đoán sai còn sửa được.
 *
 * - `saveChats: true` — đoán sai thì lưu thừa một cuộc trò chuyện, xoá được.
 *   Đoán false sẽ âm thầm vứt lịch sử của người không hề tắt nó, không lấy lại.
 * - `allowJournalAi: false` — đoán sai thì AI mất một chút ngữ cảnh trong vài
 *   phút DB trục trặc. Đoán true sẽ gửi nhật ký của người ĐÃ TỰ TẮT cho bên thứ
 *   ba, và không thu lại được.
 *
 * Vậy nên bật mặc định cho người mới (030) KHÔNG kéo theo việc bật ở nhánh lỗi:
 * "mặc định bật" nói về người chưa chọn, còn nhánh này nói về lúc ta mù.
 */
export const PRIVACY_FALLBACK: PrivacySettings = {
  saveChats: true,
  allowJournalAi: false,
};

export async function getPrivacySettings(userId: string): Promise<PrivacySettings> {
  const admin = createAdminClient();
  if (!admin) {
    return PRIVACY_FALLBACK;
  }

  const { data, error } = await admin
    .from("profiles")
    .select("save_chats, allow_journal_ai")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    // Chưa chạy migration 029 thì cột không tồn tại — chạy tiếp bằng mặc định
    // thay vì chặn cả luồng chat, nhưng phải kêu lên để còn biết mà chạy.
    if (isMissingColumnError(error)) {
      console.error("[privacy] chưa chạy migration 029_privacy_settings.sql");
    } else {
      console.error("[privacy] read failed:", error.code, error.message);
    }
    return PRIVACY_FALLBACK;
  }

  const row = data as { save_chats?: boolean | null; allow_journal_ai?: boolean | null } | null;

  return {
    saveChats: row?.save_chats ?? PRIVACY_FALLBACK.saveChats,
    allowJournalAi: row?.allow_journal_ai ?? PRIVACY_FALLBACK.allowJournalAi,
  };
}
