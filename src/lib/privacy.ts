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
 * Mặc định khi chưa đọc được.
 *
 * Hai cờ nghiêng về hai phía khác nhau, có chủ đích:
 *
 * - `saveChats: true` giữ đúng hành vi cũ. Đọc hụt mà mặc định false sẽ âm thầm
 *   vứt lịch sử trò chuyện của người không hề tắt nó — mất dữ liệu không lấy lại
 *   được.
 * - `allowJournalAi: false` vì đây là chiều nguy hiểm hơn: đọc hụt mà mặc định
 *   true sẽ gửi nhật ký của người đã tắt cho bên thứ ba. Không gửi thì chỉ mất
 *   một chút ngữ cảnh, gửi nhầm thì không thu lại được.
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
