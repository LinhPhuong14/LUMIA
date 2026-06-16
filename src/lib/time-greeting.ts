function getVNHour(date = new Date()): number {
  // Vietnam is UTC+7; use Intl to get the local hour reliably on server and client
  return parseInt(
    new Intl.DateTimeFormat("vi-VN", { hour: "numeric", hour12: false, timeZone: "Asia/Ho_Chi_Minh" }).format(date),
    10,
  );
}

export function getTimeGreeting(date = new Date()): string {
  const hour = getVNHour(date);

  if (hour >= 1 && hour < 5) return "Chào đêm khuya";
  if (hour >= 5 && hour < 11) return "Chào buổi sáng";
  if (hour >= 11 && hour < 13) return "Chào buổi trưa";
  if (hour >= 13 && hour < 19) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export function getDashboardGreeting(name: string, date = new Date()): string {
  const hour = getVNHour(date);
  const firstName = name.trim().split(/\s+/).at(-1) ?? name;

  if (hour >= 1 && hour < 5) {
    return `Sao ${firstName} vẫn chưa ngủ... 🌙`;
  }
  return `${getTimeGreeting(date)}, ${firstName} 👋`;
}
