"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Trạng thái gói thành viên, phát từ khung ứng dụng xuống.
 *
 * Vì sao cần: layout của App Router không truyền prop xuống được cho trang con.
 * Ba trang (Nhật ký, Hành trình, Thiền định) cần `isActive` để khoá tính năng
 * premium, nên trước đây mỗi trang tự chạy lại `requireSession()` +
 * `getSubscriptionSnapshot()` — ba vòng gọi mạng nữa cho một giá trị boolean mà
 * khung ở ngay trên đã có sẵn, và chạy lại ở MỖI lần chuyển tab.
 *
 * Khung đã là client component và nằm ở layout (được giữ trong Router Cache khi
 * điều hướng), nên phát bằng context là lấy đúng một lần rồi dùng lại.
 */
const SubscriptionContext = createContext<{ isActive: boolean }>({ isActive: false });

export function SubscriptionProvider({
  isActive,
  children,
}: {
  isActive: boolean;
  children: ReactNode;
}) {
  return (
    <SubscriptionContext.Provider value={{ isActive }}>{children}</SubscriptionContext.Provider>
  );
}

/** Mặc định `false` khi dùng ngoài provider — thiếu quyền thì khoá, không mở. */
export function useIsSubscriptionActive(): boolean {
  return useContext(SubscriptionContext).isActive;
}
