function checkObjectKeys<T extends object>(obj: T, keys: (keyof T)[]): boolean {
  return keys.every((key) => key in obj && obj[key] !== undefined);
}

export { checkObjectKeys };
