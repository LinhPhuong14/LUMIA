import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PRIVACY_DEFAULTS, PRIVACY_FALLBACK } from "@/lib/privacy";

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

describe("PRIVACY_DEFAULTS", () => {
  it("người dùng mới được bật cả hai — khớp DEFAULT của cột ở migration 030", () => {
    expect(PRIVACY_DEFAULTS).toEqual({ saveChats: true, allowJournalAi: true });
  });
});

describe("PRIVACY_FALLBACK", () => {
  /**
   * Hai hằng số này CỐ Ý khác nhau. Test khoá lại để một lần "dọn dẹp cho nhất
   * quán" không biến nhánh lỗi thành nhánh gửi nhật ký.
   */
  it("khác PRIVACY_DEFAULTS: mặc định-bật nói về người chưa chọn, fallback nói về lúc ta mù", () => {
    expect(PRIVACY_FALLBACK).not.toEqual(PRIVACY_DEFAULTS);
  });

  it("đọc hụt thì VẪN lưu chat: đoán sai chỉ là lưu thừa, xoá được", () => {
    expect(PRIVACY_FALLBACK.saveChats).toBe(true);
  });

  it("đọc hụt thì KHÔNG gửi nhật ký, kể cả khi mặc định sản phẩm là bật", () => {
    // Người đã TỰ TẮT mà gặp lúc DB trục trặc thì không được bị gửi nhật ký —
    // mất chút ngữ cảnh thì sửa được, gửi nhầm thì không thu lại.
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
