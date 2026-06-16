"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { useLumiaTheme } from "@/components/theme/lumia-theme-provider";
import { NotificationSettingsSection } from "@/components/dashboard/notification-settings-section";
import type { OnboardingGoal } from "@/lib/supabase/types";
import type { LumiaTheme } from "@/lib/lumia-theme";

const goalOptions: { id: OnboardingGoal; label: string }[] = [
  { id: "sleep", label: "Ngủ tốt hơn" },
  { id: "stress", label: "Giảm stress" },
  { id: "meditation", label: "Tập thiền" },
];

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
      className="flex w-full items-center justify-between rounded-[20px] border border-[var(--border)] bg-[var(--surface-card)] px-4 py-4 text-left"
    >
      <span className="text-sm text-[var(--foreground)]">{label}</span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-[var(--green)]" : "bg-gray-300 dark:bg-white/25"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </span>
    </button>
  );
}

export function SettingsPanel({
  initialGoal,
  userName,
  userEmail,
}: {
  initialGoal: OnboardingGoal | null;
  userName: string;
  userEmail: string;
}) {
  const router = useRouter();
  const { theme, setTheme } = useLumiaTheme();
  const [state, setState] = useState(initialState);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  const [saved, setSaved] = useState("Đã đồng bộ thiết lập gần nhất.");
  const [responseStyle, setResponseStyle] = useState<(typeof responseOptions)[number]>(responseOptions[0]);
  const [showDanger, setShowDanger] = useState<null | "account" | "data">(null);
  const [goal, setGoal] = useState<OnboardingGoal | null>(initialGoal);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalSaving, setGoalSaving] = useState(false);
  const [nameVal, setNameVal] = useState(userName);
  const [nameSaving, setNameSaving] = useState(false);
  const [pwResetSent, setPwResetSent] = useState(false);

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

  async function saveName() {
    setNameSaving(true);
    await fetch("/api/me/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: nameVal }),
    });
    setNameSaving(false);
    setSaved("Đã cập nhật tên.");
    setTimeout(() => setSaved("Đã đồng bộ thiết lập gần nhất."), 2000);
  }

  async function sendPasswordReset() {
    setPwResetSent(true);
    await fetch("/api/auth/reset-password", { method: "POST" });
  }

  async function saveGoal() {
    if (!goal) return;
    setGoalSaving(true);
    const response = await fetch("/api/me/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingGoal: goal }),
    });
    setGoalSaving(false);
    if (response.ok) {
      setEditingGoal(false);
      setSaved("Đã cập nhật mục tiêu.");
      window.setTimeout(() => setSaved("Đã đồng bộ thiết lập gần nhất."), 2200);
    }
  }

  const goalLabel = goalOptions.find((g) => g.id === goal)?.label ?? "Chưa chọn";

  return (
    <div className="relative space-y-6">
      <section className="dash-panel p-6">
        <span className="eyebrow">Giao diện</span>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Chọn chế độ sáng hoặc Midnight Blue. Lựa chọn của bạn được lưu trên thiết bị này.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {(["light", "dark"] as LumiaTheme[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTheme(option)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                theme === option
                  ? "bg-[var(--green)] text-white"
                  : "border border-[var(--border)] bg-[var(--surface-card)] text-[var(--foreground)]"
              }`}
            >
              {option === "dark" ? "Midnight Blue (Tối)" : "Light Mode (Sáng)"}
            </button>
          ))}
        </div>
      </section>

      <section className="dash-panel p-6">
        <span className="eyebrow">Mục tiêu của tôi</span>
        {!editingGoal ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-[var(--foreground)]">{goalLabel}</p>
            <button type="button" onClick={() => setEditingGoal(true)} className="button-secondary text-[13px]">
              Thay đổi
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {goalOptions.map((option) => (
              <label
                key={option.id}
                className={`flex cursor-pointer items-center gap-3 rounded-[20px] border px-4 py-3 transition ${
                  goal === option.id
                    ? "border-[var(--green)] bg-[var(--green-wash)]"
                    : "border-[var(--border)] bg-[var(--surface-card)]"
                }`}
              >
                <input
                  type="radio"
                  name="goal"
                  checked={goal === option.id}
                  onChange={() => setGoal(option.id)}
                />
                <span className="text-sm text-[var(--foreground)]">{option.label}</span>
              </label>
            ))}
            <div className="flex gap-3">
              <button type="button" onClick={saveGoal} disabled={goalSaving} className="button-primary text-[13px]">
                {goalSaving ? "Đang lưu..." : "Lưu"}
              </button>
              <button type="button" onClick={() => setEditingGoal(false)} className="button-secondary text-[13px]">
                Huỷ
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="dash-panel p-6">
        <span className="eyebrow">Báo thức thông minh</span>
        <p className="mb-5 mt-2 text-[13px] text-[var(--muted)]">
          LUMIA nhắc bạn theo routine - giờ ngủ, check-in sáng và bảo vệ streak.
        </p>
        <NotificationSettingsSection />
      </section>

      {sections.map((section) => (
        <section key={section.title} className="dash-panel p-6">
          <span className="eyebrow">{section.title}</span>
          <div className="mt-5 space-y-3">
            {section.items.map((item) => (
              <Toggle key={item.key} label={item.label} checked={state[item.key]} onChange={() => toggle(item.key)} />
            ))}
          </div>
        </section>
      ))}

      <section className="dash-panel p-6">
        <span className="eyebrow">Cá nhân hóa</span>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input
            defaultValue="21:30"
            className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-card)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--green-wash)]"
            placeholder="Thời điểm thường dùng LUMIA"
          />
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)] p-4">
            <p className="text-sm font-medium text-[var(--foreground)]">Cách LUMIA phản hồi</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {responseOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setResponseStyle(option)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    responseStyle === option
                      ? "bg-[var(--green)] text-white"
                      : "border border-[var(--border)] bg-[var(--surface-card)] text-[var(--foreground)]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="dash-panel p-6">
        <span className="eyebrow">Tài khoản</span>
        <div className="mt-5 space-y-3">
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Họ tên</label>
            <input
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--surface-card)] px-4 py-3 text-[14px] text-[var(--foreground)] outline-none focus:border-[var(--green)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Email</label>
            <input
              value={userEmail}
              disabled
              className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[14px] text-[var(--muted)] outline-none opacity-70"
            />
          </div>
          {nameVal !== userName && (
            <button type="button" onClick={saveName} disabled={nameSaving} className="button-primary text-[13px]">
              {nameSaving ? "Đang lưu..." : "Lưu tên"}
            </button>
          )}
        </div>
      </section>

      <section className="dash-panel p-6">
        <span className="eyebrow">Bảo mật</span>
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between rounded-[18px] border border-[var(--border)] bg-[var(--surface-card)] px-4 py-4">
            <div>
              <p className="text-[14px] font-medium text-[var(--foreground)]">Mật khẩu</p>
              <p className="text-[12px] text-[var(--muted)]">Thay đổi mật khẩu đăng nhập</p>
            </div>
            <button
              type="button"
              onClick={sendPasswordReset}
              disabled={pwResetSent}
              className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[13px] font-medium text-[var(--foreground)] transition hover:border-[var(--green)] disabled:opacity-60"
            >
              {pwResetSent ? "Đã gửi email ✓" : "Đổi mật khẩu"}
            </button>
          </div>
          <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-card)] px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[14px] font-medium text-[var(--foreground)]">Phiên đăng nhập</p>
                <p className="mt-0.5 text-[12px] text-[var(--muted)]">Bạn đang đăng nhập trên thiết bị này.</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex shrink-0 items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-[13px] font-medium text-red-500 transition hover:bg-red-100 active:opacity-70 disabled:opacity-50 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
              >
                <LogOut className="h-3.5 w-3.5" />
                {loggingOut ? "Đang thoát..." : "Đăng xuất"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="dash-panel p-6">
        <span className="eyebrow">Vùng cần xác nhận</span>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => setShowDanger("data")} className="button-secondary">
            Xóa toàn bộ dữ liệu cảm xúc
          </button>
          <button type="button" onClick={() => setShowDanger("account")} className="button-secondary">
            Xóa tài khoản
          </button>
        </div>
        <p className="mt-4 text-sm text-[var(--muted)]">{saved}</p>
      </section>

      {showDanger ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[32px] border border-[var(--border)] bg-[var(--surface-card)] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
            <h3 className="font-serif text-3xl text-[var(--foreground)]">
              {showDanger === "account" ? "Xóa tài khoản?" : "Xóa dữ liệu cảm xúc?"}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
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
