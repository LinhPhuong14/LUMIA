"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { validateName } from "@/lib/validators";

import { useLumiaTheme } from "@/components/theme/lumia-theme-provider";
import { NotificationSettingsSection } from "@/components/dashboard/notification-settings-section";
import type { OnboardingData, OnboardingGoal } from "@/lib/supabase/types";
import type { LumiaTheme } from "@/lib/lumia-theme";

// Must stay in sync with MOTIVATION_OPTIONS in src/app/(standalone)/onboarding/page.tsx.
const goalOptions: { id: OnboardingGoal; label: string }[] = [
  { id: "peace", label: "Tìm kiếm sự bình yên" },
  { id: "sleep", label: "Cải thiện giấc ngủ" },
  { id: "habit", label: "Xây dựng thói quen" },
  { id: "self_care", label: "Khám phá chăm sóc bản thân" },
  { id: "sharing", label: "Tìm không gian chia sẻ" },
];

// Older accounts may still carry the original enum values; used for display only.
const legacyGoalLabels: Partial<Record<OnboardingGoal, string>> = {
  stress: "Giảm stress",
  meditation: "Tập thiền",
};

// The remaining onboarding answers, editable here so users are never sent back
// through onboarding just to change their mind. Values must stay in sync with
// src/app/(standalone)/onboarding/page.tsx.
const bedtimeOptions = [
  { value: "before_22", label: "Trước 22:00" },
  { value: "22_23", label: "22:00 – 23:00" },
  { value: "23_00", label: "23:00 – 00:00" },
  { value: "after_00", label: "Sau 00:00" },
];

const sleepQualityOptions = [
  { value: 1, label: "😴 Rất kém" },
  { value: 2, label: "😕 Chưa tốt" },
  { value: 3, label: "🙂 Tạm ổn" },
  { value: 4, label: "😊 Khá tốt" },
  { value: 5, label: "✨ Rất tốt" },
];

const recentMoodOptions = [
  { value: "balanced", label: "😌 Thoải mái và cân bằng" },
  { value: "slightly_stressed", label: "😤 Hơi căng thẳng" },
  { value: "anxious", label: "😟 Lo âu thường xuyên" },
  { value: "unmotivated", label: "😶 Thiếu động lực" },
  { value: "dysregulated", label: "🌀 Khó kiểm soát cảm xúc" },
];

const companionModeOptions = [
  { value: "digital", label: "Người bạn số" },
  { value: "master", label: "Người dẫn dắt" },
];

function PillGroup<T extends string | number>({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: { value: T; label: string }[];
  selected: T | null | undefined;
  onSelect: (value: T) => void;
}) {
  return (
    <div>
      <p className="text-[12px] font-semibold text-[var(--muted)]">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`rounded-full px-3.5 py-2 text-[12px] font-medium transition ${
              selected === option.value
                ? "bg-[var(--green)] text-white"
                : "border border-[var(--border)] bg-[var(--surface-card)] text-[var(--foreground)]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

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
      className="flex w-full items-center justify-between rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 text-left transition hover:border-[var(--green)]/40"
    >
      <span className="text-[13px] text-[var(--foreground)]">{label}</span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-[var(--green)]" : "bg-gray-300 dark:bg-white/20"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </span>
    </button>
  );
}

export function SettingsPanel({
  initialGoal,
  userName,
  initialNickname,
  userEmail,
  initialOnboardingData,
}: {
  initialGoal: OnboardingGoal | null;
  userName: string;
  initialNickname: string | null;
  userEmail: string;
  initialOnboardingData: OnboardingData | null;
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
  const [nameTouched, setNameTouched] = useState(false);
  const nameErr = nameTouched ? validateName(nameVal) : null;
  const [nickVal, setNickVal] = useState(initialNickname ?? "");
  const [nickSaving, setNickSaving] = useState(false);
  const [pwResetSent, setPwResetSent] = useState(false);
  const [habits, setHabits] = useState<OnboardingData>(initialOnboardingData ?? {});
  const [habitsSaving, setHabitsSaving] = useState(false);
  // Backfilled by migration 025 rather than chosen by the user — worth saying so.
  const habitsWereGuessed = initialOnboardingData?.autofilled === true;

  const toggleSections = useMemo(
    () => [
      {
        title: "Quyền riêng tư",
        desc: "Kiểm soát dữ liệu LUMIA lưu về bạn.",
        items: [
          { key: "saveChats" as const, label: "Lưu lịch sử LUMIA lắng nghe" },
          { key: "saveJournal" as const, label: "Lưu nhật ký" },
          { key: "allowSummary" as const, label: "Cho phép LUMIA tóm tắt nhật ký" },
        ],
      },
      {
        title: "Thông báo",
        desc: "Nhắc nhở theo thói quen hàng ngày.",
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
    router.refresh();
    setTimeout(() => setSaved("Đã đồng bộ thiết lập gần nhất."), 2000);
  }

  async function saveNickname() {
    const trimmed = nickVal.trim();
    if (!trimmed) return;
    setNickSaving(true);
    await fetch("/api/me/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: trimmed }),
    });
    setNickSaving(false);
    setSaved("Đã cập nhật biệt danh.");
    // Refresh so greetings / chatbot pick up the new nickname immediately.
    router.refresh();
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

  async function saveHabits(patch: Partial<OnboardingData>) {
    const next = { ...habits, ...patch, autofilled: false };
    setHabits(next);
    setHabitsSaving(true);
    const response = await fetch("/api/me/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingData: { ...patch, autofilled: false } }),
    });
    setHabitsSaving(false);
    if (response.ok) {
      setSaved("Đã cập nhật thói quen.");
      window.setTimeout(() => setSaved("Đã đồng bộ thiết lập gần nhất."), 2200);
    }
  }

  const goalLabel =
    goalOptions.find((g) => g.id === goal)?.label ??
    (goal ? legacyGoalLabels[goal] : undefined) ??
    "Chưa chọn";

  return (
    <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">

      {/* ── Row 1: Giao diện + Mục tiêu (cùng là tuỳ chọn cá nhân) ── */}

      <section className="dash-panel p-5">
        <span className="eyebrow">Giao diện</span>
        <p className="mt-2 text-[13px] text-[var(--muted)]">
          Chế độ sáng hoặc Midnight Blue. Lưu trên thiết bị này.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["light", "dark"] as LumiaTheme[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTheme(option)}
              className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                theme === option
                  ? "bg-[var(--green)] text-white"
                  : "border border-[var(--border)] bg-[var(--surface-card)] text-[var(--foreground)]"
              }`}
            >
              {option === "dark" ? "🌙 Midnight Blue" : "☀️ Light Mode"}
            </button>
          ))}
        </div>
      </section>

      <section className="dash-panel p-5">
        <span className="eyebrow">Mục tiêu của tôi</span>
        {!editingGoal ? (
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[13px] text-[var(--foreground)]">{goalLabel}</p>
            <button type="button" onClick={() => setEditingGoal(true)} className="button-secondary text-[12px]">
              Thay đổi
            </button>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {goalOptions.map((option) => (
              <label
                key={option.id}
                className={`flex cursor-pointer items-center gap-3 rounded-[16px] border px-4 py-2.5 transition ${
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
                <span className="text-[13px] text-[var(--foreground)]">{option.label}</span>
              </label>
            ))}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={saveGoal} disabled={goalSaving} className="button-primary text-[12px]">
                {goalSaving ? "Đang lưu..." : "Lưu"}
              </button>
              <button type="button" onClick={() => setEditingGoal(false)} className="button-secondary text-[12px]">
                Huỷ
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Thói quen cá nhân: các câu trả lời onboarding, sửa được bất cứ lúc nào ── */}

      <section className="dash-panel p-5 md:col-span-2">
        <span className="eyebrow">Thói quen cá nhân</span>
        <p className="mt-2 text-[13px] text-[var(--muted)]">
          {habitsWereGuessed
            ? "Chúng tôi đã điền sẵn dựa trên hoạt động của bạn. Chỉnh lại bất cứ lúc nào để LUMIA hiểu bạn hơn."
            : "Điều chỉnh bất cứ lúc nào — LUMIA dùng những thông tin này để cá nhân hoá gợi ý."}
        </p>

        <div className="mt-4 space-y-4">
          <PillGroup
            label="Bạn thường đi ngủ lúc nào?"
            options={bedtimeOptions}
            selected={habits.bedtime}
            onSelect={(value) => saveHabits({ bedtime: value })}
          />
          <PillGroup
            label="Chất lượng giấc ngủ gần đây"
            options={sleepQualityOptions}
            selected={habits.sleepQuality}
            onSelect={(value) => saveHabits({ sleepQuality: value })}
          />
          <PillGroup
            label="Cảm xúc gần đây của bạn"
            options={recentMoodOptions}
            selected={habits.recentMood}
            onSelect={(value) => saveHabits({ recentMood: value })}
          />
          <PillGroup
            label="Bạn muốn LUMIA đồng hành như thế nào?"
            options={companionModeOptions}
            selected={habits.companionMode}
            onSelect={(value) => saveHabits({ companionMode: value })}
          />
        </div>

        {habitsSaving && <p className="mt-3 text-[12px] text-[var(--muted)]">Đang lưu...</p>}
      </section>

      {/* ── Row 2: Báo thức thông minh — full width ── */}

      <section className="dash-panel p-5 md:col-span-2">
        <span className="eyebrow">Báo thức thông minh</span>
        <p className="mb-4 mt-2 text-[13px] text-[var(--muted)]">
          LUMIA nhắc bạn theo routine — giờ ngủ, check-in sáng và bảo vệ streak.
        </p>
        <NotificationSettingsSection />
      </section>

      {/* ── Row 3: Quyền riêng tư + Thông báo (cùng là toggle groups) ── */}

      {toggleSections.map((section) => (
        <section key={section.title} className="dash-panel p-5">
          <span className="eyebrow">{section.title}</span>
          <p className="mt-1.5 text-[12px] text-[var(--muted)]">{section.desc}</p>
          <div className="mt-4 space-y-2">
            {section.items.map((item) => (
              <Toggle key={item.key} label={item.label} checked={state[item.key]} onChange={() => toggle(item.key)} />
            ))}
          </div>
        </section>
      ))}

      {/* ── Row 4: Cá nhân hóa — full width ── */}

      <section className="dash-panel p-5 md:col-span-2">
        <span className="eyebrow">Cá nhân hóa</span>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
              Thời điểm thường dùng LUMIA
            </label>
            <input
              defaultValue="21:30"
              type="time"
              className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--surface-card)] px-4 py-3 text-[14px] text-[var(--foreground)] outline-none focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--green-wash)]"
            />
          </div>
          <div>
            <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
              Cách LUMIA phản hồi với bạn
            </label>
            <div className="flex flex-wrap gap-2">
              {responseOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setResponseStyle(option)}
                  className={`rounded-full px-3 py-2 text-[12px] transition ${
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

      {/* ── Row 5: Tài khoản + Bảo mật (cùng về account/login) ── */}

      <section className="dash-panel p-5">
        <span className="eyebrow">Tài khoản</span>
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
              LUMIA gọi bạn là
            </label>
            <input
              value={nickVal}
              onChange={(e) => setNickVal(e.target.value)}
              placeholder="Ví dụ: Linh, Minh, An..."
              className="w-full rounded-[16px] border border-[var(--border)] bg-[var(--surface-card)] px-4 py-2.5 text-[13px] text-[var(--foreground)] outline-none focus:border-[var(--green)]"
            />
            <p className="mt-1 text-[11px] text-[var(--muted)]">
              Tên này được dùng cho lời chào và khi LUMIA trò chuyện với bạn.
            </p>
            {nickVal.trim() && nickVal.trim() !== (initialNickname ?? "") && (
              <button
                type="button"
                onClick={saveNickname}
                disabled={nickSaving}
                className="button-primary mt-2 text-[12px] disabled:opacity-60"
              >
                {nickSaving ? "Đang lưu..." : "Lưu biệt danh"}
              </button>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Họ tên</label>
            <input
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              onBlur={() => setNameTouched(true)}
              className={`w-full rounded-[16px] border bg-[var(--surface-card)] px-4 py-2.5 text-[13px] text-[var(--foreground)] outline-none focus:border-[var(--green)] ${nameErr ? "border-red-400" : "border-[var(--border)]"}`}
            />
            {nameErr && <p className="mt-1 text-[12px] text-red-500">{nameErr}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Email</label>
            <input
              value={userEmail}
              disabled
              className="w-full rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-[13px] text-[var(--muted)] outline-none opacity-70"
            />
          </div>
          {nameVal !== userName && (
            <button type="button" onClick={() => { setNameTouched(true); if (!validateName(nameVal)) saveName(); }} disabled={nameSaving || !!nameErr} className="button-primary text-[12px] disabled:opacity-60">
              {nameSaving ? "Đang lưu..." : "Lưu tên"}
            </button>
          )}
        </div>
      </section>

      <section className="dash-panel p-5">
        <span className="eyebrow">Bảo mật</span>
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <div>
              <p className="text-[13px] font-medium text-[var(--foreground)]">Mật khẩu</p>
              <p className="text-[11px] text-[var(--muted)]">Thay đổi mật khẩu đăng nhập</p>
            </div>
            <button
              type="button"
              onClick={sendPasswordReset}
              disabled={pwResetSent}
              className="rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-3 py-1.5 text-[12px] font-medium text-[var(--foreground)] transition hover:border-[var(--green)] disabled:opacity-60"
            >
              {pwResetSent ? "Đã gửi ✓" : "Đổi mật khẩu"}
            </button>
          </div>
          <div className="flex items-center justify-between rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <div>
              <p className="text-[13px] font-medium text-[var(--foreground)]">Phiên đăng nhập</p>
              <p className="text-[11px] text-[var(--muted)]">Đăng nhập trên thiết bị này</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[12px] font-medium text-red-500 transition hover:bg-red-100 active:opacity-70 disabled:opacity-50 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
            >
              <LogOut className="h-3 w-3" />
              {loggingOut ? "Đang thoát..." : "Đăng xuất"}
            </button>
          </div>
        </div>
      </section>

      {/* ── Row 6: Vùng nguy hiểm — full width, standalone ── */}

      <section className="dash-panel p-5 md:col-span-2">
        <span className="eyebrow text-red-400 dark:text-red-400">Vùng cần xác nhận</span>
        <p className="mt-1.5 text-[12px] text-[var(--muted)]">
          Các thao tác này không thể hoàn tác. Hãy chắc chắn trước khi tiếp tục.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowDanger("data")}
              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-[13px] font-medium text-red-500 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
            >
              Xóa dữ liệu cảm xúc
            </button>
            <button
              type="button"
              onClick={() => setShowDanger("account")}
              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-[13px] font-medium text-red-500 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
            >
              Xóa tài khoản
            </button>
          </div>
          <p className="text-[12px] text-[var(--muted)]">{saved}</p>
        </div>
      </section>

      {/* ── Danger confirm modal ── */}
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
