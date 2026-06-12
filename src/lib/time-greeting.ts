export function getTimeGreeting(date = new Date()): string {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) return "Chào buổi sáng";
  if (hour >= 12 && hour < 18) return "Chào buổi chiều";
  if (hour >= 18 && hour < 22) return "Chào buổi tối";
  return "Chào đêm khuya";
}

export function getDashboardGreeting(name: string, date = new Date()): string {
  return `${getTimeGreeting(date)}, ${name} 👋`;
}
