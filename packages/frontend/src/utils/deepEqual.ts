function isObject(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null;
}

export const deepEqual = (
  obj1: unknown,
  obj2: unknown,
  visited = new WeakMap<object, object>()
): boolean => {
  if (obj1 === obj2) return true;
  if (!isObject(obj1) || !isObject(obj2)) return false;
  if (visited.has(obj1)) return visited.get(obj1) === obj2;
  visited.set(obj1, obj2);
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key], visited)) return false;
  }
  return true;
};