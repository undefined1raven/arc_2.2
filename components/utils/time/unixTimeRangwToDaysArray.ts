function getDaysInRange(startUnix: number, endUnix: number): string[] {
  const days: string[] = [];
  const current = new Date(startUnix);
  const end = new Date(endUnix);

  current.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    days.push(current.toDateString());

    current.setDate(current.getDate() + 1);
  }

  return days;
}

export { getDaysInRange };
