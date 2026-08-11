import { describe, expect, it } from "vitest";

import {
  describeSchemaError,
  isMissingColumnError,
  isMissingTableError,
} from "@/lib/supabase/errors";

describe("isMissingTableError", () => {
  it("nhận mã lỗi Postgres cho bảng không tồn tại", () => {
    expect(isMissingTableError({ code: "42P01", message: "whatever" })).toBe(true);
  });

  it("nhận cả câu chữ của PostgREST — nó không luôn trả mã", () => {
    expect(
      isMissingTableError({ message: `relation "public.feedback" does not exist` }),
    ).toBe(true);
    expect(
      isMissingTableError({ message: "Could not find the table 'public.feedback' in the schema cache" }),
    ).toBe(true);
  });

  it("không nhầm lỗi thường thành thiếu bảng", () => {
    expect(isMissingTableError({ code: "23505", message: "duplicate key value" })).toBe(false);
    expect(isMissingTableError(null)).toBe(false);
    expect(isMissingTableError(undefined)).toBe(false);
  });
});

describe("isMissingColumnError", () => {
  it("nhận cột chưa tồn tại", () => {
    expect(isMissingColumnError({ code: "42703", message: "x" })).toBe(true);
    expect(
      isMissingColumnError({ message: `column "payment_method" does not exist` }),
    ).toBe(true);
  });

  it("không nhầm với lỗi khác", () => {
    expect(isMissingColumnError({ code: "23503", message: "foreign key violation" })).toBe(false);
  });
});

describe("describeSchemaError", () => {
  it("chỉ thẳng vào file migration cần chạy", () => {
    const message = describeSchemaError(
      { code: "42P01", message: `relation "public.feedback" does not exist` },
      "028_create_feedback.sql",
    );
    expect(message).toContain("028_create_feedback.sql");
    expect(message).toContain("Supabase SQL Editor");
  });

  it("lỗi khác thì giữ nguyên văn — đừng diễn giải thứ mình không hiểu", () => {
    expect(
      describeSchemaError({ code: "23505", message: "duplicate key value" }, "028_create_feedback.sql"),
    ).toBe("duplicate key value");
  });
});
