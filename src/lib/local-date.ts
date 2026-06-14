const DEFAULT_TZ = "Asia/Ho_Chi_Minh";

/** YYYY-MM-DD theo timezone (mặc định VN) */
export function localDateString(date = new Date(), timeZone = DEFAULT_TZ): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(date);
}

export function buildLocalLastNDays(n: number, end = new Date(), timeZone = DEFAULT_TZ): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(end);
    d.setDate(d.getDate() - (n - 1 - i));
    return localDateString(d, timeZone);
  });
}
