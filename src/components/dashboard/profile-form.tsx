"use client";

import { useState } from "react";
import { validateName, validateTimeGoal } from "@/lib/validators";

type ProfileFormProps = {
  name: string;
  bio?: string;
  sleepGoal?: string;
  wakeGoal?: string;
};

function FieldError({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return <p className="mt-1 text-[12px] text-red-500">{msg}</p>;
}

const baseCls = "rounded-2xl border bg-white px-4 py-3 outline-none ring-matcha-deep/20 focus:ring-4 w-full transition";
function inputCls(err: string | null) {
  return `${baseCls} ${err ? "border-red-400 focus:ring-red-200" : "border-matcha-deep/10"}`;
}

export function ProfileForm({ name, bio = "", sleepGoal = "", wakeGoal = "" }: ProfileFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [nameVal, setNameVal] = useState(name);
  const [bioVal, setBioVal] = useState(bio);
  const [sleepVal, setSleepVal] = useState(sleepGoal);
  const [wakeVal, setWakeVal] = useState(wakeGoal);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  function touch(f: string) { setTouched(t => ({ ...t, [f]: true })); }

  const nameErr = touched.name ? validateName(nameVal) : null;
  const sleepErr = touched.sleep ? validateTimeGoal(sleepVal) : null;
  const wakeErr = touched.wake ? validateTimeGoal(wakeVal) : null;
  const bioChars = bioVal.length;
  const bioErr = touched.bio && bioChars > 500 ? `Mô tả quá dài (${bioChars}/500 ký tự).` : null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    setTouched({ name: true, sleep: true, wake: true, bio: true });
    if (validateName(nameVal) || validateTimeGoal(sleepVal) || validateTimeGoal(wakeVal) || bioChars > 500) return;

    const response = await fetch("/api/me/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameVal, bio: bioVal, sleepGoal: sleepVal, wakeGoal: wakeVal }),
    });

    const result = (await response.json()) as { message?: string; error?: string };

    if (!response.ok) {
      setError(result.error ?? "Không thể cập nhật hồ sơ lúc này.");
      return;
    }

    setMessage(result.message ?? "Đã lưu thay đổi.");
  }

  return (
    <form onSubmit={onSubmit} className="soft-card flex flex-col gap-4 p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Hồ sơ dịu lành</p>
        <h3 className="mt-2 font-serif text-2xl text-matcha-deep">Điều chỉnh nhịp sinh hoạt</h3>
      </div>

      <div>
        <input
          value={nameVal}
          onChange={e => setNameVal(e.target.value)}
          onBlur={() => touch("name")}
          placeholder="Họ và tên *"
          className={inputCls(nameErr)}
        />
        <FieldError msg={nameErr} />
      </div>

      <div>
        <textarea
          value={bioVal}
          onChange={e => setBioVal(e.target.value)}
          onBlur={() => touch("bio")}
          rows={3}
          className={inputCls(bioErr)}
          placeholder="Bạn muốn LUMIA ghi nhớ điều gì về mình? (tối đa 500 ký tự)"
        />
        <div className="flex items-start justify-between">
          <FieldError msg={bioErr} />
          <span className={`ml-auto text-[11px] ${bioChars > 500 ? "text-red-500" : "text-[var(--muted)]"}`}>
            {bioChars}/500
          </span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <input
            value={sleepVal}
            onChange={e => setSleepVal(e.target.value)}
            onBlur={() => touch("sleep")}
            placeholder="Giờ ngủ mong muốn, ví dụ 22:30"
            className={inputCls(sleepErr)}
          />
          <FieldError msg={sleepErr} />
        </div>
        <div>
          <input
            value={wakeVal}
            onChange={e => setWakeVal(e.target.value)}
            onBlur={() => touch("wake")}
            placeholder="Giờ dậy mong muốn, ví dụ 06:30"
            className={inputCls(wakeErr)}
          />
          <FieldError msg={wakeErr} />
        </div>
      </div>

      <button type="submit" className="button-primary w-fit">
        Lưu thay đổi
      </button>
      {message ? <p className="text-sm text-matcha-deep">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
