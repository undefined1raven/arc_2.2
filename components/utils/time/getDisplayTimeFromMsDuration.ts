function getDisplayTimeFromMsDuration(
  ms: number,
  options: { showSeconds?: boolean } = {}
): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const remainingSeconds = seconds % 60;
  const remainingMinutes = minutes % 60;
  const remainingHours = hours % 24;

  let displayTime = "";

  if (days > 0) {
    displayTime += `${days}d `;
  }
  if (remainingHours > 0 || days > 0) {
    displayTime += `${remainingHours}h `;
  }
  if (remainingMinutes > 0 || remainingHours > 0 || days > 0) {
    displayTime += `${remainingMinutes}m `;
  }

  if (options.showSeconds && remainingSeconds > 0) {
    displayTime += `${remainingSeconds}s`;
  }

  return displayTime.trim();
}

export { getDisplayTimeFromMsDuration };
