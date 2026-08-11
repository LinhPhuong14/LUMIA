import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PRIVACY_FALLBACK } from "@/lib/privacy";

// `vi.mock` được kéo lên đầu file, mà `PRIVACY_FALLBACK` lại import tĩnh nên
// privacy.ts được nạp ngay lúc đó — biến thường sẽ chưa kịp khởi tạo.
const { createAdminClient, maybeSingle } = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
  maybeSingle: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient }));

function adminReturning(result: unknown) {
  maybeSingle.mockResolvedValue(result);
  return {
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }),
  };
}

async function load() {
  vi.resetModules();
  return import("@/lib/privacy");
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PRIVACY_FALLBACK", () => {
  /**
   * Hai cờ nghiêng về hai phía khác nhau, có chủ đích — test khoá lại để một
   * lần "dọn dẹp cho nhất quán" không vô tình bật chia sẻ nhật ký.
   */
  it("mặc định VẪN lưu chat: đọc hụt không được âm thầm vứt dữ liệu", () => {
    expect(PRIVACY_FALLBACK.saveChats).toBe(true);
  });

  it("mặc định KHÔNG cho AI đọc nhật ký: gửi nhầm thì không thu lại được", () => {
    expect(PRIVACY_FALLBACK.allowJournalAi).toBe(false);
  });
});

describe("getPrivacySettings", () => {
  it("đọc đúng giá trị đã lưu", async () => {
    createAdminClient.mockReturnValue(
      adminReturning({ data: { save_chats: false, allow_journal_ai: true }, error: null }),
    );
    const { getPrivacySettings } = await load();

    expect(await getPrivacySettings("u1")).toEqual({ saveChats: false, allowJournalAi: true });
  });

  it("chưa có service role thì dùng mặc định an toàn", async () => {
    createAdminClient.mockReturnValue(null);
    const { getPrivacySettings } = await load();

    expect(await getPrivacySettings("u1")).toEqual(PRIVACY_FALLBACK);
  });

  it("chưa chạy migration 029 thì kêu tên migration, không im lặng", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    createAdminClient.mockReturnValue(
      adminReturning({
        data: null,
        error: { code: "42703", message: `column "save_chats" does not exist` },
      }),
    );
    const { getPrivacySettings } = await load();

    expect(await getPrivacySettings("u1")).toEqual(PRIVACY_FALLBACK);
    expect(error.mock.calls.flat().join(" ")).toContain("029_privacy_settings.sql");
  });

  it("hồ sơ chưa có dòng nào thì rơi về mặc định, không nổ", async () => {
    createAdminClient.mockReturnValue(adminReturning({ data: null, error: null }));
    const { getPrivacySettings } = await load();

    expect(await getPrivacySettings("u1")).toEqual(PRIVACY_FALLBACK);
  });

  it("cột NULL (dòng cũ trước migration) cũng rơi về mặc định", async () => {
    createAdminClient.mockReturnValue(
      adminReturning({ data: { save_chats: null, allow_journal_ai: null }, error: null }),
    );
    const { getPrivacySettings } = await load();

    expect(await getPrivacySettings("u1")).toEqual(PRIVACY_FALLBACK);
  });
});
