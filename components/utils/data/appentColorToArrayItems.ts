function appendColorToArrayItems<T, K extends string>(
  colorSet: string[],
  array: T[],
  colorKey: K
): (T & Record<K, string>)[] {
  if (colorSet.length === 0) {
    throw new Error("Color set cannot be empty");
  }

  const usedRandomColors = new Set<string>();

  const generateRandomHexColor = (): string => {
    let color: string;
    do {
      color =
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0");
    } while (usedRandomColors.has(color));

    usedRandomColors.add(color);
    return color;
  };

  return array.map((item, index) => {
    const color =
      index < colorSet.length ? colorSet[index] : generateRandomHexColor();

    return {
      ...item,
      [colorKey]: color,
    } as T & Record<K, string>;
  });
}

export { appendColorToArrayItems };
