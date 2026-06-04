"use client";

import { useMemo, useState } from "react";

type ToggleKey =
  | "saveChats"
  | "saveJournal"
  | "allowSummary"
  | "eveningReminder"
  | "journalReminder"
  | "returnReminder";

const initialState: Record<ToggleKey, boolean> = {
  saveChats: true,
  saveJournal: true,
  allowSummary: false,
  eveningReminder: true,
  journalReminder: true,
  returnReminder: false,
};

const responseOptions = ["Rất nhẹ nhàng", "Gợi mở bằng câu hỏi", "Trực tiếp hơn một chút"] as const;

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-center justify-between rounded-[24px] border border-white/70 bg-white/82 px-4 py-4 text-left"
    >
      <span className="text-sm text-matcha-deep">{label}</span>
      <span className={`relative h-7 w-12 rounded-full transition ${checked ? "bg-matcha" : "bg-matcha-soft"}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${checked ? "left-6" : "left-1"}`} />
      </span>
    </button>
  );
}

export function SettingsPanel() {
  const [state, setState] = useState(initialState);
  const [saved, setSaved] = useState("Đã đồng bộ thiết lập gần nhất.");
  const [responseStyle, setResponseStyle] = useState<(typeof responseOptions)[number]>(responseOptions[0]);
  const [showDanger, setShowDanger] = useState<null | "account" | "data">(null);

  const sections = useMemo(
    () => [
      {
        title: "Quyền riêng tư",
        items: [
          { key: "saveChats" as const, label: "Lưu lịch sử LUMIA lắng nghe" },
          { key: "saveJournal" as const, label: "Lưu nhật ký" },
          { key: "allowSummary" as const, label: "Cho phép LUMIA tóm tắt nhật ký" },
        ],
      },
      {
        title: "Thông báo",
        items: [
          { key: "eveningReminder" as const, label: "Nhắc ghi nhận buổi tối" },
          { key: "journalReminder" as const, label: "Nhắc viết nhật ký" },
          { key: "returnReminder" as const, label: "Nhắc quay lại sau vài ngày không hoạt động" },
        ],
      },
    ],
    [],
  );

  function toggle(key: ToggleKey) {
    setState((current) => ({ ...current, [key]: !current[key] }));
    setSaved("Đã lưu thay đổi.");
    window.setTimeout(() => setSaved("Đã đồng bộ thiết lập gần nhất."), 1800);
  }

  return (
    <div className="relative space-y-6">
      <section className="soft-card p-6">
        <span className="eyebrow">Thông tin cá nhân</span>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            defaultValue="Linh Nguyễn"
            className="rounded-[22px] border border-matcha-soft bg-white px-4 py-3 outline-none ring-matcha/20 focus:ring-4"
          />
          <input
            defaultValue="hello@lumia.vn"
            className="rounded-[22px] border border-matcha-soft bg-white px-4 py-3 outline-none ring-matcha/20 focus:ring-4"
          />
        </div>
      </section>

      {sections.map((section) => (
        <section key={section.title} className="soft-card p-6">
          <span className="eyebrow">{section.title}</span>
          <div className="mt-5 space-y-3">
            {section.items.map((item) => (
              <Toggle key={item.key} label={item.label} checked={state[item.key]} onChange={() => toggle(item.key)} />
            ))}
          </div>
        </section>
      ))}

      <section className="soft-card p-6">
        <span className="eyebrow">Cá nhân hóa</span>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input
            defaultValue="21:30"
            className="rounded-[22px] border border-matcha-soft bg-white px-4 py-3 outline-none ring-matcha/20 focus:ring-4"
            placeholder="Thời điểm thường dùng LUMIA"
          />
          <div className="rounded-[24px] border border-white/70 bg-white/82 p-4">
            <p className="text-sm font-medium text-matcha-deep">Cách LUMIA phản hồi</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {responseOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setResponseStyle(option)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    responseStyle === option
                      ? "bg-matcha text-white"
                      : "border border-matcha-soft bg-white text-matcha-deep"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="soft-card p-6">
        <span className="eyebrow">Vùng cần xác nhận</span>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => setShowDanger("data")} className="button-secondary">
            Xóa toàn bộ dữ liệu cảm xúc
          </button>
          <button type="button" onClick={() => setShowDanger("account")} className="button-secondary">
            Xóa tài khoản
          </button>
        </div>
        <p className="mt-4 text-sm text-muted">{saved}</p>
      </section>

      {showDanger ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/48 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[32px] border border-white/70 bg-white/94 p-7 shadow-[0_24px_80px_rgba(244,216,120,0.22)]">
            <h3 className="font-serif text-3xl text-matcha-deep">
              {showDanger === "account" ? "Xóa tài khoản?" : "Xóa dữ liệu cảm xúc?"}
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              Đây là bước cần xác nhận lại thật kỹ. Bạn luôn có thể quay lại sau nếu chưa sẵn sàng.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => setShowDanger(null)} className="button-primary">
                Mình cần nghĩ thêm
              </button>
              <button type="button" onClick={() => setShowDanger(null)} className="button-secondary">
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
