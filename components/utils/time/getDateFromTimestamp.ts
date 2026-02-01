function getDateFromTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString().split("T")[0];
}

export { getDateFromTimestamp };
