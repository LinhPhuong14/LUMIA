import { describe, expect, it } from "vitest";

import {
  buildEnableUrl,
  describeGoogleApiError,
  extractProjectNumber,
} from "@/lib/analytics/google-errors";

const DISABLED =
  "Google Search Console API has not been used in project 844193636790 before or it is disabled. Enable it by visiting https://console.developers.google.com/apis/api/searchconsole.googleapis.com/overview?project=844193636790 then retry.";

const DENIED = "User does not have sufficient permissions for this property.";

describe("extractProjectNumber", () => {
  it("lấy được số project trong thông báo của Google", () => {
    expect(extractProjectNumber(DISABLED)).toBe("844193636790");
  });

  it("không có số project thì trả null thay vì đoán", () => {
    expect(extractProjectNumber(DENIED)).toBeNull();
    expect(extractProjectNumber("project abc")).toBeNull();
  });
});

describe("buildEnableUrl", () => {
  it("trỏ đúng service của từng API", () => {
    expect(buildEnableUrl("searchConsole", "123456")).toBe(
      "https://console.cloud.google.com/apis/library/searchconsole.googleapis.com?project=123456",
    );
    expect(buildEnableUrl("ga4", "123456")).toContain("analyticsdata.googleapis.com");
  });

  it("không có project thì vẫn cho link chung, không gắn project=null", () => {
    const url = buildEnableUrl("ga4", null);
    expect(url).not.toContain("project");
    expect(url).toContain("analyticsdata.googleapis.com");
  });
});

describe("describeGoogleApiError", () => {
  it("API chưa bật → chỉ thẳng link Enable kèm đúng số project", () => {
    const message = describeGoogleApiError(DISABLED, "searchConsole");
    expect(message).toContain("Chưa bật Google Search Console API");
    expect(message).toContain("searchconsole.googleapis.com?project=844193636790");
    expect(message).toContain("mỗi API phải bật riêng");
  });

  it("thiếu quyền → chỉ đúng màn hình cấp quyền của từng dịch vụ", () => {
    expect(describeGoogleApiError(DENIED, "ga4")).toContain("Property access management");
    expect(describeGoogleApiError(DENIED, "searchConsole")).toContain("Users and permissions");
  });

  it("nêu thẳng email service account khi biết, để khỏi phải đi tra lại", () => {
    const message = describeGoogleApiError(DENIED, "ga4", "bot@lumia.iam.gserviceaccount.com");
    expect(message).toContain("bot@lumia.iam.gserviceaccount.com");
  });

  it("nói rõ key đã đúng, để không đi sửa nhầm private key", () => {
    expect(describeGoogleApiError(DENIED, "ga4")).toContain("phần key là đúng");
  });

  it("lỗi lạ thì giữ nguyên văn, không đoán bừa lời khuyên", () => {
    expect(describeGoogleApiError("Quota exceeded for quota metric", "ga4")).toBe(
      "Quota exceeded for quota metric",
    );
  });

  it("nhận cả biến thể SERVICE_DISABLED của Google", () => {
    expect(describeGoogleApiError("SERVICE_DISABLED", "ga4")).toContain("Chưa bật");
  });
});
