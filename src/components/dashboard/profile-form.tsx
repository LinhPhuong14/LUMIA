"use client";

import { useState } from "react";

type ProfileFormProps = {
  name: string;
  bio?: string;
  sleepGoal?: string;
  wakeGoal?: string;
};

export function ProfileForm({ name, bio = "", sleepGoal = "", wakeGoal = "" }: ProfileFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setMessage(null);
    setError(null);

    const response = await fetch("/api/me/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        bio: formData.get("bio"),
        sleepGoal: formData.get("sleepGoal"),
        wakeGoal: formData.get("wakeGoal"),
      }),
    });

    const result = (await response.json()) as { message?: string; error?: string };

    if (!response.ok) {
      setError(result.error ?? "Không thể cập nhật hồ sơ lúc này.");
      return;
    }

    setMessage(result.message ?? "Đã lưu thay đổi.");
  }

  return (
    <form action={onSubmit} className="soft-card flex flex-col gap-4 p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Hồ sơ dịu lành</p>
        <h3 className="mt-2 font-serif text-2xl text-matcha-deep">Điều chỉnh nhịp sinh hoạt</h3>
      </div>
      <input name="name" defaultValue={name} className="rounded-2xl border border-matcha-deep/10 bg-white px-4 py-3 outline-none ring-matcha-deep/20 focus:ring-4" />
      <textarea name="bio" defaultValue={bio} rows={3} className="rounded-2xl border border-matcha-deep/10 bg-white px-4 py-3 outline-none ring-matcha-deep/20 focus:ring-4" placeholder="Bạn muốn LUMIA ghi nhớ điều gì về mình?" />
      <div className="grid gap-3 md:grid-cols-2">
        <input name="sleepGoal" defaultValue={sleepGoal} className="rounded-2xl border border-matcha-deep/10 bg-white px-4 py-3 outline-none ring-matcha-deep/20 focus:ring-4" placeholder="Giờ ngủ mong muốn, ví dụ 22:30" />
        <input name="wakeGoal" defaultValue={wakeGoal} className="rounded-2xl border border-matcha-deep/10 bg-white px-4 py-3 outline-none ring-matcha-deep/20 focus:ring-4" placeholder="Giờ dậy mong muốn, ví dụ 06:30" />
      </div>
      <button type="submit" className="button-primary w-fit">
        Lưu thay đổi
      </button>
      {message ? <p className="text-sm text-matcha-deep">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
