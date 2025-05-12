function getValueByKeys(obj: any, keys: string[]): any {
  return keys.reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

export { getValueByKeys };
