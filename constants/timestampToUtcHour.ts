function timestampToLocalUtcHour(timestamp: number): number {
  const date = new Date(timestamp);
  return date.getHours();
}

export { timestampToLocalUtcHour };
