export function getTimeGreeting(date = new Date()): string {
  const hour = date.getHours();

  if (hour >= 1 && hour < 4) return "Sao bạn vẫn chưa ngủ";
  if (hour >= 5 && hour < 11) return "Chào buổi sáng";
  if (hour >= 11 && hour < 12) return "Chào buổi trưa";
  if (hour >= 13 && hour < 18) return "Chào buổi chiều";
  if (hour >= 19 || hour === 0) return "Chào buổi tối";
  return "Chào buổi tối";
}

export function getDashboardGreeting(name: string, date = new Date()): string {
  const hour = date.getHours();
  const firstName = name.trim().split(/\s+/).at(-1) ?? name;
  if (hour >= 1 && hour < 4) {
    return `Sao ${firstName} vẫn chưa ngủ... 🌙`;
  }
  return `${getTimeGreeting(date)}, ${firstName} 👋`;
}
